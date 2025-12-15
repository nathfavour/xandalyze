import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Bell, Palette, RefreshCw, Save } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  autoRefresh,
  onAutoRefreshChange,
  refreshInterval,
  onRefreshIntervalChange,
}) => {
  const { theme, setTheme } = useTheme();
  const [tempInterval, setTempInterval] = useState(refreshInterval / 1000);

  if (!isOpen) return null;

  const handleSave = () => {
    onRefreshIntervalChange(tempInterval * 1000);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-primary border-l border-border z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <SettingsIcon className="text-primary" size={24} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-secondary rounded-lg transition-colors text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Theme Settings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="text-muted" size={18} />
              <h3 className="font-semibold text-foreground">Appearance</h3>
            </div>
            <div className="space-y-2 pl-7">
              <label className="text-sm text-muted mb-2 block">Theme Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'auto'] as Theme[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                      theme === mode
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface-secondary text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Data Refresh Settings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="text-muted" size={18} />
              <h3 className="font-semibold text-foreground">Data Refresh</h3>
            </div>
            <div className="space-y-4 pl-7">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Auto Refresh</label>
                  <p className="text-xs text-muted">Automatically reload data at intervals</p>
                </div>
                <button
                  onClick={() => onAutoRefreshChange(!autoRefresh)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoRefresh ? 'bg-primary' : 'bg-surface-tertiary'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoRefresh ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {autoRefresh && (
                <div>
                  <label className="text-sm text-muted mb-2 block">
                    Refresh Interval (seconds): {tempInterval}s
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={tempInterval}
                    onChange={(e) => setTempInterval(Number(e.target.value))}
                    className="w-full h-2 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted mt-1">
                    <span>10s</span>
                    <span>120s</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-muted" size={18} />
              <h3 className="font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Show success notifications</label>
                <button className="relative w-12 h-6 rounded-full bg-primary">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Show error notifications</label>
                <button className="relative w-12 h-6 rounded-full bg-primary">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full translate-x-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
            >
              <Save size={18} />
              Save Settings
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-surface-secondary hover:bg-surface-tertiary text-foreground rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* About Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-sm text-muted space-y-1">
              <p className="font-semibold text-foreground">Xandalyze v1.0.0</p>
              <p>Advanced Xandeum Network Analytics</p>
              <p>Powered by AI & Real-time Data</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
