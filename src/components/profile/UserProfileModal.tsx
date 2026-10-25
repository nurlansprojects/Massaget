import React, { useState } from 'react';
import { UserProfile, Conversation } from '../../types';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';
import {
  MessageSquare,
  Phone,
  Video,
  Copy,
  Check,
  ShieldAlert,
  Flag,
  Share2,
  Edit3,
  Loader2,
  LogOut,
} from 'lucide-react';
import { updateUserProfile, isUsernameAvailable } from '../../firebase/userService';
import { getOrCreateConversation } from '../../firebase/chatService';

interface UserProfileModalProps {
  user: UserProfile | { uid: string; displayName: string; photoURL?: string; username?: string; bio?: string; isOnline?: boolean };
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (conversation: Conversation) => void;
  onBlockUser?: (user: UserProfile) => void;
  onLogout?: () => void;
  onProfileUpdated?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUser,
  isOpen,
  onClose,
  onStartChat,
  onBlockUser,
  onLogout,
  onProfileUpdated,
}) => {
  const isOwnProfile = user.uid === currentUser.uid;

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editPhotoURL, setEditPhotoURL] = useState(currentUser.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleCopyUsername = () => {
    if (user.username) {
      navigator.clipboard.writeText(`@${user.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    const trimmedName = editName.trim();
    const trimmedUsername = editUsername.trim().toLowerCase();

    if (!trimmedName) {
      setEditError('Display name is required.');
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30 || !/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setEditError('Username must be 3–30 characters long with letters, numbers, or underscores.');
      return;
    }

    setSaving(true);
    try {
      if (trimmedUsername !== currentUser.username.toLowerCase()) {
        const available = await isUsernameAvailable(trimmedUsername, currentUser.uid);
        if (!available) {
          setEditError('This username is already taken by another user.');
          setSaving(false);
          return;
        }
      }

      await updateUserProfile(
        currentUser.uid,
        {
          displayName: trimmedName,
          username: trimmedUsername,
          bio: editBio.trim(),
          photoURL: editPhotoURL.trim(),
        },
        currentUser.username
      );

      setIsEditing(false);
      onProfileUpdated?.();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleMessage = async () => {
    if (isOwnProfile) return;
    try {
      const conv = await getOrCreateConversation(currentUser, user as UserProfile);
      onClose();
      onStartChat?.(conv);
    } catch (e) {
      console.error('Failed to start chat:', e);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
    }, 1500);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
        <div className="flex flex-col items-center pt-2">
          {/* Avatar with presence */}
          <div className="relative mb-4">
            <Avatar
              src={isOwnProfile ? currentUser.photoURL : user.photoURL}
              name={isOwnProfile ? currentUser.displayName : user.displayName}
              size="xxl"
              isOnline={Boolean(isOwnProfile ? currentUser.isOnline : user.isOnline)}
              showPresence={true}
            />
          </div>

          {/* Name & Online Status */}
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {isOwnProfile ? currentUser.displayName : user.displayName}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isOwnProfile || user.isOnline ? (
              <span className="text-emerald-500 font-medium">online</span>
            ) : (
              'offline'
            )}
          </p>

          {/* Action Row for other contacts */}
          {!isOwnProfile && (
            <div className="grid grid-cols-4 gap-2 w-full max-w-xs mt-6 mb-4">
              <button
                onClick={handleMessage}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer group"
              >
                <MessageSquare className="w-5 h-5 text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1">
                  Message
                </span>
              </button>

              <button
                onClick={() => alert('VoIP audio calling is scheduled for the next release.')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer group"
              >
                <Phone className="w-5 h-5 text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1">
                  Call
                </span>
              </button>

              <button
                onClick={() => alert('HD Video calling is scheduled for the next release.')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer group"
              >
                <Video className="w-5 h-5 text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1">
                  Video
                </span>
              </button>

              <button
                onClick={handleCopyUsername}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer group"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Share2 className="w-5 h-5 text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1">
                  {copied ? 'Copied' : 'Share'}
                </span>
              </button>
            </div>
          )}

          {/* Details / Edit Form */}
          <div className="w-full mt-4 space-y-3">
            {isOwnProfile && isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 w-full">
                {editError && (
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs">
                    {editError}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-neutral-400 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Photo URL (optional)
                  </label>
                  <input
                    type="url"
                    value={editPhotoURL}
                    onChange={(e) => setEditPhotoURL(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Username card */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900">
                  <div>
                    <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                      Username
                    </span>
                    <p className="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                      @{isOwnProfile ? currentUser.username : user.username || 'user'}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyUsername}
                    className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    title="Copy username"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Bio card */}
                {(isOwnProfile ? currentUser.bio : user.bio) && (
                  <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900">
                    <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                      Bio
                    </span>
                    <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-0.5 leading-relaxed">
                      {isOwnProfile ? currentUser.bio : user.bio}
                    </p>
                  </div>
                )}

                {/* Edit own profile button */}
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setEditName(currentUser.displayName);
                      setEditUsername(currentUser.username);
                      setEditBio(currentUser.bio || '');
                      setEditPhotoURL(currentUser.photoURL || '');
                      setIsEditing(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}

                {/* Other User Options */}
                {!isOwnProfile && (
                  <div className="pt-2 space-y-1">
                    {onBlockUser && (
                      <button
                        onClick={() => {
                          onBlockUser(user as UserProfile);
                          onClose();
                        }}
                        className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Block {user.displayName}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report User</span>
                    </button>
                  </div>
                )}

                {/* Logout button if own profile */}
                {isOwnProfile && onLogout && (
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report User">
        {reportSuccess ? (
          <div className="text-center py-6 space-y-2">
            <Check className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold">Report Received</h4>
            <p className="text-xs text-neutral-500">
              Thank you for keeping Massaget safe. Our moderation team will review this account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <p className="text-xs text-neutral-500">
              Select the reason for reporting @{user.username || user.displayName}:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { id: 'spam', label: 'Spam or unsolicited messages' },
                { id: 'harassment', label: 'Harassment or hate speech' },
                { id: 'impersonation', label: 'Impersonation or fake account' },
                { id: 'illegal', label: 'Inappropriate or illegal content' },
              ].map((reason) => (
                <label
                  key={reason.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={reportReason === reason.id}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="text-black dark:text-white"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs"
            >
              Submit Report
            </button>
          </form>
        )}
      </Modal>
    </>
  );
};
