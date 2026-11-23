import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { Lock, Mail, AlertCircle, Loader2, Facebook } from 'lucide-react';
import { ensureFacebookSdkReady } from '../../lib/facebook-sdk';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fbSdkReady, setFbSdkReady] = useState(false);
  const { login, signInWithGoogle, signInWithFacebook } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/overview';

  useEffect(() => {
    let mounted = true;
    ensureFacebookSdkReady()
      .then((res) => {
        if (mounted && res.ready) setFbSdkReady(true);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate(redirect);
    } catch (err: any) {
      console.error(err);
      setError('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithFacebook();
      navigate(redirect);
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/account-exists-with-different-credential') {
        setError(
          'An account with this email already exists via Google or password sign-in. Please sign in with that method first.'
        );
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError(
          'Facebook Login is not enabled in Firebase Authentication yet. Enable Facebook under Firebase Console → Authentication → Sign-in method.'
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Facebook sign-in popup was closed before completion.');
      } else {
        setError('Facebook authentication failed. Please verify your Meta App ID & Firebase Facebook provider settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
             <div className="inline-flex items-stretch mb-6">
                <div className="bg-black text-[#f0f0f0] font-black text-2xl px-3 py-1.5 leading-none tracking-tight">
                  AV
                </div>
                <div className="text-black font-black text-[28px] leading-none ml-2 flex items-center tracking-tight">
                  Live
                </div>
             </div>
             <h1 className="text-2xl font-black text-[#1A2B4C] uppercase tracking-wider mb-2">AV LIVE SIGN IN</h1>
             <p className="text-gray-500 text-sm font-medium">Enterprise &amp; Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/10 transition-all font-bold text-[#1A2B4C]"
                  required
                  placeholder="admin@avlive.com.pk"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/10 transition-all font-bold text-[#1A2B4C]"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-start gap-2"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A2B4C] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#00B4D8] transition-all shadow-xl shadow-[#1A2B4C]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Authenticating...
                </>
              ) : 'Sign In To Dashboard'}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-400">Or Continue With</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-gray-200 text-[#1A2B4C] py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <img loading="lazy" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Sign in with Google" title="Sign in with Google" />
                Sign In With Google
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={loading}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Facebook size={18} />
                Continue With Facebook
              </button>
            </div>

            {fbSdkReady && (
              <p className="text-[11px] text-center text-gray-400 font-medium">
                Meta JavaScript SDK active (AppEvents initialized).
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
