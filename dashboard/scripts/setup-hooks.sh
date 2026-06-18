#!/bin/bash
# Setup script to install git pre-commit hooks
# Installs validation hook for Story_Map.md

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_FILE="$REPO_ROOT/.git/hooks/pre-commit"

# Create hooks directory if it doesn't exist
mkdir -p "$REPO_ROOT/.git/hooks"

# Create pre-commit hook content
cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Git pre-commit hook: validate Story_Map.md

cd "$(git rev-parse --show-toplevel)"

# Run validation (Node + tsx required)
npx tsx dashboard/backend/src/validate.ts

if [ $? -ne 0 ]; then
  exit 1
fi

exit 0
EOF

# Make hook executable
chmod +x "$HOOK_FILE"

echo "✅ Git hook installed at $HOOK_FILE"
