import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={16} />, label: 'Light' },
    { value: 'dark', icon: <Moon size={16} />, label: 'Dark' },
    { value: 'auto', icon: <Laptop size={16} />, label: 'Auto' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-lg border border-border">
      {themes.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded transition-all duration-200 ${
            theme === value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted hover:text-foreground hover:bg-surface-tertiary'
          }`}
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};
