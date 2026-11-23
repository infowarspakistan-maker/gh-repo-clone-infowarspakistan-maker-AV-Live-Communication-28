import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Trash2,
  Search,
  Lock,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase/client';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface DeletionStatusRecord {
  code: string;
  status: 'completed' | 'pending_verification';
  source: string;
  scope?: string;
  requestedAt: string;
  completedAt?: string;
}

export function UserDataDeletion() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userProfile, isAuthenticated, logout } = useAuth();

  const initialCode = searchParams.get('code') || '';
  const [lookupCode, setLookupCode] = useState(initialCode);
  const [lookupResult, setLookupResult] = useState<DeletionStatusRecord | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const [fullName, setFullName] = useState('');
  const [emailOrFbId, setEmailOrFbId] = useState('');
  const [scope, setScope] = useState('Facebook Login & Profile Data');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selfDeleting, setSelfDeleting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (userProfile?.displayName && !fullName) {
      setFullName(userProfile.displayName);
    }
    if ((userProfile?.email || user?.email) && !emailOrFbId) {
      setEmailOrFbId(userProfile?.email || user?.email || '');
    }
  }, [user, userProfile]);

  const checkDeletionStatus = async (codeToCheck: string) => {
    const clean = codeToCheck.trim();
    if (!clean) return;
    setLookingUp(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const res = await fetch(`/api/facebook/data-deletion/status?code=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok || !data?.record) {
        setLookupError(
          data?.error ||
            'No deletion ticket was found for that code in the current session. If you received a code previously, contact info@avlive.com.pk for confirmation.'
        );
      } else {
        setLookupResult(data.record);
      }
    } catch {
      setLookupError('Unable to check deletion status right now. Please try again.');
    } finally {
      setLookingUp(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      checkDeletionStatus(initialCode);
    }
  }, [initialCode]);

  const submitDeletionRecord = async (payload: {
    name: string;
    identifier: string;
    deletionScope: string;
    details: string;
  }): Promise<string> => {
    const res = await fetch('/api/data-deletion-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data?.confirmationCode) {
      throw new Error(data?.error || 'Could not submit data deletion request.');
    }

    // Persist an audit inquiry ticket in Firestore so staff always retain a durable record
    try {
      await addDoc(collection(db, 'inquiries'), {
        fullName: payload.name.slice(0, 200),
        organization: 'User Data Deletion',
        email: payload.identifier.includes('@') ? payload.identifier.slice(0, 200) : 'privacy@avlive.com.pk',
        phone: '0321 425 6263',
        subject: `Data Deletion [${data.confirmationCode}]`.slice(0, 200),
        message: `Scope: ${payload.deletionScope}\nIdentifier: ${payload.identifier}\nNotes: ${payload.details || 'None'}`.slice(0, 5000),
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch {
      // Non-fatal; server confirmation code already generated
    }

    return String(data.confirmationCode);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setConfirmationCode('');
    setSubmitting(true);
    try {
      const code = await submitDeletionRecord({
        name: fullName.trim(),
        identifier: emailOrFbId.trim(),
        deletionScope: scope,
        details: notes.trim(),
      });
      setConfirmationCode(code);
      setLookupCode(code);
      setSearchParams({ code });
      await checkDeletionStatus(code);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit deletion request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelfServiceDeletion = async () => {
    if (!user) return;
    setFormError('');
    setSelfDeleting(true);
    try {
      // 1. Revoke Meta Facebook permissions if active in browser SDK
      if (typeof window !== 'undefined' && window.FB) {
        await new Promise<void>((resolve) => {
          try {
            window.FB!.getLoginStatus((statusRes) => {
              if (statusRes?.status === 'connected') {
                window.FB!.api('/me/permissions', 'delete' as any, () => resolve());
              } else {
                resolve();
              }
            });
          } catch {
            resolve();
          }
        });
      }

      // 2. Deactivate user profile in Firestore (preserves owner-allowed fields under firestore.rules)
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            isActive: false,
            displayName: 'Deleted User',
            photoURL: null,
            phoneNumber: null,
            deletionRequestedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch {
        // Non-fatal if offline or guest
      }

      // 3. Log verified deletion ticket & sign out
      const code = await submitDeletionRecord({
        name: userProfile?.displayName || user.displayName || 'Signed-In Member',
        identifier: userProfile?.email || user.email || user.uid,
        deletionScope: 'Signed-In Account & Facebook Login Data',
        details: `Self-service immediate profile deactivation and Facebook permission revocation for UID ${user.uid}.`,
      });

      await logout();
      setConfirmationCode(code);
      setLookupCode(code);
      setSearchParams({ code });
      await checkDeletionStatus(code);
    } catch (err: any) {
      setFormError(err?.message || 'Could not complete self-service deletion.');
    } finally {
      setSelfDeleting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#f8f9fa] pb-16">
      <SEO
        title="User Data Deletion & Account Removal | AV Live Pakistan"
        description="Instructions and self-service portal to delete your AV Live Communications account, Facebook Login profile data, or check a Meta data deletion confirmation code."
        url="https://avlive.com.pk/user-data-deletion"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': 'https://avlive.com.pk/user-data-deletion#webpage',
              name: 'User Data Deletion Instructions & Status Portal — AV Live Communications',
              url: 'https://avlive.com.pk/user-data-deletion',
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avlive.com.pk' },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'User Data Deletion',
                  item: 'https://avlive.com.pk/user-data-deletion',
                },
              ],
            },
          ],
        }}
      />

      <div className="bg-[#1A2B4C] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">User Data Deletion</h1>
          <p className="text-gray-300">
            Facebook Login, Account Data Removal &amp; Confirmation Status Portal · Last Updated: November 22, 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-8">
        {/* Status Lookup Card (Used by Meta Data Deletion Callback URL ?code=...) */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#00B4D8]" size={22} />
            <h2 className="text-xl font-black text-[#1A2B4C]">
              Check Data Deletion Request Status
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            Enter your confirmation code (for example, from Meta Facebook Login settings or a previously submitted privacy request) to verify deletion status.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (lookupCode.trim()) {
                setSearchParams({ code: lookupCode.trim() });
                checkDeletionStatus(lookupCode.trim());
              }
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="e.g. AVLIVE-DEL-8F3A19C20B11"
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
            />
            <button
              type="submit"
              disabled={lookingUp || !lookupCode.trim()}
              className="px-6 py-3 rounded-xl bg-[#1A2B4C] text-white text-xs font-black uppercase tracking-wider hover:bg-[#00B4D8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {lookingUp ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              Check Status
            </button>
          </form>

          {lookupResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Confirmation Code: <code className="font-mono">{lookupResult.code}</code> —{' '}
                <span className="uppercase">{lookupResult.status.replace('_', ' ')}</span>
              </div>
              <div className="text-xs text-emerald-800">
                Source: {lookupResult.source} · Requested: {new Date(lookupResult.requestedAt).toLocaleString()}
                {lookupResult.scope ? ` · Scope: ${lookupResult.scope}` : ''}
              </div>
            </div>
          )}

          {lookupError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{lookupError}</span>
            </div>
          )}
        </section>

        {/* Signed-in Self-Service Removal */}
        {isAuthenticated && user && (
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-black text-[#1A2B4C]">
                  Immediate Self-Service Removal (Signed-In Account)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Currently signed in as <strong>{userProfile?.email || user.email || user.uid}</strong>. Clicking below revokes Facebook Login permissions, clears your active profile details, logs your deletion confirmation code, and signs you out.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSelfServiceDeletion}
                disabled={selfDeleting}
                className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {selfDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Revoke Access &amp; Delete Profile Data
              </button>
            </div>
          </section>
        )}

        {/* Main Instructions & Request Form */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-10">
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="lead text-xl text-[#1A2B4C] font-medium mb-6">
              AV Live Communications (avlive.com.pk) respects your right to delete any personal data collected through our website, Firebase Authentication, Google Sign-In, or Facebook Login.
            </p>

            <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">
              1. How to Remove AV Live from Your Facebook Account
            </h2>
            <p>
              If you connected using <strong>Facebook Login</strong> and wish to revoke permissions and delete associated social login data directly from Meta:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-6">
              <li>
                Open your Facebook account and navigate to <strong>Settings &amp; Privacy → Settings</strong>.
              </li>
              <li>
                Select <strong>Apps and Websites</strong> (or <strong>Security and Login → Apps and Websites</strong>) in the left-hand menu.
              </li>
              <li>
                Locate <strong>AV Live Communications</strong> in the active apps list and click <strong>Remove</strong>.
              </li>
              <li>
                Confirm removal. If you also click <strong>Send Data Deletion Request</strong> inside Facebook, Meta automatically notifies our callback endpoint and issues a confirmation code you can verify above.
              </li>
            </ol>

            <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">
              2. What Data Is Deleted vs. Retained by Law
            </h2>
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[#1A2B4C]">
                    <th className="border border-gray-200 px-4 py-3 text-left font-bold">Data Category</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-bold">Deletion Action</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-bold">Completion Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 font-semibold">
                      Facebook Login Profile &amp; Tokens
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      Name, avatar URL, email, and OAuth/Page tokens revoked and purged
                    </td>
                    <td className="border border-gray-200 px-4 py-3">Immediate (up to 24 hours)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 font-semibold">
                      Quote Requests, Room Designs &amp; Inquiries
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      Permanently erased from active CRM &amp; Firebase collections upon verified request
                    </td>
                    <td className="border border-gray-200 px-4 py-3">Within 7 business days</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 font-semibold">
                      FBR GST Invoices &amp; Statutory Tax Records
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      Restricted &amp; retained only for completed commercial purchases as required by Pakistan tax law
                    </td>
                    <td className="border border-gray-200 px-4 py-3">5-year statutory audit window</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-black text-[#1A2B4C] mt-8 mb-4">
              3. Submit a Manual Data Deletion Request
            </h2>
            <p className="mb-6">
              Prefer our Data Protection team to erase your records manually? Submit the form below or email{' '}
              <a href="mailto:info@avlive.com.pk?subject=User%20Data%20Deletion%20Request" className="text-[#00B4D8] font-bold">
                info@avlive.com.pk
              </a>{' '}
              with the subject line <em>User Data Deletion Request</em>.
            </p>
          </div>

          <form onSubmit={handleRequestSubmit} className="space-y-5 border-t border-gray-100 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Account Email or Facebook User ID *
                </label>
                <input
                  type="text"
                  required
                  value={emailOrFbId}
                  onChange={(e) => setEmailOrFbId(e.target.value)}
                  placeholder="name@company.com or Facebook ID"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                Deletion Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
              >
                <option value="Facebook Login & Profile Data">Facebook Login &amp; Profile Data</option>
                <option value="Full AV Live Account, Inquiries & Quote History">
                  Full AV Live Account, Inquiries &amp; Quote History
                </option>
                <option value="Marketing & Newsletter Preferences Only">
                  Marketing &amp; Newsletter Preferences Only
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                Additional Verification Details (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include any order number, quote reference, or connected Facebook Page ID to expedite removal."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
              />
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {confirmationCode && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Deletion Request Registered — Code: <code className="font-mono">{confirmationCode}</code>
                </div>
                <p className="text-xs text-emerald-800">
                  Save this confirmation code to check deletion progress anytime on this page.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 rounded-2xl bg-[#1A2B4C] hover:bg-[#00B4D8] text-white text-xs font-black uppercase tracking-widest transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Submit Data Deletion Request
            </button>
          </form>

          <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap gap-4">
              <Link to="/privacy-policy" className="text-[#00B4D8] font-bold hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-[#00B4D8] font-bold hover:underline">
                Terms of Service
              </Link>
            </div>
            <Link to="/" className="inline-flex items-center text-[#00B4D8] font-bold hover:text-[#1A2B4C] transition-colors">
              Return to Homepage <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
