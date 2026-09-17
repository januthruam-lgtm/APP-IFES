import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-in slide-in-from-bottom-2"
    >
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Modo Offline — Você está usando o cache local e IndexedDB do app.</span>
    </div>
  );
};
