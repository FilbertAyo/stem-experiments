#!/bin/bash

# Script to fix missing dependencies and install everything properly
# Run from: /var/www/lab.adilishastemlabs.com/repo

set -e

echo "========================================="
echo "Fixing PhET Dependencies"
echo "========================================="
echo ""

REPO_ROOT=$(pwd)
echo "Working in: $REPO_ROOT"
echo ""

# Function to check and fix a directory
fix_directory() {
    local dir_name=$1
    local repo_url=$2
    
    echo "Checking $dir_name..."
    
    if [ ! -d "$dir_name" ]; then
        echo "  → Directory doesn't exist, cloning..."
        git clone "$repo_url" "$dir_name"
        echo "  ✓ Cloned $dir_name"
    elif [ ! -f "$dir_name/package.json" ]; then
        echo "  → Directory exists but missing package.json"
        if [ -d "$dir_name/.git" ]; then
            echo "  → It's a git repo, pulling latest..."
            cd "$dir_name"
            git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
            cd "$REPO_ROOT"
        else
            echo "  → Not a git repo, removing and cloning fresh..."
            rm -rf "$dir_name"
            git clone "$repo_url" "$dir_name"
        fi
        
        if [ -f "$dir_name/package.json" ]; then
            echo "  ✓ Fixed $dir_name"
        else
            echo "  ✗ Still missing package.json after fix attempt"
            return 1
        fi
    else
        echo "  ✓ $dir_name is OK"
    fi
    echo ""
}

# Fix chipper
fix_directory "chipper" "https://github.com/phetsims/chipper.git"

# Fix perennial-alias
fix_directory "perennial-alias" "https://github.com/phetsims/perennial.git"

# Verify density exists
if [ ! -d "density" ]; then
    echo "Error: density directory not found!"
    exit 1
fi

if [ ! -f "density/package.json" ]; then
    echo "Error: density/package.json not found!"
    exit 1
fi

echo "========================================="
echo "Installing Dependencies"
echo "========================================="
echo ""

# Install chipper dependencies
echo "Installing chipper dependencies..."
cd "$REPO_ROOT/chipper"
if [ -f "package.json" ]; then
    npm install
    echo "✓ chipper dependencies installed"
else
    echo "✗ Error: chipper/package.json still missing!"
    exit 1
fi
echo ""

# Install perennial-alias dependencies
echo "Installing perennial-alias dependencies..."
cd "$REPO_ROOT/perennial-alias"
if [ -f "package.json" ]; then
    npm install
    echo "✓ perennial-alias dependencies installed"
else
    echo "✗ Error: perennial-alias/package.json still missing!"
    exit 1
fi
echo ""

# Install density dependencies (this installs grunt locally)
echo "Installing density dependencies (this will install grunt locally)..."
cd "$REPO_ROOT/density"
if [ -f "package.json" ]; then
    npm install
    echo "✓ density dependencies installed (grunt is now available)"
else
    echo "✗ Error: density/package.json missing!"
    exit 1
fi
echo ""

echo "========================================="
echo "✓ All dependencies fixed and installed!"
echo "========================================="
echo ""
echo "Now you can build the simulation:"
echo "  cd density"
echo "  npx grunt --brands=adapted-from-phet"
echo ""
echo "Or if grunt-cli is installed globally:"
echo "  cd density"
echo "  grunt --brands=adapted-from-phet"
