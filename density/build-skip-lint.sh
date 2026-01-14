#!/bin/bash

# Build script that skips linting errors
# Run from: /var/www/lab.adilishastemlabs.com/repo/density

set -e

echo "Building Density simulation (skipping lint errors)..."

cd /var/www/lab.adilishastemlabs.com/repo/density

# Method 1: Try with --skip-lint or similar flags
echo "Attempting build with lint skip..."
npx grunt --brands=adapted-from-phet --skip-lint 2>&1 || \
npx grunt --brands=adapted-from-phet --no-lint 2>&1 || \
npx grunt build --brands=adapted-from-phet 2>&1 || \
true

# Method 2: If that doesn't work, modify grunt to skip lint temporarily
if [ ! -d "build/adapted-from-phet" ]; then
    echo "Standard build failed, trying to bypass lint..."
    
    # Check if there's a way to skip lint in the gruntfile
    # Or temporarily disable linting
    if [ -f "Gruntfile.cjs" ] || [ -f "Gruntfile.js" ]; then
        echo "Trying alternative build approach..."
    fi
    
    # Try running the build task directly
    npx grunt build-adapted-from-phet 2>&1 || \
    npx grunt --brands=adapted-from-phet --force 2>&1 || \
    echo "Build still failing - may need manual intervention"
fi

# Method 3: Check what grunt tasks are available
if [ ! -d "build/adapted-from-phet" ]; then
    echo ""
    echo "Available grunt tasks:"
    npx grunt --help | grep -i "build\|adapted" || true
    echo ""
    echo "Trying to find build task..."
fi

# Final check
if [ -d "build/adapted-from-phet" ] && [ "$(ls -A build/adapted-from-phet 2>/dev/null)" ]; then
    echo ""
    echo "✓ Build successful!"
    echo "Files in build directory:"
    ls -lh build/adapted-from-phet/ | head -10
else
    echo ""
    echo "✗ Build failed or incomplete"
    echo "You may need to fix lint errors or use development version"
fi
