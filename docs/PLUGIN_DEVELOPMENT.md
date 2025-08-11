# Plugin Development Guide

## Overview

The React Native Better Dev Tools plugin system allows you to create modular, reusable dev tool components that integrate seamlessly with the floating bubble interface. This guide will walk you through creating new plugins for tools like Sentry, Redux, or any other development tool.

## Table of Contents

1. [Plugin Architecture](#plugin-architecture)
2. [Creating a New Plugin](#creating-a-new-plugin)
3. [Plugin API Reference](#plugin-api-reference)
4. [Examples](#examples)
5. [Best Practices](#best-practices)

## Plugin Architecture

### Core Components

```
src/
├── floatingBubble/
│   ├── types/plugin.ts         # Plugin interfaces and types
│   ├── core/PluginManager.ts   # Plugin lifecycle management
│   └── providers/PluginProvider.tsx  # React context provider
└── plugins/                    # Your plugins go here
    ├── wifi-toggle/            # Example: WiFi toggle plugin
    ├── react-query/            # Example: React Query plugin
    └── your-plugin/            # Your new plugin
```

## Creating a New Plugin

### Step 1: Create Plugin Directory

Create a new directory for your plugin in `src/plugins/`:

```bash
mkdir src/plugins/sentry-plugin
```

### Step 2: Define Your Plugin Structure

Create `src/plugins/sentry-plugin/index.tsx`:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DevToolsPlugin, PluginContext } from '../../floatingBubble/types/plugin';

// Optional: Create an icon component or import one
import { AlertCircleIcon } from '../../icons/lucide-icons';

/**
 * Bubble Component - Shown in the floating bubble
 * This is the compact view that's always visible
 */
function SentryBubbleComponent({ 
  context, 
  isDragging 
}: { 
  context: PluginContext; 
  isDragging?: boolean;
}) {
  // Access Sentry instance if needed
  const sentry = getSentryInstance(); // Your logic here
  
  // Use plugin storage for persistent state
  const [errorCount, setErrorCount] = React.useState(0);
  
  React.useEffect(() => {
    // Load saved state
    context.storage.get('sentry:errorCount').then(count => {
      if (count) setErrorCount(count);
    });
  }, [context.storage]);

  const handlePress = () => {
    if (!isDragging) {
      // Emit event to open modal
      context.events.emit('sentry:open-modal');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDragging}
      style={styles.bubbleContainer}
    >
      <AlertCircleIcon size={14} color="#EF4444" />
      {errorCount > 0 && (
        <Text style={styles.errorBadge}>{errorCount}</Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * Modal Component - Expanded view (optional)
 * This is shown when the user taps on your bubble component
 */
function SentryModalComponent({ 
  context, 
  onClose 
}: { 
  context: PluginContext; 
  onClose: () => void;
}) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Sentry Error Tracking</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.modalContent}>
        {/* Your detailed Sentry UI here */}
        <Text>Error details, breadcrumbs, etc.</Text>
      </View>
    </View>
  );
}

/**
 * Plugin Definition
 */
export const sentryPlugin: DevToolsPlugin = {
  // Unique identifier for your plugin
  id: 'sentry',
  
  // Display name
  name: 'Sentry Error Tracking',
  
  // Optional: Icon component for plugin settings
  icon: AlertCircleIcon,
  
  // Bubble component (required for visible plugins)
  component: SentryBubbleComponent,
  
  // Modal component (optional)
  modalComponent: SentryModalComponent,
  
  // Check if the plugin dependencies are available
  checkAvailability: () => {
    try {
      // Check if Sentry is installed
      const Sentry = require('@sentry/react-native');
      return !!Sentry;
    } catch {
      return false;
    }
  },
  
  // Called when plugin is mounted
  onMount: async (context) => {
    console.log('[Sentry Plugin] Mounted');
    
    // Set up Sentry hooks/listeners
    const Sentry = require('@sentry/react-native');
    
    // Example: Listen to Sentry events
    Sentry.addGlobalEventProcessor((event) => {
      // Update error count
      context.storage.get('sentry:errorCount').then(count => {
        const newCount = (count || 0) + 1;
        context.storage.set('sentry:errorCount', newCount);
        
        // Notify other plugins if needed
        context.events.emit('error:captured', event);
      });
      
      return event;
    });
  },
  
  // Called when plugin is unmounted
  onUnmount: async () => {
    console.log('[Sentry Plugin] Unmounted');
    // Clean up listeners
  },
  
  // Default configuration
  defaultConfig: {
    enabled: true,
    settings: {
      showInBubble: true,
      captureErrors: true,
      captureBreadcrumbs: true,
    }
  }
};

const styles = StyleSheet.create({
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  errorBadge: {
    backgroundColor: '#DC2626',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    minWidth: 16,
    textAlign: 'center',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    maxHeight: 400,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#9CA3AF',
    fontSize: 20,
  },
  modalContent: {
    padding: 16,
  },
});
```

### Step 3: Register Your Plugin

In your app, register the plugin with the DevToolsBubbleWithPlugins:

```tsx
import { DevToolsBubbleWithPlugins } from 'react-native-better-dev-tools-internal';
import { sentryPlugin } from 'react-native-better-dev-tools-internal/plugins/sentry';

function App() {
  return (
    <DevToolsBubbleWithPlugins
      // ... other props
      plugins={[
        sentryPlugin,
        // ... other plugins
      ]}
    />
  );
}
```

## Plugin API Reference

### DevToolsPlugin Interface

```typescript
interface DevToolsPlugin {
  // Required
  id: string;                    // Unique identifier
  name: string;                   // Display name
  checkAvailability: () => boolean; // Check if dependencies are available
  
  // Optional UI Components
  component?: ComponentType<{     // Bubble component
    context: PluginContext;
    isDragging?: boolean;
  }>;
  
  modalComponent?: ComponentType<{ // Modal component
    context: PluginContext;
    onClose: () => void;
  }>;
  
  icon?: ComponentType<{          // Icon for settings
    size?: number;
    color?: string;
  }>;
  
  // Lifecycle Hooks
  onMount?: (context: PluginContext) => void | Promise<void>;
  onUnmount?: () => void | Promise<void>;
  
  // Configuration
  defaultConfig?: PluginConfig;
}
```

### PluginContext Interface

```typescript
interface PluginContext {
  // Storage API for persistent data
  storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
  };
  
  // Event emitter for inter-plugin communication
  events: {
    emit(event: string, data?: any): void;
    on(event: string, handler: (data?: any) => void): () => void;
    off(event: string, handler: (data?: any) => void): void;
  };
  
  // Access to React Query client (if available)
  queryClient?: QueryClient;
  
  // Notify the host app of events
  notifyHost: (event: any) => void;
  
  // Get another plugin by ID
  getPlugin: (id: string) => DevToolsPlugin | undefined;
}
```

## Examples

### Redux DevTools Plugin

```tsx
export const reduxPlugin: DevToolsPlugin = {
  id: 'redux',
  name: 'Redux DevTools',
  
  component: ({ context, isDragging }) => {
    const store = useStore(); // Your Redux store
    const state = useSelector(state => state);
    
    return (
      <TouchableOpacity
        onPress={() => context.events.emit('redux:open-modal')}
        disabled={isDragging}
      >
        <Text>Redux ({Object.keys(state).length})</Text>
      </TouchableOpacity>
    );
  },
  
  modalComponent: ({ context, onClose }) => {
    const store = useStore();
    const [actions, setActions] = useState([]);
    
    // Track dispatched actions
    useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        // Log action history
      });
      return unsubscribe;
    }, [store]);
    
    return (
      <View>
        {/* Redux state tree viewer */}
        {/* Action history */}
        {/* Time travel debugging */}
      </View>
    );
  },
  
  checkAvailability: () => {
    try {
      require('react-redux');
      return true;
    } catch {
      return false;
    }
  },
};
```

### Network Monitor Plugin

```tsx
export const networkPlugin: DevToolsPlugin = {
  id: 'network',
  name: 'Network Monitor',
  
  component: ({ context }) => {
    const [requestCount, setRequestCount] = useState(0);
    const [activeRequests, setActiveRequests] = useState(0);
    
    useEffect(() => {
      // Intercept fetch/XMLHttpRequest
      const originalFetch = global.fetch;
      
      global.fetch = async (...args) => {
        setActiveRequests(prev => prev + 1);
        setRequestCount(prev => prev + 1);
        
        try {
          const response = await originalFetch(...args);
          
          // Log to storage
          const logs = await context.storage.get('network:logs') || [];
          logs.push({
            url: args[0],
            status: response.status,
            timestamp: Date.now(),
          });
          await context.storage.set('network:logs', logs);
          
          return response;
        } finally {
          setActiveRequests(prev => prev - 1);
        }
      };
      
      return () => {
        global.fetch = originalFetch;
      };
    }, [context.storage]);
    
    return (
      <View>
        <Text>🌐 {requestCount} ({activeRequests})</Text>
      </View>
    );
  },
  
  checkAvailability: () => true, // Always available
};
```

## Best Practices

### 1. Check Dependencies

Always verify that required libraries are available:

```tsx
checkAvailability: () => {
  try {
    require('@sentry/react-native');
    require('sentry-expo');
    return true;
  } catch {
    return false;
  }
}
```

### 2. Use Storage for Persistence

Store plugin state that should survive app restarts:

```tsx
// Save state
await context.storage.set('myplugin:state', { count: 5 });

// Load state
const state = await context.storage.get('myplugin:state');
```

### 3. Communicate Between Plugins

Use events for inter-plugin communication:

```tsx
// Emit event from one plugin
context.events.emit('error:captured', errorData);

// Listen in another plugin
useEffect(() => {
  const unsubscribe = context.events.on('error:captured', (data) => {
    console.log('Error captured by another plugin:', data);
  });
  return unsubscribe;
}, [context.events]);
```

### 4. Handle Modal State Properly

Use the event system to open modals:

```tsx
// In bubble component
const handlePress = () => {
  context.events.emit('myplugin:open-modal');
};

// In parent component (handled automatically by DevToolsBubbleWithPlugins)
```

### 5. Clean Up Resources

Always clean up in onUnmount:

```tsx
onUnmount: async () => {
  // Remove listeners
  // Clear intervals/timeouts
  // Restore monkey-patched functions
}
```

### 6. Performance Considerations

- Keep bubble components lightweight
- Use memo/callbacks where appropriate
- Defer heavy operations to modal view
- Limit storage operations

### 7. TypeScript Support

Create proper types for your plugin:

```tsx
// types.ts
export interface SentryPluginSettings {
  captureErrors: boolean;
  captureBreadcrumbs: boolean;
  environment?: string;
}

export interface SentryError {
  id: string;
  message: string;
  timestamp: number;
  level: 'error' | 'warning' | 'info';
}
```

## Testing Your Plugin

1. **Unit Tests**: Test plugin logic separately
2. **Integration Tests**: Test with the plugin system
3. **Manual Testing**: Test in the example app

```tsx
// __tests__/sentry-plugin.test.tsx
import { render } from '@testing-library/react-native';
import { sentryPlugin } from '../sentry-plugin';

describe('Sentry Plugin', () => {
  it('should check availability correctly', () => {
    expect(sentryPlugin.checkAvailability()).toBe(false);
    
    // Mock Sentry
    jest.mock('@sentry/react-native', () => ({}), { virtual: true });
    
    expect(sentryPlugin.checkAvailability()).toBe(true);
  });
  
  it('should render bubble component', () => {
    const { component: BubbleComponent } = sentryPlugin;
    const { getByText } = render(
      <BubbleComponent context={mockContext} />
    );
    // Test your component
  });
});
```

## Troubleshooting

### Plugin Not Showing

1. Check `checkAvailability()` returns true
2. Verify plugin is registered in `plugins` array
3. Check plugin is enabled (default: true)
4. Ensure `component` is defined for visible plugins

### Modal Not Opening

1. Verify `modalComponent` is defined
2. Check event name matches: `context.events.emit('plugin-id:open-modal')`
3. Ensure bubble component isn't disabled during drag

### Storage Not Persisting

1. Use unique keys: `'plugin-id:key-name'`
2. Stringify complex objects before storing
3. Handle async operations properly

## Need Help?

- Check existing plugins in `src/plugins/` for examples
- Review the plugin types in `src/floatingBubble/types/plugin.ts`
- Test your plugin in the example app at `example/`

Happy plugin development! 🚀