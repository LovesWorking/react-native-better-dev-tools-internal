# React Native Better Dev Tools - Complete Structure Map

## 🎯 Quick Navigation Guide

### Core Implementation Locations
```
src/floatingBubble/                    ← Main dev tools bubble with plugin architecture
├── DevToolsBubbleWithPlugins.tsx      ← PRIMARY COMPONENT - Plugin-enabled bubble
├── components/                         ← Visual components (updated to match new style)
│   ├── EnvironmentIndicator.tsx       ✅ MIGRATED to gameUIColors
│   ├── UserStatus.tsx                  ✅ MIGRATED to gameUIColors  
│   └── Divider.tsx                     ✅ MIGRATED to gameUIColors
├── dial/                               ← COPIED from rn-better-dev-tools (original menus)
│   ├── DialDevTools.tsx                ← Dial menu with 6 tool icons
│   ├── DialIcon.tsx                    ← Individual dial icon component
│   ├── Dial2.tsx                       ← List-style menu variant
│   └── DialIndicator.tsx               ✅ MIGRATED from reanimated to Animated API
├── ClaudeGridMenuOriginal.tsx          ← COPIED - Cyberpunk grid menu
├── CyberpunkGlitchBackgroundOriginal.tsx ← COPIED - Background effects
├── lucide-icons.tsx                    ← COPIED - Pure React Native icon implementations
├── svgs.tsx                            ← COPIED - SVG components (TanstackLogo, etc.)
└── useSafeAreaInsets.ts               ← COPIED - Safe area utilities
```

### Plugin System
```
packages/
├── plugin-wifi-toggle/                 ← WiFi toggle plugin
│   └── src/index.tsx                   
└── plugin-react-query/                 ← React Query debugging plugin
    └── src/index.tsx                   
```

### New FloatingTools (Reference Implementation)
```
rn-better-dev-tools/src/components/bubble/
├── floatingTools.tsx                   ← NEW self-contained implementation (DO NOT MODIFY)
├── dial/                               ← Original dial menus source
│   ├── DialDevTools.tsx               
│   ├── DialIcon.tsx                   
│   └── Dial2.tsx                      
└── ClaudeGridMenu.tsx                  ← Original grid menu source
```

## 📁 File Status Legend
- ✅ **MIGRATED** - Updated to use gameUIColors and pure JS animations
- 📋 **COPIED** - Copied from rn-better-dev-tools without modification
- 🔧 **MODIFIED** - Original file with updates
- 📦 **NEW** - Created for this implementation
- 🚫 **DO NOT MODIFY** - Reference implementation

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DevToolsBubbleWithPlugins                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Plugin Architecture                                 │   │
│  │  - PluginManager                                    │   │
│  │  - Dynamic plugin loading                           │   │
│  │  - Plugin lifecycle (mount/unmount)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Visual Components (gameUIColors themed)            │   │
│  │  - EnvironmentIndicator                             │   │
│  │  - UserStatus (triggers menu on press)              │   │
│  │  - Divider                                          │   │
│  │  - GripVerticalIcon (pure View-based)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Menu System (3 types)                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │   │
│  │  │ DialDevTools │ │ ClaudeGrid   │ │   Dial2     │ │   │
│  │  │   (dial)     │ │ (cyberpunk)  │ │   (list)    │ │   │
│  │  └──────────────┘ └──────────────┘ └─────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Migration Status

### ✅ Completed Migrations
1. **Visual Components** → gameUIColors theme system
   - `EnvironmentIndicator.tsx`
   - `UserStatus.tsx`  
   - `Divider.tsx`
   - `GripVerticalIcon` (created as pure View component)

2. **Menu Components** → Copied from rn-better-dev-tools
   - `dial/DialDevTools.tsx`
   - `dial/DialIcon.tsx`
   - `dial/Dial2.tsx`
   - `ClaudeGridMenuOriginal.tsx`
   - `CyberpunkGlitchBackgroundOriginal.tsx`

3. **Animation System** → React Native Animated API
   - `dial/DialIndicator.tsx` - Migrated from reanimated
   - All animations now use pure JS Animated API
   - No native dependencies

4. **Import Paths** → Fixed to avoid reanimated
   - All gameUI imports use direct paths to constants
   - Bypasses index files that load reanimated components

## 🎮 Menu System Details

### Menu Types
```
menuType: 'dial' | 'grid' | 'dial2'
```

### Dial Menu (`dial`)
- Circular arrangement of 6 tool icons
- Animated spiral entrance/exit
- Icons: Query, Network, Env, Storage, WiFi, Sentry
- Center button: "RN BETTER DEV TOOLS"

### Grid Menu (`grid`) 
- Cyberpunk-themed grid layout
- Glitch effects and neon styling
- Matrix-like background animation
- Same 6 tools in grid format

### List Menu (`dial2`)
- Vertical list presentation
- Simpler, more traditional UI
- Quick access to all tools
- Footer with version info

## 🚀 Quick Start Commands

```bash
# Run tests
yarn test

# Check types
yarn typecheck

# Lint code
yarn lint

# Run example app
cd example
yarn ios

# Take screenshot
peekaboo image --app Simulator --path /tmp/screenshot.png
```

## 📝 Key Files to Edit

### To modify bubble appearance:
- `src/floatingBubble/components/EnvironmentIndicator.tsx`
- `src/floatingBubble/components/UserStatus.tsx`

### To add new menu type:
1. Copy menu component to `src/floatingBubble/`
2. Add to `DevToolsBubbleWithPlugins.tsx` menu rendering
3. Update `menuType` union type

### To create new plugin:
1. Create package in `packages/plugin-[name]/`
2. Implement plugin interface
3. Register in example app

## ⚠️ Important Notes

1. **DO NOT MODIFY** `rn-better-dev-tools/` - This is the reference implementation
2. **DO NOT ADD** react-native-reanimated - We use pure JS animations
3. **ALWAYS RUN** tests, typecheck, and lint before committing
4. **USE** gameUIColors constants for all theming
5. **MAINTAIN** zero native dependencies in core components

## 🔗 Dependencies Structure

```
react-native-better-dev-tools-internal/
├── No reanimated ✅
├── No SVG libraries ✅  
├── Pure React Native ✅
└── Plugin architecture ✅

Plugins can have their own dependencies:
├── plugin-wifi-toggle → @react-native-community/netinfo
└── plugin-react-query → @tanstack/react-query
```

## 🐛 Troubleshooting

### Babel Error with reanimated
**Solution**: babel.config.js has `reanimated: false` to disable the plugin

### TypeScript errors with gameUI imports
**Solution**: Import directly from `gameUI/constants/gameUIColors`

### Menu not showing
**Check**: 
- `autoShowMenu` prop
- `onStatusPress` handler
- Menu type is valid ('dial', 'grid', or 'dial2')

## 📊 Test Coverage Areas

- Component rendering
- Plugin lifecycle
- Menu animations
- Position persistence
- Theme switching
- Environment/role changes