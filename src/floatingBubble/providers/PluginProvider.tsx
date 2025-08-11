import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { PluginManager } from '../core/PluginManager';
import type { DevToolsPlugin, StorageAPI } from '../types/plugin';
import * as storageHelper from '../utils/storageHelper';

/**
 * Storage adapter using existing storageHelper
 */
const storageAdapter: StorageAPI = {
  async get(key: string): Promise<any> {
    const value = await storageHelper.getStorageItem(key);
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  },
  async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await storageHelper.setStorageItem(key, stringValue);
  },
  async remove(key: string): Promise<void> {
    await storageHelper.removeStorageItem(key);
  }
};

/**
 * Plugin context for React components
 */
const PluginContext = createContext<PluginManager | null>(null);

/**
 * Props for PluginProvider
 */
interface PluginProviderProps {
  children: ReactNode;
  queryClient?: any;
  onHostEvent?: (event: any) => void;
  plugins?: DevToolsPlugin[];
}

/**
 * Provides plugin management to the component tree
 */
export function PluginProvider({ 
  children, 
  queryClient,
  onHostEvent,
  plugins = []
}: PluginProviderProps) {
  const managerRef = useRef<PluginManager | null>(null);

  // Create plugin manager
  const manager = useMemo(() => {
    if (!managerRef.current) {
      managerRef.current = new PluginManager({
        storage: storageAdapter,
        queryClient,
        onHostEvent
      });
    }
    return managerRef.current;
  }, [queryClient, onHostEvent]);

  // Update query client when it changes
  useEffect(() => {
    if (queryClient) {
      manager.setQueryClient(queryClient);
    }
  }, [manager, queryClient]);

  // Register provided plugins
  useEffect(() => {
    plugins.forEach(plugin => {
      try {
        manager.register(plugin);
        // Auto-mount enabled plugins
        if (manager.isEnabled(plugin.id) && manager.isAvailable(plugin.id)) {
          manager.mountPlugin(plugin.id);
        }
      } catch (error) {
        console.error(`[PluginProvider] Failed to register plugin ${plugin.id}:`, error);
      }
    });

    // Cleanup on unmount
    return () => {
      plugins.forEach(plugin => {
        try {
          manager.unmountPlugin(plugin.id);
          manager.unregister(plugin.id);
        } catch (error) {
          console.error(`[PluginProvider] Failed to cleanup plugin ${plugin.id}:`, error);
        }
      });
    };
  }, [manager, plugins]);

  return (
    <PluginContext.Provider value={manager}>
      {children}
    </PluginContext.Provider>
  );
}

/**
 * Hook to access plugin manager
 */
export function usePlugins(): PluginManager {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within PluginProvider');
  }
  return context;
}

/**
 * Hook to get a specific plugin
 */
export function usePlugin(id: string): DevToolsPlugin | undefined {
  const manager = usePlugins();
  return manager.getPlugin(id);
}

/**
 * Hook to get enabled plugins
 */
export function useEnabledPlugins(): DevToolsPlugin[] {
  const manager = usePlugins();
  const [plugins, setPlugins] = React.useState<DevToolsPlugin[]>([]);

  useEffect(() => {
    const updatePlugins = () => {
      setPlugins(manager.getEnabledPlugins());
    };

    updatePlugins();

    // Listen for plugin changes
    const unsubscribers = [
      manager.getEventEmitter().on('plugin:registered', updatePlugins),
      manager.getEventEmitter().on('plugin:unregistered', updatePlugins),
      manager.getEventEmitter().on('plugin:enabled', updatePlugins),
      manager.getEventEmitter().on('plugin:disabled', updatePlugins)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [manager]);

  return plugins;
}