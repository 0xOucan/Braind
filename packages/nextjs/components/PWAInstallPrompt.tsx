"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasDismissed) {
      const dismissedTime = parseInt(hasDismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    if (outcome === 'accepted') {
      console.log('PWA installed successfully');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[200] animate-slide-up">
      <div className="retro-game-container border-4 border-yellow-400 bg-black p-5 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0 animate-pixel-float">
            <img
              src="/logo.svg"
              alt="BrainD Logo"
              className="w-full h-full"
            />
          </div>

          <div className="flex-1">
            <h3 className="pixel-font text-lg neon-text-yellow mb-1">
              Install BrainD
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Install our app for the best brain training experience! Play offline and get quick access.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleInstall}
            className="flex-1 arcade-button bg-yellow-400 text-black hover:bg-yellow-500 py-3 px-4 border-2 border-yellow-400"
          >
            <span className="pixel-font text-xs">INSTALL NOW</span>
          </button>
          <button
            onClick={handleDismiss}
            className="arcade-button bg-gray-700 text-white hover:bg-gray-600 py-3 px-4 border-2 border-gray-600"
          >
            <span className="pixel-font text-xs">LATER</span>
          </button>
        </div>

        {/* Features list */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <ul className="text-xs text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <span className="neon-text-yellow">✓</span> Play offline
            </li>
            <li className="flex items-center gap-2">
              <span className="neon-text-yellow">✓</span> Quick access from home screen
            </li>
            <li className="flex items-center gap-2">
              <span className="neon-text-yellow">✓</span> Full screen experience
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
