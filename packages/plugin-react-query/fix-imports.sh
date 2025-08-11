#!/bin/bash

# Fix imports in src/components directory
find src/components -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "\.\./\.\./\.\./\.\./|from "../../|g'
find src/components -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "\.\./\.\./\.\./|from "../|g'

# Fix imports in src/hooks directory  
find src/hooks -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "\.\./\.\./\.\./|from "../|g'

# Fix imports in src/utils directory
find src/utils -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "\.\./\.\./\.\./|from "../|g'

# Fix imports in _sections directory (these are deeper)
find src/_sections -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "\.\./\.\./\.\./|from "../../|g'

# Fix imports in _components directory
find src/_components -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "\.\./\.\./\.\./|from "../../|g'

echo "Import paths fixed!"