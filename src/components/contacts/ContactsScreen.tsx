import React, { useState, useEffect } from 'react';
import { UserProfile, Conversation } from '../../types';
import { searchUsers } from '../../firebase/userService';
import { getOrCreateConversation } from '../../firebase/chatService';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';
import {
  Search,
  Users,
  Radio,
  Lock,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Loader2,
  UserCheck,
} from 'lucide-react';

interface ContactsScreenProps {
  currentUser: UserProfile;
  onSelectConversation: (conversation: Conversation) => void;
  onOpenProfile: (user: UserProfile) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  currentUser,
  onSelectConversation,
  onOpenProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChatWithUid, setStartingChatWithUid] = useState<string | null>(null);
  const [featureModal, setFeatureModal] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchContacts = async () => {
      setLoading(true);
      try {
        const results = await searchUsers(searchTerm, currentUser.uid);
        if (!isCancelled) {
          setUsers(results);
        }
      } catch (e) {
        console.error('Failed to load contacts:', e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchContacts();

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, currentUser.uid]);

  const handleStartChat = async (targetUser: UserProfile) => {
    setStartingChatWithUid(targetUser.uid);
    try {
      const conv = await getOrCreateConversation(currentUser, targetUser);
      onSelectConversation(conv);
    } catch (e) {
      console.error('Failed to start chat:', e);
    } finally {
      setStartingChatWithUid(null);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-24 overflow-y-auto">
      {/* Search Bar */}
      <div className="px-4 py-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts by name or @username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-sm focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
          />
        </div>
      </div>

      {/* Quick Action Rows from Mockup */}
      {!searchTerm && (
        <div className="px-4 py-2 space-y-1 mb-2">
          <button
            onClick={() => setFeatureModal('New Group')}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  New Group
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Create a shared group conversation
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => setFeatureModal('New Channel')}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  New Channel
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Broadcast updates to subscribers
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => setFeatureModal('New Secret Chat')}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  New Secret Chat
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Encrypted ephemeral chat with self-destruct timer
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="px-5 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Contacts ({users.length})
        </h3>
      </div>

      {/* Contacts List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-900/60">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-400 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-400" />
            <p>Finding registered contacts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 px-6 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto text-neutral-400 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              No contacts found
            </h4>
            <p className="text-xs text-neutral-500">
              {searchTerm
                ? `No user matches "${searchTerm}".`
                : 'No other registered users yet. Share Massaget with a friend or test with a second Google account!'}
            </p>
          </div>
        ) : (
          users.map((user) => {
            const isStarting = startingChatWithUid === user.uid;

            return (
              <div
                key={user.uid}
                className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                {/* Contact info: tap to view profile */}
                <div
                  onClick={() => onOpenProfile(user)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none"
                >
                  <Avatar
                    src={user.photoURL}
                    name={user.displayName}
                    size="md"
                    isOnline={Boolean(user.isOnline)}
                    showPresence={true}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {user.displayName}
                    </h4>
                    <p className="text-xs text-neutral-500 truncate font-mono">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* Direct message button */}
                <button
                  onClick={() => handleStartChat(user)}
                  disabled={isStarting}
                  className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer active:scale-95 disabled:opacity-50 ml-2"
                  title="Message"
                >
                  {isStarting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Feature notice modal */}
      <Modal
        isOpen={Boolean(featureModal)}
        onClose={() => setFeatureModal(null)}
        title={featureModal || 'Feature'}
      >
        <div className="text-center py-4 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-black dark:text-white">
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold">{featureModal}</h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Multi-participant channels, groups, and ephemeral chats are rolling out in the next scheduled Massaget backend update.
          </p>
          <button
            onClick={() => setFeatureModal(null)}
            className="mt-4 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </Modal>
    </div>
  );
};
