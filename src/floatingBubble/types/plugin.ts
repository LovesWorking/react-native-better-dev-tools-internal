import type { ComponentType } from 'react';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Storage API for plugin persistence
 */
export interface StorageAPI {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * Event emitter for inter-plugin communication
 */
export interface EventEmitter {
  emit(event: string, data?: any): void;
  on(event: string, handler: (data?: any) => void): () => void;
  off(event: string, handler: (data?: any) => void): void;
}

/**
 * Context provided to plugins for accessing shared resources
 */
export interface PluginContext {
  // Access to persistence layer
  storage: StorageAPI;
  
  // Inter-plugin communication
  events: EventEmitter;
  
  // Optional React Query client if available
  queryClient?: QueryClient;
  
  // Notify host application of events
  notifyHost: (event: any) => void;
  
  // Get other plugin instances
  getPlugin: (id: string) => DevToolsPlugin | undefined;
}

/**
 * Configuration for a plugin
 */
export interface PluginConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}

/**
 * Core plugin interface
 * All plugins must implement this interface
 */
export interface DevToolsPlugin {
  // Unique identifier for the plugin
  id: string;
  
  // Display name shown in UI
  name: string;
  
  // Optional icon component for the plugin
  icon?: ComponentType<{ size?: number; color?: string }>;
  
  // Component to render in the bubble (compact view)
  component?: ComponentType<{ context: PluginContext; isDragging?: boolean }>;
  
  // Component to render in expanded modal view
  modalComponent?: ComponentType<{ context: PluginContext; onClose: () => void }>;
  
  // Check if this plugin can be used in current environment
  checkAvailability: () => boolean;
  
  // Called when plugin is mounted
  onMount?: (context: PluginContext) => void | Promise<void>;
  
  // Called when plugin is unmounted
  onUnmount?: () => void | Promise<void>;
  
  // Plugin configuration
  defaultConfig?: PluginConfig;
  
  // Validate plugin configuration
  validateConfig?: (config: PluginConfig) => boolean;
  
  // Plugin dependencies (other plugin IDs)
  dependencies?: {
    required?: string[];
    optional?: string[];
  };
}

/**
 * Plugin lifecycle events
 */
export type PluginEvent = 
  | { type: 'PLUGIN_REGISTERED'; plugin: DevToolsPlugin }
  | { type: 'PLUGIN_UNREGISTERED'; id: string }
  | { type: 'PLUGIN_ENABLED'; id: string }
  | { type: 'PLUGIN_DISABLED'; id: string }
  | { type: 'PLUGIN_MOUNTED'; id: string }
  | { type: 'PLUGIN_UNMOUNTED'; id: string }
  | { type: 'PLUGIN_ERROR'; id: string; error: Error }
  | { type: 'PLUGIN_CONFIG_CHANGED'; id: string; config: PluginConfig };

/**
 * Plugin registry interface
 */
export interface PluginRegistry {
  register(plugin: DevToolsPlugin): void;
  unregister(id: string): void;
  getPlugin(id: string): DevToolsPlugin | undefined;
  getAllPlugins(): DevToolsPlugin[];
  getEnabledPlugins(): DevToolsPlugin[];
  isAvailable(id: string): boolean;
  isEnabled(id: string): boolean;
  enablePlugin(id: string): void;
  disablePlugin(id: string): void;
}