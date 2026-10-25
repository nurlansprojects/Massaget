import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  isOnline?: boolean;
  className?: string;
  showPresence?: boolean;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl font-medium',
  xxl: 'w-24 h-24 text-2xl font-medium',
};

const badgeSizeClasses = {
  xs: 'w-2 h-2 bottom-0 right-0 border',
  sm: 'w-2.5 h-2.5 bottom-0 right-0 border-[1.5px]',
  md: 'w-3 h-3 bottom-0.5 right-0.5 border-2',
  lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5 border-2',
  xl: 'w-4 h-4 bottom-1 right-1 border-2',
  xxl: 'w-5 h-5 bottom-1 right-1 border-2',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isOnline = false,
  className = '',
  showPresence = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n: string) => {
    if (!n) return 'M';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hasValidImage = src && !imgError && src.trim() !== '';

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center select-none bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300/40 dark:border-neutral-700/60 shadow-xs transition-transform`}
      >
        {hasValidImage ? (
          <img
            src={src}
            alt={name || 'User avatar'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-semibold tracking-wider">{getInitials(name)}</span>
        )}
      </div>

      {showPresence && (
        <span
          className={`absolute rounded-full ${badgeSizeClasses[size]} ${
            isOnline ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-600'
          } border-white dark:border-black`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
