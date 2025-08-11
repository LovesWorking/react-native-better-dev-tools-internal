import type { 
  DevToolsPlugin, 
  PluginConfig, 
  PluginContext,
  PluginRegistry,
  StorageAPI,
  EventEmitter
} from '../types/plugin';

/**
 * Simple event emitter implementation
 */
class SimpleEventEmitter implements EventEmitter {
  private events: Map<string, Set<(data?: any) => void>> = new Map();

  emit(event: string, data?: any): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  on(event: string, handler: (data?: any) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off(event: string, handler: (data?: any) => void): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }
}

/**
 * Manages plugin lifecycle and state
 */
export class PluginManager implements PluginRegistry {
  private plugins: Map<string, DevToolsPlugin> = new Map();
  private pluginConfigs: Map<string, PluginConfig> = new Map();
  private mountedPlugins: Set<string> = new Set();
  private eventEmitter: EventEmitter;
  public readonly storage: StorageAPI;
  private queryClient?: any;
  private notifyHost: (event: any) => void;

  constructor(options: {
    storage: StorageAPI;
    queryClient?: any;
    onHostEvent?: (event: any) => void;
  }) {
    this.storage = options.storage;
    this.queryClient = options.queryClient;
    this.notifyHost = options.onHostEvent || (() => {});
    this.eventEmitter = new SimpleEventEmitter();
    
    // Load saved plugin configs
    this.loadPluginConfigs();
  }

  /**
   * Register a new plugin
   */
  register(plugin: DevToolsPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginManager] Plugin ${plugin.id} already registered`);
      return;
    }

    // Check required dependencies
    if (plugin.dependencies?.required) {
      for (const depId of plugin.dependencies.required) {
        if (!this.plugins.has(depId)) {
          throw new Error(`Plugin ${plugin.id} requires ${depId} to be registered first`);
        }
      }
    }

    this.plugins.set(plugin.id, plugin);
    
    // Set default config if not exists
    if (!this.pluginConfigs.has(plugin.id)) {
      this.pluginConfigs.set(plugin.id, plugin.defaultConfig || { enabled: true });
    }

    this.eventEmitter.emit('plugin:registered', { plugin });
    console.log(`[PluginManager] Registered plugin: ${plugin.id}`);
  }

  /**
   * Unregister a plugin
   */
  unregister(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    // Unmount if mounted
    if (this.mountedPlugins.has(id)) {
      this.unmountPlugin(id);
    }

    this.plugins.delete(id);
    this.eventEmitter.emit('plugin:unregistered', { id });
    console.log(`[PluginManager] Unregistered plugin: ${id}`);
  }

  /**
   * Get a specific plugin
   */
  getPlugin(id: string): DevToolsPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): DevToolsPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins that are available
   */
  getEnabledPlugins(): DevToolsPlugin[] {
    return this.getAllPlugins().filter(plugin => 
      this.isEnabled(plugin.id) && this.isAvailable(plugin.id)
    );
  }

  /**
   * Check if plugin is available (dependencies met)
   */
  isAvailable(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    
    try {
      return plugin.checkAvailability();
    } catch (error) {
      console.warn(`[PluginManager] Plugin ${id} availability check failed:`, error);
      return false;
    }
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(id: string): boolean {
    const config = this.pluginConfigs.get(id);
    return config?.enabled ?? false;
  }

  /**
   * Enable a plugin
   */
  enablePlugin(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    const config = this.pluginConfigs.get(id) || { enabled: false };
    config.enabled = true;
    this.pluginConfigs.set(id, config);
    
    this.savePluginConfigs();
    this.eventEmitter.emit('plugin:enabled', { id });
    console.log(`[PluginManager] Enabled plugin: ${id}`);
  }

  /**
   * Disable a plugin
   */
  disablePlugin(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    // Unmount if mounted
    if (this.mountedPlugins.has(id)) {
      this.unmountPlugin(id);
    }

    const config = this.pluginConfigs.get(id) || { enabled: true };
    config.enabled = false;
    this.pluginConfigs.set(id, config);
    
    this.savePluginConfigs();
    this.eventEmitter.emit('plugin:disabled', { id });
    console.log(`[PluginManager] Disabled plugin: ${id}`);
  }

  /**
   * Mount a plugin (call its onMount lifecycle)
   */
  async mountPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin || this.mountedPlugins.has(id)) return;

    if (!this.isEnabled(id) || !this.isAvailable(id)) {
      console.warn(`[PluginManager] Cannot mount plugin ${id}: not enabled or available`);
      return;
    }

    try {
      const context = this.createPluginContext();
      
      if (plugin.onMount) {
        await plugin.onMount(context);
      }
      
      this.mountedPlugins.add(id);
      this.eventEmitter.emit('plugin:mounted', { id });
      console.log(`[PluginManager] Mounted plugin: ${id}`);
    } catch (error) {
      console.error(`[PluginManager] Failed to mount plugin ${id}:`, error);
      this.eventEmitter.emit('plugin:error', { id, error });
    }
  }

  /**
   * Unmount a plugin (call its onUnmount lifecycle)
   */
  async unmountPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin || !this.mountedPlugins.has(id)) return;

    try {
      if (plugin.onUnmount) {
        await plugin.onUnmount();
      }
      
      this.mountedPlugins.delete(id);
      this.eventEmitter.emit('plugin:unmounted', { id });
      console.log(`[PluginManager] Unmounted plugin: ${id}`);
    } catch (error) {
      console.error(`[PluginManager] Failed to unmount plugin ${id}:`, error);
      this.eventEmitter.emit('plugin:error', { id, error });
    }
  }

  /**
   * Create plugin context for a plugin
   */
  private createPluginContext(): PluginContext {
    return {
      storage: this.storage,
      events: this.eventEmitter,
      queryClient: this.queryClient,
      notifyHost: this.notifyHost,
      getPlugin: (id: string) => this.getPlugin(id)
    };
  }

  /**
   * Load plugin configurations from storage
   */
  private async loadPluginConfigs(): Promise<void> {
    try {
      const configs = await this.storage.get('plugin_configs');
      if (configs) {
        Object.entries(configs).forEach(([id, config]) => {
          this.pluginConfigs.set(id, config as PluginConfig);
        });
      }
    } catch (error) {
      console.warn('[PluginManager] Failed to load plugin configs:', error);
    }
  }

  /**
   * Save plugin configurations to storage
   */
  private async savePluginConfigs(): Promise<void> {
    try {
      const configs: Record<string, PluginConfig> = {};
      this.pluginConfigs.forEach((config, id) => {
        configs[id] = config;
      });
      await this.storage.set('plugin_configs', configs);
    } catch (error) {
      console.warn('[PluginManager] Failed to save plugin configs:', error);
    }
  }

  /**
   * Get event emitter for external listeners
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Update query client (for hot reload support)
   */
  setQueryClient(queryClient: any): void {
    this.queryClient = queryClient;
  }
}