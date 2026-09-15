import AsyncStorage from "@react-native-async-storage/async-storage";

const prefix = "sakani_cache:";

export async function saveCacheEntry<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
}

export async function getCacheEntry<T>(key: string): Promise<T | null> {
  const payload = await AsyncStorage.getItem(`${prefix}${key}`);
  if (!payload) return null;
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

export async function clearCacheEntry(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${prefix}${key}`);
}

export async function clearAllCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith(prefix)));
}