# Monorepo Architecture Guide

This guide explains how the React Native Better Dev Tools monorepo is structured and how to set up a similar architecture.

## Overview

The monorepo uses:
- **Yarn Workspaces** for dependency management
- **React Native Builder Bob** for building packages
- **TypeScript** for type safety
- **Hot reload** during development

## Directory Structure

```
react-native-better-dev-tools-internal/
├── src/                          # Core library source
│   ├── floatingBubble/          # Main components
│   ├── icons/                   # Icon components
│   └── index.tsx                # Main exports
├── packages/                     # Plugin packages (workspaces)
│   ├── plugin-wifi-toggle/      # Individual plugin package
│   │   ├── src/                 # Plugin source
│   │   ├── lib/                 # Built output (gitignored)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── plugin-react-query/      # Another plugin
├── example/                      # Example app (workspace)
│   ├── src/
│   └── package.json
├── lib/                         # Core library build (gitignored)
├── package.json                 # Root package with workspaces
└── tsconfig.json               # Root TypeScript config
```

## How It Was Set Up

### 1. Initialize Monorepo

The project was created with React Native Builder Bob:

```bash
npx create-react-native-library@latest react-native-better-dev-tools-internal
```

### 2. Configure Workspaces

In root `package.json`:

```json
{
  "workspaces": [
    "example",
    "packages/*"
  ],
  "packageManager": "yarn@3.6.1"
}
```

### 3. Create Plugin Package Structure

For each plugin:

```bash
mkdir -p packages/plugin-name
cd packages/plugin-name
```

Create `package.json`:
```json
{
  "name": "@react-native-better-dev-tools/plugin-name",
  "version": "0.1.0",
  "main": "./lib/module/index.js",
  "types": "./lib/typescript/index.d.ts",
  "exports": {
    ".": {
      "source": "./src/index.tsx",
      "types": "./lib/typescript/index.d.ts",
      "default": "./lib/module/index.js"
    }
  },
  "peerDependencies": {
    "react-native-better-dev-tools-internal": "*"
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

### 4. TypeScript Configuration

Each package has its own `tsconfig.json`:

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
  "exclude": ["lib/**/*", "node_modules"]
}
```

### 5. Build Configuration

React Native Builder Bob handles the build process. Each package has:

```json
"scripts": {
  "prepare": "bob build",
  "clean": "del-cli lib",
  "typecheck": "tsc"
}
```

### 6. Git Configuration

`.gitignore` excludes build artifacts:

```
# Build outputs
lib/
packages/*/lib/

# TypeScript artifacts
src/**/*.d.ts
src/**/*.d.ts.map
```

## Development Workflow

### Installing Dependencies

From the root directory:

```bash
yarn install
```

This installs dependencies for all workspaces.

### Building Packages

Build everything:
```bash
yarn prepare
```

Build specific package:
```bash
cd packages/plugin-name
yarn prepare
```

### Hot Reload During Development

Changes to plugin source files are immediately reflected in the example app because:

1. Yarn workspaces symlink local packages
2. Metro bundler watches all workspace files
3. No build step needed during development

### Adding a New Plugin

1. Create package directory:
   ```bash
   mkdir -p packages/plugin-new
   ```

2. Copy package.json template from existing plugin

3. Write plugin in `src/index.tsx`

4. Install dependencies:
   ```bash
   yarn install
   ```

5. Use in example app:
   ```tsx
   import newPlugin from '@react-native-better-dev-tools/plugin-new';
   ```

## Key Concepts

### Workspace Resolution

Yarn workspaces automatically:
- Link local packages
- Hoist common dependencies
- Manage peer dependencies

### Peer Dependencies

Plugins declare the core package as a peer dependency:

```json
"peerDependencies": {
  "react-native-better-dev-tools-internal": "*"
}
```

This ensures they use the same instance as the host app.

### Type Sharing

The core package exports types:

```tsx
// In core package
export type { DevToolsPlugin, PluginContext } from './types';

// In plugin
import type { DevToolsPlugin } from 'react-native-better-dev-tools-internal';
```

### Build Isolation

Each package builds independently:
- Own TypeScript config
- Own build output
- Own dependencies

## Benefits

1. **Clean Separation** - Each plugin is independent
2. **Version Control** - Plugins can be versioned separately
3. **Optional Dependencies** - Apps only install what they need
4. **Hot Reload** - Instant updates during development
5. **Type Safety** - Full TypeScript support
6. **Publishing** - Plugins can be published to npm

## Common Issues & Solutions

### Issue: Module not found

**Solution**: Run `yarn install` from root to link workspaces.

### Issue: TypeScript errors in plugin

**Solution**: Ensure plugin imports types from core package, not relative paths.

### Issue: Build artifacts in git

**Solution**: Check `.gitignore` includes `packages/*/lib/`.

### Issue: Changes not reflecting

**Solution**: 
1. Clear Metro cache: `yarn start --reset-cache`
2. Rebuild: `yarn prepare`

## Publishing Plugins

Each plugin can be published independently:

```bash
cd packages/plugin-name
npm publish --access public
```

## Advanced Topics

### Sharing Code Between Plugins

Create a shared utilities package:

```bash
packages/
  shared-utils/
    src/
      helpers.ts
  plugin-a/
    src/
      index.tsx  # imports from @react-native-better-dev-tools/shared-utils
```

### Testing Plugins

Add Jest to plugin package:

```json
"scripts": {
  "test": "jest"
},
"jest": {
  "preset": "react-native"
}
```

### CI/CD

Use GitHub Actions to:
- Build all packages
- Run tests
- Publish on release

## Resources

- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [React Native Builder Bob](https://github.com/callstack/react-native-builder-bob)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)