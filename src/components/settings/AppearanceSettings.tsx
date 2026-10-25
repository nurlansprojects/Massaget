import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode, TextSize } from '../../types';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme, textSize, setTextSize, chatBackground, setChatBackground } = useTheme();

  const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  const backgrounds = [
    {
      id: 'default',
      name: 'Classic Minimal',
      previewClass: 'bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800',
    },
    {
      id: 'mesh',
      name: 'Modern Mesh',
      previewClass:
        'bg-linear-to-tr from-neutral-200 dark:from-neutral-900 to-neutral-50 dark:to-neutral-950 border border-neutral-300 dark:border-neutral-800',
    },
    {
      id: 'slate',
      name: 'Deep Slate',
      previewClass: 'bg-neutral-100 dark:bg-[#141414] border border-neutral-300 dark:border-neutral-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Mode Segmented Control */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          Theme Mode
        </h3>
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Background Wallpaper */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          Chat Wallpaper
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {backgrounds.map((bg) => {
            const isSelected = chatBackground === bg.id;
            return (
              <button
                key={bg.id}
                onClick={() => setChatBackground(bg.id)}
                className="group relative flex flex-col items-center cursor-pointer text-left"
              >
                <div
                  className={`w-full h-24 rounded-2xl ${bg.previewClass} relative overflow-hidden transition-all group-hover:scale-102 flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-black dark:ring-white' : ''
                  }`}
                >
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1.5 truncate">
                  {bg.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Size Scale */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Text Size
          </h3>
          <span className="text-xs font-mono text-neutral-500 capitalize">{textSize}</span>
        </div>
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
          <span className="text-xs font-medium text-neutral-400">A</span>
          <div className="flex-1 flex justify-between gap-2">
            {(['small', 'medium', 'large'] as TextSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  textSize === size
                    ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {size === 'small' ? 'Compact' : size === 'medium' ? 'Standard' : 'Large'}
              </button>
            ))}
          </div>
          <span className="text-base font-semibold text-neutral-800 dark:text-neutral-200">A</span>
        </div>
      </div>

      {/* Live Preview Bubble */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          Bubble Preview
        </h3>
        <div
          className={`p-4 rounded-2xl ${
            chatBackground === 'slate'
              ? 'bg-neutral-100 dark:bg-[#141414]'
              : chatBackground === 'mesh'
              ? 'bg-neutral-100 dark:bg-neutral-900'
              : 'bg-neutral-50 dark:bg-neutral-950'
          } border border-neutral-200/60 dark:border-neutral-800 space-y-2`}
        >
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-neutral-200 dark:bg-[#1e1e1e] text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-bl-xs px-3.5 py-2 text-xs">
              Hey! How does the typography look?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[75%] bg-black dark:bg-white text-white dark:text-black rounded-2xl rounded-br-xs px-3.5 py-2 text-xs font-medium">
              Crisp, minimal, and perfectly legible.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
