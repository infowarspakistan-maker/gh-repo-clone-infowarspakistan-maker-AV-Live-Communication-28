import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, ChevronRight, Check, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('avlive_cookie_consent');
    if (!savedConsent) {
      // Delay showing the banner for a better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
      } catch (e) {
        setIsVisible(true);
      }
    }

    const handleOpenSettings = () => {
      setShowSettings(true);
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = { necessary: true, analytics: false, marketing: false };
    saveConsent(allRejected);
  };

  const handleSaveSettings = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('avlive_cookie_consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    // Dispatch event for other parts of the app to react (e.g., GTM, Analytics)
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot toggle necessary
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 md:p-8 pointer-events-none">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden pointer-events-auto"
          >
            <div className="p-6 md:p-8">
              {!showSettings ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#00B4D8]/10 flex items-center justify-center shrink-0">
                    <Cookie className="text-[#00B4D8]" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-[#1A2B4C] mb-2 tracking-tight">We respect your privacy</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                      We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our <Link to="/privacy-policy" className="text-[#00B4D8] font-bold hover:underline">Privacy Policy</Link> for more details.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex-1 md:flex-none px-6 py-3 text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <SettingsIcon size={14} />
                      Customize
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 md:flex-none px-6 py-3 bg-gray-100 text-[#1A2B4C] rounded-xl text-xs font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 md:flex-none px-8 py-3 bg-[#1A2B4C] text-white rounded-xl text-xs font-black hover:bg-[#00B4D8] transition-all shadow-lg shadow-[#1A2B4C]/10 uppercase tracking-widest"
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowSettings(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#1A2B4C]"
                      >
                        <X size={20} />
                      </button>
                      <h3 className="text-xl font-black text-[#1A2B4C] tracking-tight">Cookie Settings</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Necessary */}
                    <div className="p-5 rounded-2xl border-2 border-[#00B4D8]/10 bg-[#00B4D8]/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-black text-xs text-[#00B4D8] uppercase tracking-widest">Necessary</div>
                        <div className="text-[10px] font-black text-[#00B4D8] bg-white px-2 py-0.5 rounded-full uppercase tracking-widest">Always On</div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        Essential for the website to function properly, such as security, network management, and accessibility.
                      </p>
                    </div>

                    {/* Analytics */}
                    <button
                      onClick={() => togglePreference('analytics')}
                      className={`p-5 rounded-2xl border-2 transition-all text-left group ${
                        preferences.analytics 
                          ? 'border-[#00B4D8]/10 bg-[#00B4D8]/5' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`font-black text-xs uppercase tracking-widest ${preferences.analytics ? 'text-[#00B4D8]' : 'text-gray-400'}`}>Analytics</div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.analytics ? 'bg-[#00B4D8]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.analytics ? 'left-6' : 'left-1'}`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Help us understand how visitors interact with the website, providing information about areas visited and time spent.
                      </p>
                    </button>

                    {/* Marketing */}
                    <button
                      onClick={() => togglePreference('marketing')}
                      className={`p-5 rounded-2xl border-2 transition-all text-left group ${
                        preferences.marketing 
                          ? 'border-[#00B4D8]/10 bg-[#00B4D8]/5' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`font-black text-xs uppercase tracking-widest ${preferences.marketing ? 'text-[#00B4D8]' : 'text-gray-400'}`}>Marketing</div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.marketing ? 'bg-[#00B4D8]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.marketing ? 'left-6' : 'left-1'}`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Used to track visitors across websites to display ads that are relevant and engaging for the individual user.
                      </p>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-6 py-3 text-xs font-black text-[#1A2B4C] hover:text-[#00B4D8] transition-colors uppercase tracking-widest"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="px-8 py-3 bg-[#1A2B4C] text-white rounded-xl text-xs font-black hover:bg-[#00B4D8] transition-all shadow-lg shadow-[#1A2B4C]/10 uppercase tracking-widest flex items-center gap-2"
                    >
                      Save Preferences
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
