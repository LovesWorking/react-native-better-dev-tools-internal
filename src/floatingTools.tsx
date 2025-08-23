// Re-export the updated DevToolsBubbleWithPlugins as the main floating tools component
export { DevToolsBubbleWithPlugins as FloatingTools } from './floatingBubble/DevToolsBubbleWithPlugins';
export type { DevToolsBubbleProps as FloatingToolsProps } from './floatingBubble/types';
export type { DevToolsPlugin, PluginContext } from './floatingBubble/types/plugin';

// Re-export components that might be needed
export { EnvironmentIndicator } from './floatingBubble/components/EnvironmentIndicator';
export { UserStatus } from './floatingBubble/components/UserStatus';
export { Divider } from './floatingBubble/components/Divider';

// Re-export plugin provider for custom plugin implementations
export { PluginProvider } from './floatingBubble/providers/PluginProvider';