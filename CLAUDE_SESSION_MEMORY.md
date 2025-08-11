# React Query Dev Tools Integration - Complete Session Memory
Last updated: 2025-08-11 04:00

## 🔴 CRITICAL: Current Blocker
**App crashes on startup** - Cannot test any features until fixed

## Session Context
- **User wants**: Port React Query dev tools from old project with minimal changes
- **User instruction**: "DON'T stop until all todos are done"
- **Permission mode needed**: Run `claude --dangerously-skip-permissions` to auto-approve all actions except git commits

## What's Working ✅
1. Successfully switched from simple to comprehensive React Query dev tools in `/packages/plugin-react-query/src/index.tsx`
2. Fixed checkAvailability to return `true` (was using require.resolve which fails in RN)
3. Fixed 18+ import path issues (BaseFloatingModal paths)
4. Fixed modalStorageOperations import in useModalState.ts
5. Installed missing deps: superjson, lucide-react-native, react-native-safe-area-context, react-native-worklets
6. Plugin builds successfully with `yarn prepare`

## What's Broken 🔥
- App crashes immediately after Metro bundles (3047 modules)
- Shows Expo splash briefly then crashes
- No error messages visible
- Cannot access simulator logs

## File Changes Made
```
/packages/plugin-react-query/src/
├── index.tsx (using comprehensive version now)
├── _components/floating-bubble/modal/hooks/useModalState.ts (fixed import)
└── _components/floating-bubble/console/sections/index.ts (commented exports)
```

## Import Path Pattern Fixed
- **Before**: `../../../../_components/floating-bubble/modal/components/BaseFloatingModal`
- **After**: `../../_components/floating-bubble/modal/components/BaseFloatingModal`

## User Requirements Checklist
### Visual
- [ ] Must look EXACTLY like `/Users/aj/Desktop/rn-rq-dev-tools-old/src/_sections/react-query`
- [x] Use TanStack/React Query icon from old app
- [ ] Match exact styling

### Functional  
- [ ] Modal route persistence (last tab/view, size, position)
- [ ] Open specific routes programmatically
- [ ] Mock data for testing
- [ ] Query Browser with search/filter
- [ ] Mutation Browser
- [ ] Query Details view
- [ ] Data Editor
- [ ] Network Toggle
- [ ] Swipe navigation between tabs

### Quality
- [ ] Fix ALL TypeScript errors
- [ ] Fix ALL ESLint errors  
- [ ] Write comprehensive tests
- [ ] Everything confirmed working

## Next Immediate Steps
1. Check why app crashes - likely missing deps or version mismatches
2. Expo warned about these version mismatches:
   - @react-native-async-storage/async-storage@2.2.0 (wants 2.1.2)
   - @shopify/flash-list@2.0.2 (wants 1.7.6)
   - react-native-gesture-handler@2.28.0 (wants ~2.24.0)
   - react-native-reanimated@4.0.2 (wants ~3.17.4)
   - react-native-safe-area-context@5.6.0 (wants 5.4.0)
   - react-native-svg@15.12.1 (wants 15.11.2)

## Commands to Run
```bash
# Build plugin
cd /Users/aj/Desktop/react-native-better-dev-tools-internal/react-native-better-dev-tools-internal
yarn prepare

# Run app
cd example
npx expo start --clear

# Open in simulator
xcrun simctl openurl booted "exp://127.0.0.1:8081"

# Screenshot
peekaboo image --app Simulator --path /tmp/screenshot.png

# Quality checks (once app works)
yarn test
yarn typecheck
yarn lint
```

## Active Todos (23 total)
1. ✅ Switch to comprehensive React Query dev tools
2. ✅ Update bubble icon to TanStack logo
3. ✅ Fix ReactQueryModal import
4. 🔄 **Fix app crash on startup** (CURRENT)
5. ⏳ Add modal route persistence
6. ⏳ Add modal size/position persistence
7. ⏳ Add programmatic route opening
8. ⏳ Create mock queries/mutations
9. ⏳ Verify Query Browser
10. ⏳ Verify Mutation Browser
11. ⏳ Verify Query Details
12. ⏳ Verify Data Editor
13. ⏳ Verify Network Toggle
14. ⏳ Verify swipe navigation
15. ⏳ Match exact styling
16. ⏳ Fix TypeScript errors
17. ⏳ Fix ESLint errors
18-22. ⏳ Write tests for all components
23. ⏳ Take screenshots of working views

## Background Process
- bash_42: expo start running on port 8081

## Critical Path
1. **FIX CRASH** - Nothing else matters until app runs
2. Verify React Query bubble appears
3. Test all modal features
4. Implement persistence
5. Fix quality issues
6. Write tests

## Session Notes
- User wants minimal changes when porting
- Comprehensive version already ported but untested due to crash
- Need to run with `--dangerously-skip-permissions` flag to avoid approval prompts