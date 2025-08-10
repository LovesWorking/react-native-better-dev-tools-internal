/**
 * Storage helper with optional AsyncStorage support
 * Tries to import AsyncStorage if available, falls back to in-memory storage
 */

type AsyncStorageType = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem?: (key: string) => Promise<void>;
};

let AsyncStorage: AsyncStorageType | null = null;
let hasWarned = false;

// Try to import AsyncStorage dynamically
try {
  const asyncStorageModule = require('@react-native-async-storage/async-storage');
  AsyncStorage = asyncStorageModule.default || asyncStorageModule;
} catch {
  // AsyncStorage not available - will use fallback
}

// Fallback in-memory storage for when AsyncStorage is not available
const memoryStorage: Record<string, string> = {};

/**
 * Initialize storage and show warning if AsyncStorage is not available
 */
export function initializeStorage(): void {
  if (!AsyncStorage && !hasWarned) {
    console.warn(
      '[DevToolsBubble] AsyncStorage not found. Bubble position will not persist across app restarts.\n' +
      'To enable persistence, install: npm install @react-native-async-storage/async-storage'
    );
    hasWarned = true;
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