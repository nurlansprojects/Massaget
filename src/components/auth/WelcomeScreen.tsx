import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Shield, Sparkles, Loader2 } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { login, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setIsSigningIn(true);
      await login();
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      const msg = err instanceof Error ? err.message : 'Google sign-in could not be completed.';
      if (msg.includes('network-request-failed')) {
        setAuthError('Connection failed. If you have an ad-blocker or tracking protection enabled, please pause it or try in a private window.');
      } else if (msg.includes('popup')) {
        setAuthError('Sign-in popup was cancelled or blocked by your browser.');
      } else {
        setAuthError(msg);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between items-center px-6 py-12 select-none overflow-hidden">
      {/* Subtle organic background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-neutral-900/60 rounded-full blur-[100px] pointer-events-none" />

      {/* Top spacing / status bar headroom */}
      <div className="w-full flex justify-end items-center max-w-md pt-2">
        <span className="text-xs text-neutral-500 tracking-wider font-mono">v1.0.0</span>
      </div>

      {/* Center Hero */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm text-center z-10 my-auto py-8">
        {/* Massaget White Script M Logo */}
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
          <img
            src="/assets/aistudio/Massagetlogo_cf6ac33d.png"
            alt="Massaget Logo"
            className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          />
        </div>

        {/* Wordmark */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Massaget
        </h1>

        {/* Tagline */}
        <p className="text-base font-medium text-neutral-300 tracking-wide mb-3">
          Connect. Chat. Share.
        </p>

        {/* Secondary description from UI sample */}
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mb-8">
          A modern, private messaging platform designed for effortless conversations with friends, family, and communities.
        </p>

        {/* Error notification if any */}
        {authError && (
          <div className="w-full mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs text-left animate-in fade-in">
            <p className="font-semibold mb-0.5">Authentication notice</p>
            <p className="text-red-300">{authError}</p>
          </div>
        )}

        {/* Primary Action Button: Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || isSigningIn}
          className="w-full py-4 px-6 rounded-full bg-white text-black font-semibold text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(255,255,255,0.18)] hover:bg-neutral-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-black" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Legal Links */}
      <div className="w-full max-w-sm flex items-center justify-center gap-4 text-xs text-neutral-500 z-10 pt-4 border-t border-neutral-900">
        <button
          onClick={() => setShowPrivacy(true)}
          className="hover:text-neutral-300 transition-colors cursor-pointer"
        >
          Privacy Policy
        </button>
        <span>·</span>
        <button
          onClick={() => setShowTerms(true)}
          className="hover:text-neutral-300 transition-colors cursor-pointer"
        >
          Terms of Service
        </button>
      </div>

      {/* Privacy Policy Modal */}
      <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p className="font-semibold text-neutral-900 dark:text-white">
            Your Privacy Matters at Massaget
          </p>
          <p>
            Massaget is architected with strict Attribute-Based Access Control and data protection. We only access your basic Google identity (name, email, and profile image) to authenticate your account and facilitate private conversations.
          </p>
          <p>
            1. <strong>Direct Conversations:</strong> Only you and your chat participants have access to read your message history.
          </p>
          <p>
            2. <strong>No Contact Scraping:</strong> Massaget never scrapes your device address book or accesses Google Contacts without permission.
          </p>
          <p>
            3. <strong>Data Storage:</strong> Messages and user metadata are stored securely on Google Cloud Firestore with granular per-document security rules.
          </p>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p className="font-semibold text-neutral-900 dark:text-white">
            Terms of Use
          </p>
          <p>
            By signing in to Massaget, you agree to treat other users with respect and not use the platform for unlawful, harassing, abusive, or harmful communications.
          </p>
          <p>
            Users are solely responsible for content transmitted through their accounts. Massaget reserves the right to suspend accounts that violate safety guidelines or abuse platform quotas.
          </p>
        </div>
      </Modal>
    </div>
  );
};
