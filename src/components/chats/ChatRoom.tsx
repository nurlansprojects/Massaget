import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, UserProfile } from '../../types';
import { subscribeMessages, sendMessage, markMessagesAsSeen } from '../../firebase/chatService';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';
import {
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Smile,
  Send,
  Image as ImageIcon,
  Check,
  CheckCheck,
  ShieldAlert,
  VolumeX,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ChatRoomProps {
  conversation: Conversation;
  currentUser: UserProfile;
  onBack: () => void;
  onOpenProfile: (user: UserProfile | { uid: string; displayName: string; photoURL?: string }) => void;
  onBlockUser?: (user: UserProfile) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '👏', '🎉', '😍', '🙏', '💯', '😊', '🚀', '👀', '✨', '👋'];

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversation,
  currentUser,
  onBack,
  onOpenProfile,
  onBlockUser,
}) => {
  const { chatBackground, textSize } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [callModalInfo, setCallModalInfo] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identify the other participant
  const otherUid =
    conversation.participantUids.find((id) => id !== currentUser.uid) ||
    conversation.participantUids[0];
  const otherUser = conversation.participantMap?.[otherUid] || {
    uid: otherUid,
    displayName: 'Contact',
    isOnline: false,
  };

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribeMessages(conversation.id, (incomingMessages) => {
      setMessages(incomingMessages);

      // Auto mark messages from the other user as seen
      const unreadFromOther = incomingMessages.filter(
        (msg) => msg.senderUid !== currentUser.uid && msg.readStatus !== 'seen'
      );
      if (unreadFromOther.length > 0) {
        markMessagesAsSeen(conversation.id, unreadFromOther, currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [conversation.id, currentUser.uid]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedPhoto]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedPhoto) || sending) return;

    const textToSend = inputText.trim();
    const photoToSend = selectedPhoto;

    setInputText('');
    setSelectedPhoto(null);
    setShowEmojiPicker(false);
    setSending(true);

    try {
      if (photoToSend) {
        await sendMessage(
          conversation.id,
          currentUser.uid,
          textToSend || 'Photo',
          'image',
          photoToSend
        );
      } else {
        await sendMessage(
          conversation.id,
          currentUser.uid,
          textToSend,
          'text'
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image to fit well within limits using HTML canvas
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setSelectedPhoto(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  const getTextSizeClass = () => {
    if (textSize === 'small') return 'text-xs';
    if (textSize === 'large') return 'text-base';
    return 'text-sm';
  };

  return (
    <div className="fixed inset-0 z-40 bg-white dark:bg-black text-neutral-900 dark:text-white flex flex-col">
      {/* Hidden file input for photos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Top Header */}
      <div className="px-3 py-2.5 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-900 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Back to chats"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            onClick={() => onOpenProfile(otherUser)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity min-w-0"
          >
            <Avatar
              src={otherUser.photoURL}
              name={otherUser.displayName}
              size="sm"
              isOnline={Boolean(otherUser.isOnline)}
              showPresence={true}
            />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate leading-tight">
                {otherUser.displayName}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                {otherUser.isOnline ? (
                  <span className="text-emerald-500 font-medium">online</span>
                ) : (
                  'offline'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCallModalInfo('Audio Call')}
            className="p-2 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCallModalInfo('Video Call')}
            className="p-2 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenProfile(otherUser);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    alert('Notifications muted for this conversation.');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 cursor-pointer"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Mute Notifications</span>
                </button>
                {onBlockUser && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onBlockUser(otherUser as UserProfile);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 cursor-pointer border-t border-neutral-100 dark:border-neutral-800 mt-1"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Block Contact</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message History Area */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-4 space-y-3.5 select-text ${
          chatBackground === 'mesh'
            ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 dark:from-neutral-950 via-white dark:via-black to-white dark:to-black'
            : chatBackground === 'slate'
            ? 'bg-neutral-100 dark:bg-[#0c0c0c]'
            : 'bg-white dark:bg-black'
        }`}
        onClick={() => {
          setShowEmojiPicker(false);
          setShowMoreMenu(false);
        }}
      >
        {/* Date Stamp */}
        <div className="flex justify-center my-3">
          <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 text-[11px] text-neutral-500 font-medium tracking-wide">
            Today
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 space-y-2">
            <p className="text-xs">No messages yet.</p>
            <p className="text-xs text-neutral-500">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUid === currentUser.uid;
            const isSeen = msg.readStatus === 'seen' || (msg.readBy && msg.readBy.length > 1);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-xs transition-colors break-words ${
                    isMe
                      ? 'bg-black dark:bg-white text-white dark:text-black rounded-br-xs'
                      : 'bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-800/80 rounded-bl-xs'
                  }`}
                >
                  {/* Image attachment if any */}
                  {msg.type === 'image' && msg.imageUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden cursor-pointer">
                      <img
                        src={msg.imageUrl}
                        alt="Shared image"
                        onClick={() => setPreviewImage(msg.imageUrl || null)}
                        className="w-full max-h-64 object-cover rounded-xl hover:opacity-95 transition-opacity"
                      />
                    </div>
                  )}

                  {/* Message Text */}
                  {msg.content && msg.content !== 'Photo' && (
                    <p className={`${getTextSizeClass()} leading-relaxed select-text`}>
                      {msg.content}
                    </p>
                  )}

                  {/* Timestamp & double check mark */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe
                        ? 'text-neutral-400 dark:text-neutral-600'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isMe && (
                      <span title={isSeen ? 'Seen' : 'Sent'} className="inline-flex items-center">
                        {isSeen ? (
                          <CheckCheck className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 stroke-[2.2]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 opacity-70" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected photo preview strip */}
      {selectedPhoto && (
        <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedPhoto}
              alt="Ready to send"
              className="w-12 h-12 rounded-lg object-cover border border-neutral-300 dark:border-neutral-700"
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Photo attached</span>
          </div>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="p-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Emoji Picker Drawer */}
      {showEmojiPicker && (
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-7 gap-2">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
              }}
              className="h-10 text-xl flex items-center justify-center rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-transform active:scale-125 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Fixed Message Composer */}
      <div className="p-2 sm:p-3 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-900 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Attach image"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="w-full pl-4 pr-10 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-sm focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
            />
            {/* Emoji toggle inside input */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedPhoto) || sending}
            className="p-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 cursor-pointer shadow-xs"
            title="Send"
          >
            <Send className="w-4 h-4 -rotate-45" />
          </button>
        </form>
      </div>

      {/* Call Informational Modal */}
      <Modal
        isOpen={Boolean(callModalInfo)}
        onClose={() => setCallModalInfo(null)}
        title={callModalInfo || 'Call'}
      >
        <div className="text-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-black dark:text-white">
            {callModalInfo === 'Video Call' ? (
              <Video className="w-8 h-8" />
            ) : (
              <Phone className="w-8 h-8" />
            )}
          </div>
          <h4 className="text-base font-semibold">
            {callModalInfo} with {otherUser.displayName}
          </h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            High-definition end-to-end encrypted voice & video calling is slated for the upcoming Massaget WebRTC release.
          </p>
          <button
            onClick={() => setCallModalInfo(null)}
            className="mt-4 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Understood
          </button>
        </div>
      </Modal>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Full size attachment"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
