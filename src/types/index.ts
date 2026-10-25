export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  lastSeenAt: string;
  isOnline: boolean;
  themePreference?: 'light' | 'dark' | 'system';
  chatBackground?: string;
  textSize?: 'small' | 'medium' | 'large';
}

export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  readBy: string[];
  createdAt: string;
}

export interface ParticipantInfo {
  uid: string;
  displayName: string;
  username?: string;
  photoURL?: string;
  isOnline?: boolean;
}

export interface Conversation {
  id: string;
  participantUids: string[];
  participantMap: Record<string, ParticipantInfo>;
  lastMessage?: {
    content: string;
    senderUid: string;
    createdAt: string;
    type: 'text' | 'image';
    readBy?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlockedUserRecord {
  blockedUid: string;
  blockedAt: string;
  displayName?: string;
  username?: string;
}

export type ActiveTab = 'chats' | 'contacts' | 'settings';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TextSize = 'small' | 'medium' | 'large';
