# Project Structure Overview

Complete guide to the React Native Better Dev Tools codebase organization.

## Root Directory

```
react-native-better-dev-tools-internal/
├── docs/                    # Documentation
├── example/                 # Example React Native app
├── lib/                    # Built core library (gitignored)
├── packages/               # Plugin packages
├── src/                    # Core library source
├── .gitignore
├── package.json            # Root package with workspaces
├── README.md              # Main documentation
└── tsconfig.json          # Root TypeScript config
```

## Core Library (`src/`)

```
src/
├── index.tsx                           # Main exports
├── floatingBubble/
│   ├── DevToolsBubbleWithPlugins.tsx # Plugin-enabled bubble
│   ├── components/
│   │   ├── Divider.tsx               # UI separator
│   │   ├── EnvironmentIndicator.tsx  # Environment badge
│   │   └── UserStatus.tsx            # User role badge
│   ├── core/
│   │   └── PluginManager.ts          # Plugin lifecycle management
│   ├── hooks/
│   │   └── usePositionPersistence.ts # Bubble position persistence
│   ├── providers/
│   │   └── PluginProvider.tsx        # React context for plugins
│   ├── types/
│   │   └── plugin.ts                 # Plugin type definitions
│   ├── types.ts                      # Core type definitions
│   └── utils/
│       └── storageHelper.ts          # AsyncStorage wrapper
└── icons/
    ├── lucide-icons.tsx              # Icon components
    └── index.ts                      # Icon exports
```

## Plugin Packages (`packages/`)

Each plugin is a standalone npm package:

```
packages/
├── plugin-wifi-toggle/
│   ├── src/
│   │   └── index.tsx              # Plugin implementation
│   ├── lib/                       # Built output (gitignored)
│   ├── package.json               # Package configuration
│   ├── tsconfig.json              # TypeScript config
│   ├── tsconfig.build.json        # Build-specific config
│   └── .gitignore
└── plugin-react-query/
    └── (same structure)
```

## Example App (`example/`)

```
example/
├── src/
│   ├── App.tsx                    # Main app with dev tools
│   └── QueryClientWrapper.tsx    # React Query setup
├── ios/                          # iOS project
├── android/                      # Android project
├── package.json
└── metro.config.js
```

## Documentation (`docs/`)

```
docs/
├── PLUGIN_DEVELOPMENT.md          # Comprehensive plugin guide
├── QUICK_PLUGIN_GUIDE.md         # 5-minute plugin tutorial
├── MONOREPO_SETUP.md             # Architecture explanation
└── PROJECT_STRUCTURE.md          # This file
```

## Build Outputs (gitignored)

```
lib/                              # Core library build
packages/*/lib/                   # Plugin builds
*.d.ts                           # TypeScript definitions
*.d.ts.map                       # Source maps
```

## Key Files

### `package.json` (root)
- Defines workspaces
- Core dependencies
- Build scripts

### `tsconfig.json` (root)
- Base TypeScript configuration
- Inherited by all packages

### `packages/*/package.json`
- Individual plugin configuration
- Peer dependencies
- Build settings

## File Naming Conventions

- **Components**: PascalCase (`DevToolsBubbleWithPlugins.tsx`)
- **Hooks**: camelCase with 'use' prefix (`usePositionPersistence.ts`)
- **Types**: PascalCase for types, camelCase for files (`plugin.ts`)
- **Utils**: camelCase (`storageHelper.ts`)
- **Plugins**: kebab-case directories (`plugin-wifi-toggle/`)

## Import Paths

### In Core Library
```tsx
// Relative imports within core
import { PluginManager } from './core/PluginManager';
import type { DevToolsPlugin } from './types/plugin';
```

### In Plugins
```tsx
// Import from core package
import type { DevToolsPlugin, PluginContext } from 'react-native-better-dev-tools-internal';

// Import peer dependencies
import { onlineManager } from '@tanstack/react-query';
```

### In Apps
```tsx
// Import core
import { DevToolsBubbleWithPlugins } from 'react-native-better-dev-tools-internal';

// Import plugins
import wifiTogglePlugin from '@react-native-better-dev-tools/plugin-wifi-toggle';
```

## Build Process

1. **Core Library**: Built with React Native Builder Bob
   - Source: `src/`
   - Output: `lib/`
   - Command: `yarn prepare`

2. **Plugin Packages**: Each built independently
   - Source: `packages/*/src/`
   - Output: `packages/*/lib/`
   - Command: `yarn prepare` (in package dir)

3. **Example App**: Standard React Native build
   - Uses Metro bundler
   - Links local packages via workspaces

## Development Workflow

1. **Make changes** in source files
2. **Hot reload** updates example app automatically
3. **Build** for production with `yarn prepare`
4. **Test** in example app
5. **Publish** individual packages to npm

## Git Strategy

### Tracked
- Source files (`*.ts`, `*.tsx`)
- Configuration (`package.json`, `tsconfig.json`)
- Documentation (`*.md`)

### Ignored
- Build outputs (`lib/`, `*.d.ts`)
- Dependencies (`node_modules/`)
- IDE files (`.vscode/`, `.idea/`)

## Common Locations

- **Add new plugin**: `packages/plugin-name/`
- **Update core types**: `src/floatingBubble/types/plugin.ts`
- **Add icons**: `src/icons/lucide-icons.tsx`
- **Test changes**: `example/src/App.tsx`
- **Update docs**: `docs/` or root `README.md`