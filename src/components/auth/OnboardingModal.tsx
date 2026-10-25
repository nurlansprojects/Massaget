import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isUsernameAvailable } from '../../firebase/userService';
import { Avatar } from '../common/Avatar';
import { Check, AlertCircle, Loader2, User as UserIcon } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { currentUser, completeOnboarding } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Propose a default username from email or displayName
  useEffect(() => {
    if (currentUser?.email) {
      const handle = currentUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
      if (handle.length >= 3) {
        setUsername(handle.toLowerCase());
      }
    } else if (currentUser?.displayName) {
      const handle = currentUser.displayName.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
      if (handle.length >= 3) {
        setUsername(handle.toLowerCase());
      }
    }
  }, [currentUser]);

  // Debounced check for username
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setUsernameStatus('idle');
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 30 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameStatus('invalid');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(trimmed);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch (e) {
        console.error('Username check failed:', e);
        setUsernameStatus('idle');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!displayName.trim()) {
      setErrorMsg('Please enter your display name.');
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30 || !/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setErrorMsg('Username must be 3–30 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    if (usernameStatus === 'taken') {
      setErrorMsg('This username is already taken. Please choose another.');
      return;
    }

    setSubmitting(true);
    try {
      // Re-verify availability immediately prior to commit
      const available = await isUsernameAvailable(trimmedUsername);
      if (!available) {
        setErrorMsg('This username was just claimed. Please pick another.');
        setUsernameStatus('taken');
        return;
      }

      await completeOnboarding({
        displayName: displayName.trim(),
        username: trimmedUsername,
        bio: bio.trim(),
        photoURL,
      });
    } catch (err: unknown) {
      console.error('Onboarding failed:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Avatar src={photoURL} name={displayName || 'User'} size="xl" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Complete Your Profile</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Choose how you will appear to contacts on Massaget.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={64}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Username
              </label>
              {isCheckingUsername ? (
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> checking...
                </span>
              ) : usernameStatus === 'available' ? (
                <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" /> Available
                </span>
              ) : usernameStatus === 'taken' ? (
                <span className="text-[11px] text-red-500 font-medium">Already taken</span>
              ) : null}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 text-sm font-mono">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="alex123"
                maxLength={30}
                required
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-mono focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Letters, numbers, and underscores. Min 3 characters.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Bio (optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Hey there! I am using Massaget."
              maxLength={256}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-hidden focus:border-black dark:focus:border-white transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || usernameStatus === 'taken' || isCheckingUsername}
            className="w-full py-3.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Setting up account...</span>
              </>
            ) : (
              <span>Start Messaging</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
