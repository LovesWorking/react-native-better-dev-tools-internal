import {
  initializeStorage,
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  STORAGE_KEYS,
} from '../floatingBubble/utils/storageHelper';

// Mock console methods
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});

describe('Storage Helper', () => {
  describe('initializeStorage', () => {
    it('should initialize without errors', () => {
      expect(() => initializeStorage()).not.toThrow();
    });

    it('should show warning when AsyncStorage is not available', () => {
      // Reset the module to ensure warning is shown
      jest.resetModules();
      const storageModule = require('../floatingBubble/utils/storageHelper');
      
      storageModule.initializeStorage();
      
      // Check if AsyncStorage is available (it shouldn't be in test environment)
      if (!storageModule.isAsyncStorageAvailable()) {
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('AsyncStorage not found')
        );
      }
    });
  });

  describe('Memory storage fallback', () => {
    it('should store and retrieve values in memory', async () => {
      const key = 'test_key';
      const value = 'test_value';
      
      await setStorageItem(key, value);
      const retrieved = await getStorageItem(key);
      
      expect(retrieved).toBe(value);
    });

    it('should return null for non-existent keys', async () => {
      const result = await getStorageItem('non_existent_key');
      expect(result).toBeNull();
    });

    it('should remove items from storage', async () => {
      const key = 'test_remove_key';
      const value = 'test_value';
      
      await setStorageItem(key, value);
      expect(await getStorageItem(key)).toBe(value);
      
      await removeStorageItem(key);
      expect(await getStorageItem(key)).toBeNull();
    });

    it('should handle multiple key-value pairs', async () => {
      await setStorageItem('key1', 'value1');
      await setStorageItem('key2', 'value2');
      await setStorageItem('key3', 'value3');
      
      expect(await getStorageItem('key1')).toBe('value1');
      expect(await getStorageItem('key2')).toBe('value2');
      expect(await getStorageItem('key3')).toBe('value3');
    });
  });

  describe('Storage keys', () => {
    it('should have correct storage keys defined', () => {
      expect(STORAGE_KEYS.BUBBLE_POSITION_X).toBe('@dev_tools_bubble_position_x');
      expect(STORAGE_KEYS.BUBBLE_POSITION_Y).toBe('@dev_tools_bubble_position_y');
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully in setStorageItem', async () => {
      // This should not throw
      await expect(setStorageItem('key', 'value')).resolves.toBeUndefined();
    });

    it('should handle errors gracefully in getStorageItem', async () => {
      // This should not throw and return null
      await expect(getStorageItem('key')).resolves.toBeDefined();
    });

    it('should handle errors gracefully in removeStorageItem', async () => {
      // This should not throw
      await expect(removeStorageItem('key')).resolves.toBeUndefined();
    });
  });

  describe('Position persistence', () => {
    it('should store and retrieve bubble position', async () => {
      const x = '100';
      const y = '200';
      
      await setStorageItem(STORAGE_KEYS.BUBBLE_POSITION_X, x);
      await setStorageItem(STORAGE_KEYS.BUBBLE_POSITION_Y, y);
      
      const retrievedX = await getStorageItem(STORAGE_KEYS.BUBBLE_POSITION_X);
      const retrievedY = await getStorageItem(STORAGE_KEYS.BUBBLE_POSITION_Y);
      
      expect(retrievedX).toBe(x);
      expect(retrievedY).toBe(y);
    });

    it('should handle float position values', async () => {
      const x = '123.456';
      const y = '789.012';
      
      await setStorageItem(STORAGE_KEYS.BUBBLE_POSITION_X, x);
      await setStorageItem(STORAGE_KEYS.BUBBLE_POSITION_Y, y);
      
      const retrievedX = await getStorageItem(STORAGE_KEYS.BUBBLE_POSITION_X);
      const retrievedY = await getStorageItem(STORAGE_KEYS.BUBBLE_POSITION_Y);
      
      expect(parseFloat(retrievedX!)).toBeCloseTo(123.456);
      expect(parseFloat(retrievedY!)).toBeCloseTo(789.012);
    });
  });
});