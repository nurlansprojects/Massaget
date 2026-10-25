import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Conversation, Message, UserProfile } from '../types';

export function getDeterministicConversationId(uid1: string, uid2: string): string {
  const sorted = [uid1, uid2].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
}

export async function getOrCreateConversation(
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<Conversation> {
  const conversationId = getDeterministicConversationId(currentUser.uid, targetUser.uid);
  const path = `conversations/${conversationId}`;

  try {
    const docRef = doc(db, 'conversations', conversationId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      // Update participantMap if info changed
      const existingData = snap.data() as Conversation;
      const updatedMap = {
        ...existingData.participantMap,
        [currentUser.uid]: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          username: currentUser.username,
          photoURL: currentUser.photoURL,
          isOnline: currentUser.isOnline,
        },
        [targetUser.uid]: {
          uid: targetUser.uid,
          displayName: targetUser.displayName,
          username: targetUser.username,
          photoURL: targetUser.photoURL,
          isOnline: targetUser.isOnline,
        },
      };

      try {
        await updateDoc(docRef, { participantMap: updatedMap });
      } catch (e) {
        console.warn('Could not refresh participantMap:', e);
      }

      return {
        ...existingData,
        participantMap: updatedMap,
      };
    }

    const now = new Date().toISOString();
    const newConv: Conversation = {
      id: conversationId,
      participantUids: [currentUser.uid, targetUser.uid],
      participantMap: {
        [currentUser.uid]: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          username: currentUser.username,
          photoURL: currentUser.photoURL,
          isOnline: currentUser.isOnline,
        },
        [targetUser.uid]: {
          uid: targetUser.uid,
          displayName: targetUser.displayName,
          username: targetUser.username,
          photoURL: targetUser.photoURL,
          isOnline: targetUser.isOnline,
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newConv);
    return newConv;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeConversations(
  currentUid: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const path = 'conversations';
  const q = query(
    collection(db, 'conversations'),
    where('participantUids', 'array-contains', currentUid)
  );

  return onSnapshot(
    q,
    snapshot => {
      const convs: Conversation[] = [];
      snapshot.forEach(docSnap => {
        convs.push(docSnap.data() as Conversation);
      });
      // Sort in memory by updatedAt descending
      convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      callback(convs);
    },
    error => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const path = `conversations/${conversationId}/messages`;
  const q = query(collection(db, 'conversations', conversationId, 'messages'));

  return onSnapshot(
    q,
    snapshot => {
      const msgs: Message[] = [];
      snapshot.forEach(docSnap => {
        msgs.push(docSnap.data() as Message);
      });
      // Sort in memory by createdAt ascending
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(msgs);
    },
    error => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function sendMessage(
  conversationId: string,
  senderUid: string,
  content: string,
  type: 'text' | 'image' = 'text',
  imageUrl?: string
): Promise<Message> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const trimmed = content.trim().slice(0, 2000);

  const messageDoc: Message = {
    id: messageId,
    conversationId,
    senderUid,
    content: trimmed,
    type,
    ...(imageUrl ? { imageUrl } : {}),
    readBy: [senderUid],
    createdAt: now,
  };

  const messagePath = `conversations/${conversationId}/messages/${messageId}`;
  try {
    await setDoc(doc(db, 'conversations', conversationId, 'messages', messageId), messageDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, messagePath);
  }

  // Update conversation lastMessage & updatedAt
  const convPath = `conversations/${conversationId}`;
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: {
        content: type === 'image' ? '📷 Photo' : trimmed,
        senderUid,
        createdAt: now,
        type,
        readBy: [senderUid],
      },
      updatedAt: now,
    });
  } catch (error) {
    console.warn('Could not update conversation lastMessage:', error);
  }

  return messageDoc;
}

export async function markMessageRead(
  conversationId: string,
  messageId: string,
  currentUid: string
): Promise<void> {
  const path = `conversations/${conversationId}/messages/${messageId}`;
  try {
    await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
      readBy: arrayUnion(currentUid),
    });
  } catch (error) {
    // Non-blocking
    console.warn('Failed to mark message read:', error);
  }
}
