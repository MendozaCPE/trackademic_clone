import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'trackademic_cache_';

/**
 * Write any JSON-serialisable value to the local cache.
 */
export async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (_) {}
}

/**
 * Read a previously cached value. Returns null if nothing is stored.
 */
export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (_) {
    return null;
  }
}
