import { useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import type { Animated } from 'react-native';
import { 
  initializeStorage, 
  setStorageItem, 
  getStorageItem, 
  STORAGE_KEYS 
} from '../utils/storageHelper';

interface UsePositionPersistenceProps {
  animatedPosition: Animated.ValueXY;
  bubbleWidth?: number;
  bubbleHeight?: number;
  enabled?: boolean;
}

interface SavedPosition {
  x: number;
  y: number;
}

/**
 * Hook to persist and restore bubble position using AsyncStorage (if available)
 */
export function usePositionPersistence({
  animatedPosition,
  bubbleWidth = 100,
  bubbleHeight = 32,
  enabled = true,
}: UsePositionPersistenceProps) {
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize storage on mount
  useEffect(() => {
    if (enabled) {
      initializeStorage();
    }
  }, [enabled]);

  /**
   * Save position to storage
   */
  const savePosition = useCallback(async (x: number, y: number) => {
    if (!enabled) return;

    try {
      await Promise.all([
        setStorageItem(STORAGE_KEYS.BUBBLE_POSITION_X, x.toString()),
        setStorageItem(STORAGE_KEYS.BUBBLE_POSITION_Y, y.toString()),
      ]);
    } catch (error) {
      console.warn('[DevToolsBubble] Failed to save position:', error);
    }
  }, [enabled]);

  /**
   * Save position with debouncing to avoid too many storage writes
   */
  const debouncedSavePosition = useCallback((x: number, y: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      savePosition(x, y);
    }, 500); // Debounce for 500ms
  }, [savePosition]);

  /**
   * Load saved position from storage
   */
  const loadPosition = useCallback(async (): Promise<SavedPosition | null> => {
    if (!enabled) return null;

    try {
      const [xStr, yStr] = await Promise.all([
        getStorageItem(STORAGE_KEYS.BUBBLE_POSITION_X),
        getStorageItem(STORAGE_KEYS.BUBBLE_POSITION_Y),
      ]);

      if (xStr !== null && yStr !== null) {
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);

        if (!isNaN(x) && !isNaN(y)) {
          return { x, y };
        }
      }
    } catch (error) {
      console.warn('[DevToolsBubble] Failed to load position:', error);
    }

    return null;
  }, [enabled]);

  /**
   * Validate that position is within screen bounds
   */
  const validatePosition = useCallback((position: SavedPosition): SavedPosition => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    
    // Ensure bubble stays within screen bounds with some padding
    const padding = 20;
    const maxX = screenWidth - bubbleWidth - padding;
    const maxY = screenHeight - bubbleHeight - padding;
    
    return {
      x: Math.max(padding, Math.min(position.x, maxX)),
      y: Math.max(padding, Math.min(position.y, maxY)),
    };
  }, [bubbleWidth, bubbleHeight]);

  /**
   * Restore position on mount
   */
  useEffect(() => {
    if (!enabled || isInitialized.current) return;

    const restorePosition = async () => {
      const savedPosition = await loadPosition();
      
      if (savedPosition) {
        const validatedPosition = validatePosition(savedPosition);
        animatedPosition.setValue(validatedPosition);
      } else {
        // Set default position (top right)
        const { width: screenWidth } = Dimensions.get('window');
        animatedPosition.setValue({
          x: screenWidth - bubbleWidth - 20,
          y: 100,
        });
      }
      
      isInitialized.current = true;
    };

    restorePosition();
  }, [enabled, animatedPosition, loadPosition, validatePosition, bubbleWidth]);

  /**
   * Listen to position changes and save them
   */
  useEffect(() => {
    if (!enabled || !isInitialized.current) return;

    const listener = animatedPosition.addListener((value) => {
      debouncedSavePosition(value.x, value.y);
    });

    return () => {
      animatedPosition.removeListener(listener);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, animatedPosition, debouncedSavePosition]);

  return {
    savePosition,
    loadPosition,
    isInitialized: isInitialized.current,
  };
}