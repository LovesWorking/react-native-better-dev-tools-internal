// Main component
export { DevToolsBubbleWithPlugins } from './floatingBubble/DevToolsBubbleWithPlugins';
export { DevToolsBubbleWithPlugins as DevToolsBubble } from './floatingBubble/DevToolsBubbleWithPlugins'; // Alias for simplicity

// Plugin system
export { PluginProvider, usePlugins, usePlugin, useEnabledPlugins } from './floatingBubble/providers/PluginProvider';
export { PluginManager } from './floatingBubble/core/PluginManager';
export type {
  DevToolsPlugin,
  PluginContext,
  PluginConfig,
  PluginRegistry,
  PluginEvent,
  StorageAPI,
  EventEmitter,
} from './floatingBubble/types/plugin';

// Types
export type {
  DevToolsBubbleProps,
  UserRole,
  Environment,
} from './floatingBubble/types';

// Plugins are now in separate packages:
// @react-native-better-dev-tools/plugin-wifi-toggle
// @react-native-better-dev-tools/plugin-react-query

// Export helpers for optional dependencies
export {
  initializeStorage,
  isAsyncStorageAvailable,
} from './floatingBubble/utils/storageHelper';
