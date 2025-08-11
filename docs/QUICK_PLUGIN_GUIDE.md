# Quick Plugin Creation Guide

Create a new plugin in 5 minutes! This guide shows you how to create a simple toggle plugin like the WiFi toggle.

## Step-by-Step: Create a Simple Toggle Plugin

Let's create a "Dark Mode Toggle" plugin as an example.

### 1. Create Plugin Package Directory

```bash
mkdir -p packages/plugin-dark-mode
cd packages/plugin-dark-mode
```

### 2. Create package.json

```json
{
  "name": "@react-native-better-dev-tools/plugin-dark-mode",
  "version": "0.1.0",
  "description": "Dark mode toggle for React Native Better Dev Tools",
  "main": "./lib/module/index.js",
  "types": "./lib/typescript/index.d.ts",
  "exports": {
    ".": {
      "source": "./src/index.tsx",
      "types": "./lib/typescript/index.d.ts",
      "default": "./lib/module/index.js"
    }
  },
  "files": [
    "src",
    "lib",
    "!**/__tests__"
  ],
  "scripts": {
    "prepare": "bob build",
    "clean": "del-cli lib",
    "typecheck": "tsc"
  },
  "devDependencies": {
    "@types/react": "^19.0.12",
    "react": "19.0.0",
    "react-native": "0.79.5",
    "react-native-builder-bob": "^0.40.13",
    "react-native-svg": "^15.12.1",
    "typescript": "^5.8.3"
  },
  "peerDependencies": {
    "react": "*",
    "react-native": "*",
    "react-native-better-dev-tools-internal": "*",
    "react-native-svg": ">=15.0.0"
  },
  "react-native-builder-bob": {
    "source": "src",
    "output": "lib",
    "targets": [
      ["module", { "esm": true }],
      ["typescript", { "project": "tsconfig.build.json" }]
    ]
  }
}
```

### 3. Create TypeScript Config

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "jsx": "react-native",
    "declaration": true,
    "outDir": "./lib/typescript",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["**/__tests__/**/*", "lib/**/*", "node_modules"]
}
```

Create `tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["**/__tests__/**/*", "**/__fixtures__/**/*", "**/__mocks__/**/*"]
}
```

### 4. Create the Plugin (src/index.tsx)

```tsx
import { useState, useEffect } from 'react';
import { TouchableOpacity, type ViewStyle } from 'react-native';
import type { DevToolsPlugin, PluginContext } from 'react-native-better-dev-tools-internal';
import Svg, { Path } from 'react-native-svg';

// Icon components
function SunIcon({ size = 16, color = '#FCD34D' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Svg>
  );
}

function MoonIcon({ size = 16, color = '#6366F1' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}

// Plugin Component
function DarkModeToggle({ context, isDragging }: { 
  context: PluginContext; 
  isDragging?: boolean;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved preference
  useEffect(() => {
    context.storage.get('dark-mode:enabled').then(value => {
      if (value !== null) setIsDarkMode(value);
    });
  }, [context.storage]);

  const handleToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Save preference
    context.storage.set('dark-mode:enabled', newMode);
    
    // Notify other plugins or the app
    context.events.emit('dark-mode:changed', { enabled: newMode });
    context.notifyHost({ type: 'dark-mode:toggled', enabled: newMode });
  };

  const buttonStyle: ViewStyle = {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isDragging}
      style={buttonStyle}
      accessibilityLabel={`Dark mode ${isDarkMode ? 'on' : 'off'}`}
    >
      {isDarkMode ? <MoonIcon /> : <SunIcon />}
    </TouchableOpacity>
  );
}

// Plugin Definition
const darkModePlugin: DevToolsPlugin = {
  id: 'dark-mode',
  name: 'Dark Mode Toggle',
  
  // The component shown in the bubble
  component: DarkModeToggle,
  
  // Always available
  checkAvailability: () => true,
  
  // Lifecycle hooks (optional)
  onMount: async (context) => {
    console.log('[Dark Mode Plugin] Mounted');
    const enabled = await context.storage.get('dark-mode:enabled');
    console.log('[Dark Mode Plugin] Current state:', enabled);
  },
  
  onUnmount: async () => {
    console.log('[Dark Mode Plugin] Unmounted');
  },
};

export default darkModePlugin;
```

### 5. Add .gitignore

```
node_modules/
lib/
dist/
*.d.ts
*.d.ts.map
*.js
*.js.map
!src/**/*.ts
!src/**/*.tsx
```

### 6. Build the Plugin

```bash
# From plugin directory
yarn install
yarn prepare
```

### 7. Use in Your App

```tsx
// In your app
import darkModePlugin from '@react-native-better-dev-tools/plugin-dark-mode';

<DevToolsBubbleWithPlugins
  plugins={[darkModePlugin]}
/>
```

## Plugin Anatomy

Every plugin needs:

1. **Package Structure**
   - `package.json` with correct name and build config
   - TypeScript configs
   - Source in `src/index.tsx`

2. **Plugin Definition**
   ```tsx
   const myPlugin: DevToolsPlugin = {
     id: 'unique-id',
     name: 'Display Name',
     component: YourComponent,
     checkAvailability: () => true,
   };
   ```

3. **Component Props**
   ```tsx
   function YourComponent({ 
     context,    // Access to storage, events, etc.
     isDragging  // Is bubble being dragged?
   }: { 
     context: PluginContext; 
     isDragging?: boolean;
   }) { ... }
   ```

## Context API

The `context` object provides:

- **`storage`** - Persistent key-value storage
  ```tsx
  await context.storage.set('key', value);
  const value = await context.storage.get('key');
  ```

- **`events`** - Inter-plugin communication
  ```tsx
  context.events.emit('event-name', data);
  context.events.on('event-name', handler);
  ```

- **`notifyHost`** - Send events to the app
  ```tsx
  context.notifyHost({ type: 'action', data });
  ```

- **`queryClient`** - React Query client (if available)

## Tips

1. **Keep it Simple** - Bubble components should be small and focused
2. **Use SVG Icons** - Import from `react-native-svg` for scalable icons
3. **Persist State** - Use `context.storage` for user preferences
4. **Handle Dragging** - Disable interactions when `isDragging` is true
5. **Test Locally** - Use yarn workspaces for instant hot reload

## Common Patterns

### Toggle Plugin
```tsx
const [isEnabled, setIsEnabled] = useState(false);

const handleToggle = () => {
  const newState = !isEnabled;
  setIsEnabled(newState);
  context.storage.set('my-feature', newState);
  context.events.emit('feature:toggled', newState);
};
```

### Counter Plugin
```tsx
const [count, setCount] = useState(0);

const increment = () => {
  const newCount = count + 1;
  setCount(newCount);
  context.notifyHost({ type: 'counter', value: newCount });
};
```

### Status Indicator
```tsx
const getStatusColor = () => {
  switch(status) {
    case 'active': return '#10B981';
    case 'warning': return '#F59E0B';
    case 'error': return '#EF4444';
    default: return '#6B7280';
  }
};
```

## Next Steps

- Check [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md) for advanced features
- See [Monorepo Setup](./MONOREPO_SETUP.md) to understand the architecture
- Browse existing plugins in `packages/` for examples