import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectivityIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'pending'
  const [pendingItems, setPendingItems] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('pending');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending items in localStorage
    const checkPendingItems = () => {
      try {
        const pendingDeliveries = JSON.parse(
          localStorage.getItem('pendingDeliveries') || '[]'
        );
        const pendingProofs = JSON.parse(
          localStorage.getItem('pendingProofs') || '[]'
        );
        setPendingItems(pendingDeliveries.length + pendingProofs.length);
      } catch (error) {
        console.error('Error checking pending items:', error);
      }
    };

    checkPendingItems();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) {
      setSyncStatus('pending');
      return;
    }

    setSyncStatus('syncing');

    try {
      // Simulate sync process
      // TODO: Implement actual sync logic with API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear pending items from localStorage (in real app, only after successful sync)
      localStorage.removeItem('pendingDeliveries');
      localStorage.removeItem('pendingProofs');
      setPendingItems(0);

      setSyncStatus('synced');
      setLastSync(new Date());

      // Revert to synced status after 3 seconds
      setTimeout(() => {
        setSyncStatus('synced');
      }, 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('pending');
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (syncStatus === 'syncing') return 'text-yellow-600';
    if (syncStatus === 'pending') return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusBgColor = () => {
    if (!isOnline) return 'bg-red-50';
    if (syncStatus === 'syncing') return 'bg-yellow-50';
    if (syncStatus === 'pending') return 'bg-orange-50';
    return 'bg-green-50';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'pending') return `${pendingItems} pending`;
    return 'Online';
  };

  const getStatusMessage = () => {
    if (!isOnline) {
      return 'No internet connection. Changes will be saved locally and synced when online.';
    }
    if (syncStatus === 'syncing') {
      return 'Syncing data with server...';
    }
    if (syncStatus === 'pending') {
      return `${pendingItems} items pending sync. Click to sync now.`;
    }
    return `Last synced at ${lastSync.toLocaleTimeString()}`;
  };

  return (
    <>
      {/* Compact indicator for header/navigation */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusBgColor()} ${getStatusColor()}`}>
        {isOnline && syncStatus !== 'pending' ? (
          <Wifi size={16} />
        ) : (
          <WifiOff size={16} />
        )}
        <span>{getStatusText()}</span>
        {syncStatus === 'syncing' && (
          <div className="w-3 h-3 bg-current rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Expandable tooltip/status panel */}
      <div className="group relative">
        <button
          className={`p-2 rounded-full ${getStatusBgColor()} ${getStatusColor()} hover:opacity-80 transition-opacity cursor-help`}
          title={getStatusMessage()}
          onClick={handleSync}
          disabled={!isOnline || syncStatus === 'syncing'}
        >
          {isOnline && syncStatus !== 'pending' ? (
            <Wifi size={20} />
          ) : (
            <WifiOff size={20} />
          )}
          {syncStatus === 'syncing' && (
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
          )}
        </button>

        {/* Tooltip/Status message */}
        <div
          className={`hidden group-hover:block absolute bottom-full right-0 mb-2 p-3 text-sm rounded-lg shadow-lg whitespace-nowrap ${getStatusBgColor()} ${getStatusColor()} border border-current border-opacity-20 z-50`}
        >
          <p className="font-medium mb-1">Sync Status</p>
          <p className="text-xs opacity-80">{getStatusMessage()}</p>
          {pendingItems > 0 && isOnline && (
            <button
              onClick={handleSync}
              className="mt-2 w-full px-2 py-1 text-xs font-medium bg-current text-white rounded hover:opacity-90 transition-opacity"
              disabled={syncStatus === 'syncing'}
            >
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ConnectivityIndicator;

// Usage in components:
// 1. Add to navigation/header:
//    <ConnectivityIndicator />
//
// 2. For page-level indicator banner:
export const ConnectivityBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkPendingItems = () => {
      try {
        const pendingDeliveries = JSON.parse(
          localStorage.getItem('pendingDeliveries') || '[]'
        );
        const pendingProofs = JSON.parse(
          localStorage.getItem('pendingProofs') || '[]'
        );
        setPendingItems(pendingDeliveries.length + pendingProofs.length);
      } catch (error) {
        console.error('Error checking pending items:', error);
      }
    };

    checkPendingItems();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && pendingItems === 0) {
    return null;
  }

  return (
    <div
      className={`${
        isOnline
          ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
          : 'bg-red-100 border-red-300 text-red-800'
      } border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40`}
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <Wifi size={20} />
        ) : (
          <WifiOff size={20} />
        )}
        <div>
          <p className="font-medium">
            {isOnline ? 'You are online' : 'You are offline'}
          </p>
          {isOnline && pendingItems > 0 && (
            <p className="text-sm opacity-80">
              {pendingItems} items waiting to be synced
            </p>
          )}
          {!isOnline && (
            <p className="text-sm opacity-80">
              Changes will be saved locally and synced when online
            </p>
          )}
        </div>
      </div>
      {isOnline && pendingItems > 0 && (
        <button className="px-4 py-2 bg-white rounded font-medium text-sm hover:bg-opacity-90 transition-opacity">
          Sync Now
        </button>
      )}
    </div>
  );
};
