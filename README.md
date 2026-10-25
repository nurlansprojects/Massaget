# Massaget — Full-Stack Social Messenger

> **Connect. Chat. Share.**

Massaget is a modern, private, mobile-first social messaging web application designed with an Apple-inspired minimalist black-and-white visual philosophy. It features real Google Authentication via Firebase Auth, persistent real-time messaging with Cloud Firestore, atomic unique username registration, and attribute-based security rules.

---

## 1. Product Features

- **Google Sign-In**: Streamlined, secure authentication via official Firebase Google Auth (`signInWithPopup`). Unauthenticated visitors cannot access private chat content.
- **First-Time Onboarding**: Instant profile completion with unique username reservation (`@username`), customizable display name, and optional biography.
- **Real-Time Private Messaging**: One-to-one chats with deterministic conversation identifiers (`direct_uidA_uidB`) that eliminate duplicate conversations.
- **Rich Message Support**:
  - Live text messaging with delivery and read receipts (`✓✓`).
  - Image attachments with client-side compression to preserve database bandwidth.
  - Curated quick emoji picker.
  - Full-screen lightbox media viewer.
- **Contact Discovery**: Search registered users by `@username` or display name and open direct conversations instantly.
- **Presence & Privacy**: Live online status indicators, configurable online visibility, and contact blocking.
- **Apple-Inspired Design**:
  - Full Light and Dark themes with immediate switching and persistence.
  - Customizable chat wallpaper presets (*Classic Minimal*, *Modern Mesh*, *Deep Slate*).
  - Configurable text scale (*Compact*, *Standard*, *Large*).
  - Responsive layout: mobile-first navigation bar on phones and tablets, automatic dual-pane desktop messenger on larger screens.

---

## 2. Technical Architecture & Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Component-based reactive UI |
| **Build Tooling** | Vite | Ultra-fast bundling & development server |
| **Styling** | Tailwind CSS v4 | High-precision monochrome theme |
| **Iconography** | Lucide Icons | Clean, accessible glyphs |
| **Authentication** | Firebase Authentication | Google identity provider |
| **Database** | Cloud Firestore | Real-time listeners & document persistence |
| **Security Rules** | Firestore & Storage Rules | ABAC access control and payload bounds |

---

## 3. Database Schema

The database follows a normalized Firestore structure documented in `firebase-blueprint.json`:

```
users/{uid}
├── uid: string (matches auth.uid)
├── displayName: string (max 64 chars)
├── username: string (max 32 chars, normalized)
├── email: string
├── photoURL: string
├── bio: string (max 256 chars)
├── createdAt: ISO string
├── lastSeenAt: ISO string
├── isOnline: boolean
├── themePreference: "light" | "dark" | "system"
├── chatBackground: string
└── textSize: "small" | "medium" | "large"

usernames/{normalizedUsername}
├── uid: string (references owner UID)
├── username: string
└── createdAt: ISO string

conversations/{conversationId}
├── id: string (direct_{uid1}_{uid2})
├── participantUids: [uid1, uid2]
├── participantMap: { [uid]: { displayName, username, photoURL, isOnline } }
├── lastMessage: { content, senderUid, createdAt, type, readBy }
├── createdAt: ISO string
└── updatedAt: ISO string

conversations/{conversationId}/messages/{messageId}
├── id: string
├── conversationId: string
├── senderUid: string
├── content: string (max 2000 chars)
├── type: "text" | "image"
├── imageUrl?: string
├── readBy: [uid...]
└── createdAt: ISO string

users/{uid}/blockedUsers/{blockedUid}
├── blockedUid: string
├── displayName?: string
├── username?: string
└── blockedAt: ISO string
```

---

## 4. Security Rules (`firestore.rules`)

1. **Catch-All Default Deny**: All unauthenticated access is rejected by default (`match /{document=**} { allow read, write: if false; }`).
2. **User Profiles**: Signed-in users can read profiles for contact discovery; only the authenticated owner (`request.auth.uid == userId`) can create or modify their own profile.
3. **Username Integrity**: Usernames are strictly reserved; only the registering user can claim an unclaimed handle.
4. **Conversation Membership Gate**: A user can only access conversation documents or listen to message streams if their UID is in `participantUids`.
5. **Message Authenticity**: Senders cannot forge messages with another user's UID (`incoming().senderUid == request.auth.uid`).

---

## 5. Deployment & Configuration

### Step 1: Firebase Project Configuration
Firebase has been provisioned for this application with configuration saved in `firebase-applet-config.json`.

To deploy or configure on an external Firebase project:
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Go to **Authentication** > **Sign-in method** > enable **Google**.
3. Under **Authorized domains**, ensure your Cloud Run URL or custom domain is added.
4. Go to **Firestore Database** > create the database.
5. Deploy security rules with:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

### Step 2: Testing with Two Accounts
1. Open the application in your primary browser window and click **Continue with Google** to sign in with your primary account.
2. Complete the onboarding screen by verifying your display name and choosing a unique `@username`.
3. Open an Incognito / Private window (or a different browser) and open the app URL.
4. Sign in with a secondary Google account and complete onboarding.
5. Go to the **Contacts** tab on either account, find the other account by name or username, and click the message button.
6. Send messages, emojis, or photos in real time and observe the immediate synchronization and read receipts.

---

## 6. Development Scripts

```bash
# Run local development server
npm run dev

# Run TypeScript type check
npm run lint

# Build for production
npm run build
```
