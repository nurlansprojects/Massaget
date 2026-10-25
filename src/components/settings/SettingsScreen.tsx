import React, { useState, useEffect } from 'react';
import { UserProfile, BlockedUserRecord } from '../../types';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';
import { AppearanceSettings } from './AppearanceSettings';
import {
  ChevronRight,
  User,
  Shield,
  Bell,
  HardDrive,
  Palette,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { getBlockedUsers, unblockUser, updatePresence } from '../../firebase/userService';

interface SettingsScreenProps {
  currentUser: UserProfile;
  onOpenProfile: () => void;
  onLogout: () => void;
}

type SubView = 'none' | 'appearance' | 'privacy' | 'notifications' | 'storage' | 'about';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  onOpenProfile,
  onLogout,
}) => {
  const [activeSubView, setActiveSubView] = useState<SubView>('none');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [blockedList, setBlockedList] = useState<BlockedUserRecord[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // In-app notification preferences
  const [inAppSounds, setInAppSounds] = useState(true);
  const [messagePreviews, setMessagePreviews] = useState(true);

  // Privacy preference
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(currentUser.isOnline ?? true);

  useEffect(() => {
    if (activeSubView === 'privacy') {
      loadBlocked();
    }
  }, [activeSubView]);

  const loadBlocked = async () => {
    setLoadingBlocked(true);
    try {
      const list = await getBlockedUsers(currentUser.uid);
      setBlockedList(list);
    } catch (e) {
      console.warn('Could not load blocked users:', e);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (blockedUid: string) => {
    try {
      await unblockUser(currentUser.uid, blockedUid);
      setBlockedList((prev) => prev.filter((b) => b.blockedUid !== blockedUid));
    } catch (e) {
      console.error('Failed to unblock:', e);
    }
  };

  const toggleOnlinePresence = async () => {
    const nextState = !onlineStatusVisible;
    setOnlineStatusVisible(nextState);
    await updatePresence(currentUser.uid, nextState);
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-24 overflow-y-auto">
      {/* Current User Card */}
      <div className="p-4">
        <div
          onClick={onOpenProfile}
          className="flex items-center justify-between p-4 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-850 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar
              src={currentUser.photoURL}
              name={currentUser.displayName}
              size="lg"
              isOnline={currentUser.isOnline}
              showPresence={true}
            />
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {currentUser.displayName}
              </h3>
              <p className="text-xs text-neutral-500 font-mono truncate">
                @{currentUser.username}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0" />
        </div>
      </div>

      {/* Main Settings Grouped List */}
      <div className="px-4 space-y-4">
        {/* Group 1 */}
        <div className="rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 divide-y divide-neutral-200/60 dark:divide-neutral-800/80 overflow-hidden">
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
              <User className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium">Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => setActiveSubView('privacy')}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
              <Shield className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium">Privacy & Security</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => setActiveSubView('notifications')}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
              <Bell className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => setActiveSubView('storage')}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
              <HardDrive className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium">Data and Storage</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Group 2 */}
        <div className="rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 divide-y divide-neutral-200/60 dark:divide-neutral-800/80 overflow-hidden">
          <button
            onClick={() => setActiveSubView('appearance')}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
              <Palette className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium">Appearance</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => alert('English is the primary supported interface language.')}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
              <Globe className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium">Language</span>
            </div>
            <span className="text-xs text-neutral-400">English</span>
          </button>
        </div>

        {/* Group 3 */}
        <div className="rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 divide-y divide-neutral-200/60 dark:divide-neutral-800/80 overflow-hidden">
          <button
            onClick={() => setActiveSubView('about')}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
              <Info className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium">About Massaget</span>
            </div>
            <span className="text-xs text-neutral-400">v1.0.0</span>
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Appearance Modal */}
      <Modal
        isOpen={activeSubView === 'appearance'}
        onClose={() => setActiveSubView('none')}
        title="Appearance"
      >
        <AppearanceSettings />
      </Modal>

      {/* Privacy & Security Modal */}
      <Modal
        isOpen={activeSubView === 'privacy'}
        onClose={() => setActiveSubView('none')}
        title="Privacy & Security"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Presence Status
            </h4>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900">
              <div>
                <p className="text-sm font-medium">Show Online Status</p>
                <p className="text-xs text-neutral-500">
                  Allow your contacts to see when you are active.
                </p>
              </div>
              <button
                onClick={toggleOnlinePresence}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  onlineStatusVisible ? 'bg-black dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black absolute top-0.5 transition-transform ${
                    onlineStatusVisible ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Blocked Contacts ({blockedList.length})
            </h4>
            {loadingBlocked ? (
              <p className="text-xs text-neutral-500">Loading blocked list...</p>
            ) : blockedList.length === 0 ? (
              <p className="text-xs text-neutral-500">You have not blocked any contacts.</p>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-2xl bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                {blockedList.map((b) => (
                  <div key={b.blockedUid} className="flex items-center justify-between p-3 text-xs">
                    <div>
                      <p className="font-semibold">{b.displayName || 'User'}</p>
                      <p className="text-neutral-500 font-mono">@{b.username || 'unknown'}</p>
                    </div>
                    <button
                      onClick={() => handleUnblock(b.blockedUid)}
                      className="px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium hover:bg-neutral-300 cursor-pointer"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        isOpen={activeSubView === 'notifications'}
        onClose={() => setActiveSubView('none')}
        title="Notifications"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900">
            <div>
              <p className="text-sm font-medium">In-App Sounds</p>
              <p className="text-xs text-neutral-500">Play subtle audio chime when receiving messages.</p>
            </div>
            <button
              onClick={() => setInAppSounds(!inAppSounds)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                inAppSounds ? 'bg-black dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white dark:bg-black absolute top-0.5 transition-transform ${
                  inAppSounds ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900">
            <div>
              <p className="text-sm font-medium">Message Previews</p>
              <p className="text-xs text-neutral-500">Show message text preview in conversation list.</p>
            </div>
            <button
              onClick={() => setMessagePreviews(!messagePreviews)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                messagePreviews ? 'bg-black dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white dark:bg-black absolute top-0.5 transition-transform ${
                  messagePreviews ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>

      {/* Data & Storage Modal */}
      <Modal
        isOpen={activeSubView === 'storage'}
        onClose={() => setActiveSubView('none')}
        title="Data and Storage"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 space-y-2">
            <p className="font-semibold text-sm">Local Cache</p>
            <p className="text-neutral-500">
              Massaget maintains offline sync and local conversation caching for instant responsiveness.
            </p>
            <button
              onClick={() => alert('Local cache cleared.')}
              className="mt-2 px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 font-semibold cursor-pointer"
            >
              Clear Cached Media
            </button>
          </div>
        </div>
      </Modal>

      {/* About Massaget Modal */}
      <Modal
        isOpen={activeSubView === 'about'}
        onClose={() => setActiveSubView('none')}
        title="About Massaget"
      >
        <div className="text-center py-4 space-y-4">
          <img
            src="/assets/aistudio/Massagetlogo_cf6ac33d.png"
            alt="Massaget Logo"
            className="w-16 h-16 object-contain mx-auto dark:invert-0 invert"
          />
          <div>
            <h4 className="text-lg font-bold">Massaget</h4>
            <p className="text-xs text-neutral-500">Version 1.0.0 (Production Build)</p>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            A simple, modern, private messaging platform built on Google Cloud Firebase and React.
          </p>
          <div className="pt-2 text-xs text-neutral-400">
            © 2026 Massaget. Connect. Chat. Share.
          </div>
        </div>
      </Modal>

      {/* Sign Out Confirmation Dialog */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center py-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Are you sure you want to sign out of Massaget?
          </p>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowLogoutConfirm(false);
                onLogout();
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
