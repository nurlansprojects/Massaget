import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserProfile, BlockedUserRecord } from '../types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function isUsernameAvailable(username: string, currentUid?: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  const path = `usernames/${normalized}`;
  try {
    const snap = await getDoc(doc(db, 'usernames', normalized));
    if (!snap.exists()) return true;
    const data = snap.data();
    return currentUid !== undefined && data.uid === currentUid;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createUserProfile(
  uid: string,
  profile: {
    displayName: string;
    username: string;
    email?: string;
    photoURL?: string;
    bio?: string;
  }
): Promise<UserProfile> {
  const normalizedUsername = profile.username.trim().toLowerCase();
  const now = new Date().toISOString();

  const userDoc: UserProfile = {
    uid,
    displayName: profile.displayName.trim().slice(0, 64),
    username: normalizedUsername.slice(0, 32),
    email: profile.email || '',
    photoURL: profile.photoURL || '',
    bio: (profile.bio || '').slice(0, 256),
    createdAt: now,
    lastSeenAt: now,
    isOnline: true,
    themePreference: 'system',
    chatBackground: 'default',
    textSize: 'medium',
  };

  const usernamePath = `usernames/${normalizedUsername}`;
  try {
    await setDoc(doc(db, 'usernames', normalizedUsername), {
      uid,
      username: normalizedUsername,
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, usernamePath);
  }

  const userPath = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), userDoc);
    return userDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>,
  oldUsername?: string
): Promise<void> {
  const path = `users/${uid}`;
  try {
    // If username is changing, update usernames collection
    if (updates.username && oldUsername && updates.username.toLowerCase() !== oldUsername.toLowerCase()) {
      const newNormalized = updates.username.trim().toLowerCase();
      const oldNormalized = oldUsername.trim().toLowerCase();
      
      await setDoc(doc(db, 'usernames', newNormalized), {
        uid,
        username: newNormalized,
        createdAt: new Date().toISOString(),
      });
      
      try {
        await deleteDoc(doc(db, 'usernames', oldNormalized));
      } catch (e) {
        console.warn('Could not remove old username document:', e);
      }
    }

    await updateDoc(doc(db, 'users', uid), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updatePresence(uid: string, isOnline: boolean): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      isOnline,
      lastSeenAt: new Date().toISOString(),
    });
  } catch (error) {
    // Fail silently on background presence update so it doesn't interrupt navigation
    console.warn('Presence update failed:', error);
  }
}

export async function searchUsers(searchTerm: string, currentUid: string): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), limit(50));
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];

    const lowerTerm = searchTerm.toLowerCase().trim();

    snapshot.forEach(docSnap => {
      const data = docSnap.data() as UserProfile;
      if (data.uid === currentUid) return;

      if (!lowerTerm) {
        users.push(data);
      } else {
        const matchesName = data.displayName?.toLowerCase().includes(lowerTerm);
        const matchesUsername = data.username?.toLowerCase().includes(lowerTerm);
        if (matchesName || matchesUsername) {
          users.push(data);
        }
      }
    });

    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getBlockedUsers(currentUid: string): Promise<BlockedUserRecord[]> {
  const path = `users/${currentUid}/blockedUsers`;
  try {
    const snap = await getDocs(collection(db, 'users', currentUid, 'blockedUsers'));
    const list: BlockedUserRecord[] = [];
    snap.forEach(d => {
      list.push(d.data() as BlockedUserRecord);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function blockUser(currentUid: string, targetUser: UserProfile): Promise<void> {
  const path = `users/${currentUid}/blockedUsers/${targetUser.uid}`;
  try {
    await setDoc(doc(db, 'users', currentUid, 'blockedUsers', targetUser.uid), {
      blockedUid: targetUser.uid,
      displayName: targetUser.displayName,
      username: targetUser.username,
      blockedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function unblockUser(currentUid: string, targetUid: string): Promise<void> {
  const path = `users/${currentUid}/blockedUsers/${targetUid}`;
  try {
    await deleteDoc(doc(db, 'users', currentUid, 'blockedUsers', targetUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
