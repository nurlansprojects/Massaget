import React from 'react';
import { MessageSquare, Users, Settings } from 'lucide-react';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadCount = 0,
}) => {
  const items = [
    {
      id: 'chats' as ActiveTab,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null,
    },
    {
      id: 'contacts' as ActiveTab,
      label: 'Contacts',
      icon: Users,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-900/90 py-1.5 px-6 pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-colors"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-4 min-w-[64px] transition-all cursor-pointer ${
                isActive
                  ? 'text-black dark:text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[18px] text-[10px] font-bold text-white bg-black dark:text-black dark:bg-white rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
