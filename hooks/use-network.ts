import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Returns whether the device currently has an active internet connection.
 * Uses NetInfo for instant, event-driven updates.
 */
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check immediately on mount
    NetInfo.fetch().then(state => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable !== false));
    });

    // Subscribe to changes
    const unsub = NetInfo.addEventListener(state => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable !== false));
    });

    return unsub;
  }, []);

  return isOnline;
}
