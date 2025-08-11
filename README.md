# React Native Better Dev Tools

A powerful, extensible floating dev tools bubble for React Native applications with a plugin architecture.

## Features

- 🎯 **Floating Bubble Interface** - Draggable, always-accessible dev tools
- 🔌 **Plugin Architecture** - Extend with custom dev tools
- 📦 **Monorepo Structure** - Each plugin is a separate package
- 🔥 **Hot Reload** - Instant updates during development
- 📝 **TypeScript** - Full type safety
- 🎨 **Customizable** - Show/hide features as needed

## Quick Start

### Installation

```bash
# Install the core package
npm install react-native-better-dev-tools-internal

# Install plugins you want
npm install @react-native-better-dev-tools/plugin-wifi-toggle
npm install @react-native-better-dev-tools/plugin-react-query
```

### Basic Usage

```tsx
import { DevToolsBubbleWithPlugins } from 'react-native-better-dev-tools-internal';
import wifiTogglePlugin from '@react-native-better-dev-tools/plugin-wifi-toggle';
import reactQueryPlugin from '@react-native-better-dev-tools/plugin-react-query';

function App() {
  return (
    <>
      <DevToolsBubbleWithPlugins
        userRole="admin"
        environment="dev"
        queryClient={queryClient} // Optional: for React Query
        plugins={[
          wifiTogglePlugin,
          reactQueryPlugin
        ]}
      />
      {/* Your app content */}
    </>
  );
}
```

## Available Plugins

| Plugin | Package | Description |
|--------|---------|-------------|
| WiFi Toggle | `@react-native-better-dev-tools/plugin-wifi-toggle` | Toggle online/offline state |
| React Query | `@react-native-better-dev-tools/plugin-react-query` | Debug queries & mutations |

## Documentation

- [📚 Plugin Development Guide](./docs/PLUGIN_DEVELOPMENT.md) - Create your own plugins
- [🏗️ Monorepo Setup](./docs/MONOREPO_SETUP.md) - How the architecture works
- [⚡ Quick Plugin Tutorial](./docs/QUICK_PLUGIN_GUIDE.md) - 5-minute plugin creation

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
