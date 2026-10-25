import React, { useState, useEffect } from 'react';
import { Conversation, UserProfile } from '../../types';
import { subscribeConversations } from '../../firebase/chatService';
import { Avatar } from '../common/Avatar';
import { Search, MessageSquarePlus, Clock, CheckCheck, Check } from 'lucide-react';

interface ChatsListProps {
  currentUser: UserProfile;
  onSelectConversation: (conversation: Conversation) => void;
  onOpenNewChat: () => void;
  showSearchBar?: boolean;
}

export const ChatsList: React.FC<ChatsListProps> = ({
  currentUser,
  onSelectConversation,
  onOpenNewChat,
  showSearchBar = true,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeConversations(currentUser.uid, (data) => {
      setConversations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  const formatTimestamp = (isoDate?: string): string => {
    if (!isoDate) return '';
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      if (isYesterday) {
        return 'Yesterday';
      }
      // If within last 6 days
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 7) {
        return d.toLocaleDateString([], { weekday: 'short' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    const otherUid = conv.participantUids.find((id) => id !== currentUser.uid) || conv.participantUids[0];
    return (
      conv.participantMap?.[otherUid] || {
        uid: otherUid,
        displayName: 'Contact',
        isOnline: false,
      }
    );
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    const other = getOtherParticipant(c);
    const matchesName = other.displayName?.toLowerCase().includes(term);
    const matchesUsername = other.username?.toLowerCase().includes(term);
    const matchesMsg = c.lastMessage?.content?.toLowerCase().includes(term);
    return matchesName || matchesUsername || matchesMsg;
  });

  return (
    <div className="w-full flex-1 flex flex-col pb-20">
      {/* Search Input Bar */}
      {showSearchBar && (
        <div className="px-4 py-2.5">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 text-sm focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-900/60">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-400 space-y-3">
            <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-sm mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 mb-4">
              <MessageSquarePlus className="w-7 h-7 stroke-[1.5]" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  No chats found
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                  No conversations match "{searchQuery}".
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  No conversations yet
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                  Start your first conversation with registered friends or discover contacts.
                </p>
                <button
                  onClick={onOpenNewChat}
                  className="py-2.5 px-5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Start New Conversation</span>
                </button>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isUnread =
              conv.lastMessage &&
              conv.lastMessage.senderUid !== currentUser.uid &&
              (!conv.lastMessage.readBy || !conv.lastMessage.readBy.includes(currentUser.uid));

            const isLastMessageFromMe = conv.lastMessage?.senderUid === currentUser.uid;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 active:bg-neutral-100 dark:active:bg-neutral-900 transition-colors cursor-pointer select-none"
              >
                {/* Avatar with presence */}
                <Avatar
                  src={other.photoURL}
                  name={other.displayName}
                  size="md"
                  isOnline={Boolean(other.isOnline)}
                  showPresence={true}
                />

                {/* Conversation Preview Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {other.displayName}
                    </h4>
                    <span className="text-[11px] text-neutral-400 whitespace-nowrap shrink-0">
                      {formatTimestamp(conv.lastMessage?.createdAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 min-w-0 text-xs">
                      {isLastMessageFromMe && (
                        <span className="text-neutral-400 shrink-0">
                          {conv.lastMessage?.readBy && conv.lastMessage.readBy.length > 1 ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                      <p
                        className={`truncate ${
                          isUnread
                            ? 'text-neutral-950 dark:text-white font-medium'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {isUnread && (
                      <span className="w-2.5 h-2.5 bg-black dark:bg-white rounded-full shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
