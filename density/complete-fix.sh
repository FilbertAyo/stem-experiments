#!/bin/bash

# Complete fix script for PhET Density simulation deployment
# Run this from: /var/www/lab.adilishastemlabs.com/repo

set -e  # Exit on error

echo "========================================="
echo "Complete PhET Density Fix & Build"
echo "========================================="
echo ""

REPO_ROOT=$(pwd)
echo "Working directory: $REPO_ROOT"
echo ""

# Step 1: Fix chipper
echo "Step 1/5: Fixing chipper directory..."
if [ -d "chipper" ]; then
    if [ ! -f "chipper/package.json" ]; then
        echo "  → chipper exists but missing package.json, re-cloning..."
        rm -rf chipper
        git clone https://github.com/phetsims/chipper.git chipper
        echo "  ✓ chipper cloned"
    else
        echo "  ✓ chipper is OK"
    fi
else
    echo "  → chipper missing, cloning..."
    git clone https://github.com/phetsims/chipper.git chipper
    echo "  ✓ chipper cloned"
fi
echo ""

# Step 2: Fix perennial-alias
echo "Step 2/5: Fixing perennial-alias directory..."
if [ -d "perennial-alias" ]; then
    if [ ! -f "perennial-alias/package.json" ]; then
        echo "  → perennial-alias exists but missing package.json, re-cloning..."
        rm -rf perennial-alias
        git clone https://github.com/phetsims/perennial.git perennial-alias
        echo "  ✓ perennial-alias cloned"
    else
        echo "  ✓ perennial-alias is OK"
    fi
else
    echo "  → perennial-alias missing, cloning..."
    git clone https://github.com/phetsims/perennial.git perennial-alias
    echo "  ✓ perennial-alias cloned"
fi
echo ""

# Step 3: Install chipper dependencies
echo "Step 3/5: Installing chipper dependencies..."
cd "$REPO_ROOT/chipper"
if [ -f "package.json" ]; then
    npm install
    echo "  ✓ chipper dependencies installed"
else
    echo "  ✗ Error: chipper/package.json still missing!"
    exit 1
fi
cd "$REPO_ROOT"
echo ""

# Step 4: Install perennial-alias dependencies
echo "Step 4/5: Installing perennial-alias dependencies..."
cd "$REPO_ROOT/perennial-alias"
if [ -f "package.json" ]; then
    npm install
    echo "  ✓ perennial-alias dependencies installed"
else
    echo "  ✗ Error: perennial-alias/package.json still missing!"
    exit 1
fi
cd "$REPO_ROOT"
echo ""

# Step 5: Install density dependencies and build
echo "Step 5/5: Installing density dependencies and building..."
cd "$REPO_ROOT/density"
if [ ! -f "package.json" ]; then
    echo "  ✗ Error: density/package.json missing!"
    exit 1
fi

# Install dependencies (this installs grunt locally)
echo "  → Installing npm dependencies (this installs grunt locally)..."
npm install
echo "  ✓ density dependencies installed"

# Build the simulation
echo "  → Building simulation..."
if command -v grunt &> /dev/null; then
    grunt --brands=adapted-from-phet
else
    echo "  → Using npx grunt (grunt not found globally)..."
    npx grunt --brands=adapted-from-phet
fi
echo "  ✓ Build completed"
cd "$REPO_ROOT"
echo ""

echo "========================================="
echo "✓ SUCCESS! Everything is fixed and built!"
echo "========================================="
echo ""
echo "Build output location:"
echo "  $REPO_ROOT/density/build/adapted-from-phet/"
echo ""
echo "Main file:"
echo "  density_en_adapted-from-phet.html"
echo ""
echo "Next steps:"
echo "1. Set permissions: sudo bash setup-permissions.sh"
echo "2. Configure web server (see VPS-HOSTING.md)"
echo "3. Access at: https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
echo ""
