# Optional Dependencies & Plugin System

React Native Better Dev Tools uses a plugin architecture where each plugin is a separate npm package with its own dependencies.

## Core Package

The core package (`react-native-better-dev-tools-internal`) has minimal dependencies and provides:
- Plugin system infrastructure
- Floating bubble UI
- Type definitions

## Plugin Packages

Each plugin is installed separately with its own dependencies:

### @react-native-better-dev-tools/plugin-wifi-toggle

**Purpose**: Toggle React Query's online/offline state

**Installation**:
```bash
npm install @react-native-better-dev-tools/plugin-wifi-toggle
```

**Dependencies**:
- `@tanstack/react-query` (peer dependency)
- `react-native-svg` (peer dependency)

**Usage**:
```tsx
import wifiTogglePlugin from '@react-native-better-dev-tools/plugin-wifi-toggle';

<DevToolsBubbleWithPlugins
  queryClient={queryClient}
  plugins={[wifiTogglePlugin]}
/>
```

### @react-native-better-dev-tools/plugin-react-query

**Purpose**: Debug React Query cache, queries, and mutations

**Installation**:
```bash
npm install @react-native-better-dev-tools/plugin-react-query
```

**Dependencies**:
- `@tanstack/react-query` (peer dependency)

**Usage**:
```tsx
import reactQueryPlugin from '@react-native-better-dev-tools/plugin-react-query';

<DevToolsBubbleWithPlugins
  queryClient={queryClient}
  plugins={[reactQueryPlugin]}
/>
```

## @react-native-async-storage/async-storage (Optional)

**Feature**: Position Persistence - Remember bubble position across app restarts

### Installation
```bash
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage
```

### What it enables
- Bubble position persists across app restarts
- User's preferred bubble location is remembered

### If not installed
- Position resets to default on app restart
- Position persists during the current session only
- No errors will occur

## How Optional Dependencies Work

The package uses dynamic `require()` statements with try/catch blocks to detect if optional dependencies are installed:

```javascript
// Example from the package
try {
  const reactQuery = require('@tanstack/react-query');
  // Feature is enabled
} catch {
  // Feature is disabled gracefully
}
```

This means:
- ✅ Your app won't crash if dependencies are missing
- ✅ Bundle size is only increased if you install the optional dependencies
- ✅ You can add/remove these dependencies at any time
- ✅ The package works perfectly fine without them

## Development Setup

For package development, these optional dependencies are included as devDependencies to ensure all features can be tested during development.