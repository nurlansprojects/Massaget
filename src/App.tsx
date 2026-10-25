import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { TopHeader } from './components/navigation/TopHeader';
import { BottomNav } from './components/navigation/BottomNav';
import { ChatsList } from './components/chats/ChatsList';
import { ChatRoom } from './components/chats/ChatRoom';
import { ContactsScreen } from './components/contacts/ContactsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { ActiveTab, Conversation, UserProfile } from './types';
import { blockUser } from './firebase/userService';
import { MessageSquare } from 'lucide-react';

function MessengerMain() {
  const { currentUser, userProfile, loading, needsOnboarding, logout, refreshProfile } = useAuth();
  const { effectiveTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<ActiveTab>('chats');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center text-white select-none">
        <div className="relative animate-pulse">
          <img
            src="/assets/aistudio/Massagetlogo_cf6ac33d.png"
            alt="Massaget"
            className="w-20 h-20 object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.2)]"
          />
        </div>
        <p className="mt-4 text-xs font-mono text-neutral-400 tracking-widest uppercase">
          Massaget
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <WelcomeScreen />;
  }

  // Needs Onboarding (First-time user)
  if (needsOnboarding || !userProfile) {
    return (
      <>
        <WelcomeScreen />
        <OnboardingModal />
      </>
    );
  }

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
  };

  const handleOpenProfile = (target: UserProfile | { uid: string; displayName: string; photoURL?: string; username?: string }) => {
    setInspectingUser(target as UserProfile);
  };

  const handleBlockUser = async (target: UserProfile) => {
    try {
      await blockUser(userProfile.uid, target);
      if (activeConversation?.participantUids.includes(target.uid)) {
        setActiveConversation(null);
      }
      alert(`${target.displayName} has been blocked.`);
    } catch (e) {
      console.error('Failed to block user:', e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-neutral-900 dark:text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Primary Left Sidebar Column (full screen on mobile, left column on desktop) */}
      <div
        className={`w-full lg:w-[420px] lg:border-r border-neutral-200/80 dark:border-neutral-900 flex flex-col h-screen ${
          activeConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          onSearchClick={() => setIsSearchOpen(!isSearchOpen)}
          onNewChatClick={() => {
            setActiveTab('contacts');
          }}
          isSearchOpen={isSearchOpen}
        />

        {/* Tab Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chats' && (
            <ChatsList
              currentUser={userProfile}
              onSelectConversation={handleSelectConversation}
              onOpenNewChat={() => setActiveTab('contacts')}
              showSearchBar={isSearchOpen || true}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsScreen
              currentUser={userProfile}
              onSelectConversation={(conv) => {
                setActiveConversation(conv);
              }}
              onOpenProfile={(u) => handleOpenProfile(u)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              currentUser={userProfile}
              onOpenProfile={() => handleOpenProfile(userProfile)}
              onLogout={logout}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Desktop Right Detail Pane / Active Conversation */}
      <div className="hidden lg:flex flex-1 h-screen relative bg-neutral-50 dark:bg-[#070707]">
        {activeConversation ? (
          <ChatRoom
            conversation={activeConversation}
            currentUser={userProfile}
            onBack={() => setActiveConversation(null)}
            onOpenProfile={handleOpenProfile}
            onBlockUser={handleBlockUser}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-center text-neutral-400 mb-4 shadow-xs">
              <img
                src="/assets/aistudio/Massagetlogo_cf6ac33d.png"
                alt="Massaget"
                className="w-12 h-12 object-contain dark:invert-0 invert opacity-60"
              />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200 mb-1">
              Massaget for Web
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed mb-6">
              Select a conversation from the sidebar or start a new chat with registered contacts.
            </p>
            <button
              onClick={() => setActiveTab('contacts')}
              className="py-2.5 px-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Explore Contacts</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Active Conversation (Full screen overlay when active on mobile) */}
      {activeConversation && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-black">
          <ChatRoom
            conversation={activeConversation}
            currentUser={userProfile}
            onBack={() => setActiveConversation(null)}
            onOpenProfile={handleOpenProfile}
            onBlockUser={handleBlockUser}
          />
        </div>
      )}

      {/* Profile Inspection / Edit Modal */}
      {inspectingUser && (
        <UserProfileModal
          user={inspectingUser}
          currentUser={userProfile}
          isOpen={Boolean(inspectingUser)}
          onClose={() => setInspectingUser(null)}
          onStartChat={(conv) => {
            setInspectingUser(null);
            setActiveConversation(conv);
          }}
          onBlockUser={handleBlockUser}
          onLogout={logout}
          onProfileUpdated={refreshProfile}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MessengerMain />
      </AuthProvider>
    </ThemeProvider>
  );
}
