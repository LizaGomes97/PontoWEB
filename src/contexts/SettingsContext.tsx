import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type ContrastMode = 'normal' | 'high';
export type MotionPreference = 'normal' | 'reduced';

interface SettingsContextType {
  theme: Theme;
  fontSize: FontSize;
  contrastMode: ContrastMode;
  motionPreference: MotionPreference;
  notificationsEnabled: boolean;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setMotionPreference: (preference: MotionPreference) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings = {
  theme: 'system' as Theme,
  fontSize: 'medium' as FontSize,
  contrastMode: 'normal' as ContrastMode,
  motionPreference: 'normal' as MotionPreference,
  notificationsEnabled: true,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultSettings.theme);
  const [fontSize, setFontSize] = useState<FontSize>(defaultSettings.fontSize);
  const [contrastMode, setContrastMode] = useState<ContrastMode>(defaultSettings.contrastMode);
  const [motionPreference, setMotionPreference] = useState<MotionPreference>(defaultSettings.motionPreference);
  const [notificationsEnabled, setNotificationsEnabled] = useState(defaultSettings.notificationsEnabled);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('timetrack-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setTheme(parsed.theme || defaultSettings.theme);
        setFontSize(parsed.fontSize || defaultSettings.fontSize);
        setContrastMode(parsed.contrastMode || defaultSettings.contrastMode);
        setMotionPreference(parsed.motionPreference || defaultSettings.motionPreference);
        setNotificationsEnabled(parsed.notificationsEnabled ?? defaultSettings.notificationsEnabled);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      theme,
      fontSize,
      contrastMode,
      motionPreference,
      notificationsEnabled,
    };
    localStorage.setItem('timetrack-settings', JSON.stringify(settings));
  }, [theme, fontSize, contrastMode, motionPreference, notificationsEnabled]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--font-size', fontSizes[fontSize]);
  }, [fontSize]);

  // Apply contrast mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', contrastMode === 'high');
  }, [contrastMode]);

  // Apply motion preferences
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', motionPreference === 'reduced');
  }, [motionPreference]);

  const resetSettings = () => {
    setTheme(defaultSettings.theme);
    setFontSize(defaultSettings.fontSize);
    setContrastMode(defaultSettings.contrastMode);
    setMotionPreference(defaultSettings.motionPreference);
    setNotificationsEnabled(defaultSettings.notificationsEnabled);
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      fontSize,
      contrastMode,
      motionPreference,
      notificationsEnabled,
      setTheme,
      setFontSize,
      setContrastMode,
      setMotionPreference,
      setNotificationsEnabled,
      resetSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}