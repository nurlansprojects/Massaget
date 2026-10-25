import React from 'react';
import { Search, Plus } from 'lucide-react';

interface TopHeaderProps {
  onSearchClick: () => void;
  onNewChatClick: () => void;
  isSearchOpen?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSearchClick,
  onNewChatClick,
  isSearchOpen = false,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-900/90 px-4 py-3 flex items-center justify-between transition-colors">
      {/* Brand: Cursive M logo + Massaget Wordmark */}
      <div className="flex items-center gap-2.5">
        <img
          src="/assets/aistudio/Massagetlogo_cf6ac33d.png"
          alt="Massaget Logo"
          className="w-7 h-7 object-contain dark:invert-0 invert"
        />
        <span className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
          Massaget
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onSearchClick}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isSearchOpen
              ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
          }`}
          aria-label="Search chats"
          title="Search chats"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={onNewChatClick}
          className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
          aria-label="New conversation"
          title="New conversation"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
