/**
 * Storage helper with optional AsyncStorage support
 * Tries to import AsyncStorage if available, falls back to in-memory storage
 * 
 * This is an optional peer dependency - the package will work without it,
 * but position persistence across app restarts will be disabled.
 */

type AsyncStorageType = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem?: (key: string) => Promise<void>;
};

let AsyncStorage: AsyncStorageType | null = null;
let hasLoggedInfo = false;
let hasInitialized = false;

// Fallback in-memory storage for when AsyncStorage is not available
const memoryStorage: Record<string, string> = {};

/**
 * Initialize storage
 * This is called automatically when needed
 */
export function initializeStorage(): void {
  if (hasInitialized) return;
  hasInitialized = true;

  try {
    const asyncStorageModule = require('@react-native-async-storage/async-storage');
    AsyncStorage = asyncStorageModule.default || asyncStorageModule;
    
    // Only log in development
    if (__DEV__ && !hasLoggedInfo) {
      console.info('[DevToolsBubble] AsyncStorage detected - position persistence enabled');
      hasLoggedInfo = true;
    }
  } catch {
    // AsyncStorage not available - will use fallback
    if (__DEV__ && !hasLoggedInfo) {
      console.info(
        '[DevToolsBubble] Position persistence disabled (optional dependency @react-native-async-storage/async-storage not installed)'
      );
      hasLoggedInfo = true;
    }
  }
}

/**
 * Save an item to storage
 */
export async function setStorageItem(key: string, value: string): Promise<void> {
  try {
    if (AsyncStorage) {
      await AsyncStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  } catch (error) {
    console.warn(`[DevToolsBubble] Failed to save ${key}:`, error);
  }
}

/**
 * Get an item from storage
 */
export async function getStorageItem(key: string): Promise<string | null> {
  try {
    if (AsyncStorage) {
      return await AsyncStorage.getItem(key);
    } else {
      return memoryStorage[key] || null;
    }
  } catch (error) {
    console.warn(`[DevToolsBubble] Failed to load ${key}:`, error);
    return null;
  }
}

/**
 * Remove an item from storage
 */
export async function removeStorageItem(key: string): Promise<void> {
  try {
    if (AsyncStorage && AsyncStorage.removeItem) {
      await AsyncStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  } catch (error) {
    console.warn(`[DevToolsBubble] Failed to remove ${key}:`, error);
  }
}

/**
 * Check if AsyncStorage is available
 */
export function isAsyncStorageAvailable(): boolean {
  return AsyncStorage !== null;
}

/**
 * Storage keys for bubble position
 */
export const STORAGE_KEYS = {
  BUBBLE_POSITION_X: '@dev_tools_bubble_position_x',
  BUBBLE_POSITION_Y: '@dev_tools_bubble_position_y',
} as const;