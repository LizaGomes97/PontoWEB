import React, { useEffect, ReactNode } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { motionPreference, contrastMode } = useSettings();

  useEffect(() => {
    // Apply motion preferences to the document
    const root = document.documentElement;
    
    if (motionPreference === 'reduced') {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply contrast preferences
    if (contrastMode === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [motionPreference, contrastMode]);

  useEffect(() => {
    // Keyboard navigation helpers
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + 1: Focus main content
      if (event.altKey && event.key === '1') {
        event.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
        }
      }

      // Alt + 2: Focus navigation (if available)
      if (event.altKey && event.key === '2') {
        event.preventDefault();
        const navigation = document.querySelector('nav, header');
        if (navigation && navigation instanceof HTMLElement) {
          navigation.focus();
        }
      }

      // Escape: Close modals or go back
      if (event.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement instanceof HTMLElement) {
          activeElement.blur();
        }
      }
    };

    // Focus management for better accessibility
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Ensure focused elements are visible
      if (target && target.scrollIntoView) {
        target.scrollIntoView({
          behavior: motionPreference === 'reduced' ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [motionPreference]);

  // Announce page changes to screen readers
  useEffect(() => {
    const announcePageChange = () => {
      const announcer = document.getElementById('page-announcer');
      if (announcer) {
        const pageTitle = document.title || 'Página carregada';
        announcer.textContent = `Navegou para: ${pageTitle}`;
      }
    };

    // Create announcer element if it doesn't exist
    let announcer = document.getElementById('page-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'page-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }

    // Announce page change with a slight delay
    const timer = setTimeout(announcePageChange, 100);

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}