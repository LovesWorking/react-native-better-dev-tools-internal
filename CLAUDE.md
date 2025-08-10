# Claude Development Instructions

## 🚨 CRITICAL RULES - MUST FOLLOW

### Testing Requirements
1. **ALWAYS write tests for every new feature or component**
2. **NEVER commit code without running tests first**
3. **Tests must pass before considering any task complete**

### Quality Checks - Run in Order
Before completing ANY task, you MUST run ALL of these commands and fix any issues:

```bash
# 1. Run all tests
yarn test

# 2. Check TypeScript types
yarn typecheck

# 3. Check linting
yarn lint
```

**If any of these fail, the task is NOT complete.**

## 📋 Development Workflow

### When Adding New Features
1. Write the feature code
2. Write comprehensive tests for the feature
3. Run `yarn test` - fix any failures
4. Run `yarn typecheck` - fix any type errors
5. Run `yarn lint` - fix any linting issues
6. Test in simulator to verify visual functionality
7. Take screenshot with Peekaboo if UI changes

### When Modifying Existing Code
1. Make the changes
2. Update or add tests as needed
3. Run ALL quality checks (test, typecheck, lint)
4. Ensure no regressions were introduced
5. Test in simulator

### Test Coverage Requirements
Every component should have tests for:
- Rendering without crashing
- Props being handled correctly
- Conditional rendering (if applicable)
- Event handlers being called
- Style/visual properties

## 🏗️ Project Structure

```
src/
├── __tests__/           # Test files
├── floatingBubble/      # Bubble components
│   ├── components/      # Sub-components
│   └── types.ts        # TypeScript types
├── icons/              # Icon components
└── index.tsx           # Main exports
```

## 🧪 Testing Guidelines

### Test File Naming
- Test files go in `src/__tests__/`
- Name pattern: `ComponentName.test.tsx`

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should render without crashing', () => {
    // Test implementation
  });
  
  it('should handle props correctly', () => {
    // Test props
  });
  
  // More specific tests...
});
```

### What to Test
- Component renders without errors
- Props are applied correctly
- Conditional rendering works
- Event handlers are called with correct arguments
- Styles are applied as expected

## 🔧 Common Commands

```bash
# Development
yarn                    # Install dependencies
yarn test              # Run tests
yarn test --watch      # Run tests in watch mode
yarn typecheck         # Check TypeScript
yarn lint              # Run ESLint

# Example app
cd example
yarn ios               # Run on iOS
yarn android          # Run on Android

# Screenshot
peekaboo image --app Simulator --path /tmp/screenshot.png
```

## 📝 Code Style Rules

1. **Use descriptive variable names**
2. **Extract inline styles to StyleSheet or typed objects**
3. **Keep components focused and single-purpose**
4. **Always type function parameters and return types**
5. **Avoid `any` types unless absolutely necessary**
6. **Remove unused imports and variables immediately**

## ⚠️ Pre-Commit Checklist

Before ANY commit or task completion:

- [ ] All tests pass (`yarn test`)
- [ ] No TypeScript errors (`yarn typecheck`)
- [ ] No linting errors (`yarn lint`)
- [ ] New features have tests
- [ ] Modified code has updated tests
- [ ] Code follows project style guide
- [ ] Unused imports/variables removed

## 🚫 Never Do This

1. **NEVER skip tests** - Even for "simple" changes
2. **NEVER ignore TypeScript errors** - Fix them properly
3. **NEVER leave unused imports or variables**
4. **NEVER commit with failing tests**
5. **NEVER use `@ts-ignore` without exceptional justification**

## 💡 Best Practices

1. **Test First**: Consider writing tests before implementation
2. **Small Commits**: Make focused, single-purpose changes
3. **Continuous Testing**: Run tests frequently during development
4. **Clean as You Go**: Fix issues immediately, don't accumulate tech debt
5. **Document Complex Logic**: Add comments for non-obvious code

## 🔄 Continuous Integration

Every change should maintain or improve:
- Test coverage
- Type safety
- Code quality
- Performance

Remember: **Quality over Speed**. It's better to do it right than to do it twice.