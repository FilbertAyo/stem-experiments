#!/bin/bash
# Script to build the Density simulation on the server
# Run from: /var/www/lab.adilishastemlabs.com/repo

set -e

echo "========================================="
echo "Building Density Simulation on Server"
echo "========================================="
echo ""

REPO_ROOT="/var/www/lab.adilishastemlabs.com/repo"
cd "$REPO_ROOT"

# Step 1: Check dependencies
echo "Step 1: Checking dependencies..."
if [ ! -d "chipper" ] || [ ! -f "chipper/package.json" ]; then
    echo "  → Fixing chipper..."
    ([ -d "chipper" ] && [ ! -f "chipper/package.json" ] && rm -rf chipper || true)
    ([ ! -d "chipper" ] && git clone https://github.com/phetsims/chipper.git chipper || echo "chipper OK")
fi

if [ ! -d "perennial-alias" ] || [ ! -f "perennial-alias/package.json" ]; then
    echo "  → Fixing perennial-alias..."
    ([ -d "perennial-alias" ] && [ ! -f "perennial-alias/package.json" ] && rm -rf perennial-alias || true)
    ([ ! -d "perennial-alias" ] && git clone https://github.com/phetsims/perennial.git perennial-alias || echo "perennial-alias OK")
fi
echo "✓ Dependencies checked"
echo ""

# Step 2: Install dependencies
echo "Step 2: Installing dependencies..."
if [ ! -d "chipper/node_modules" ]; then
    echo "  → Installing chipper dependencies..."
    cd chipper && npm install && cd ..
fi

if [ ! -d "perennial-alias/node_modules" ]; then
    echo "  → Installing perennial-alias dependencies..."
    cd perennial-alias && npm install && cd ..
fi

if [ ! -d "density/node_modules" ]; then
    echo "  → Installing density dependencies..."
    cd density && npm install && cd ..
fi
echo "✓ Dependencies installed"
echo ""

# Step 3: Build the simulation
echo "Step 3: Building simulation..."
cd density

# Try building with skip-lint first (in case of lint errors)
echo "  → Running build (this may take a few minutes)..."
if npx grunt --brands=adapted-from-phet --skip-lint 2>/dev/null; then
    echo "✓ Build completed with --skip-lint"
elif npx grunt --brands=adapted-from-phet --no-lint 2>/dev/null; then
    echo "✓ Build completed with --no-lint"
elif npx grunt --brands=adapted-from-phet; then
    echo "✓ Build completed"
else
    echo "✗ Build failed!"
    echo "  Trying alternative build method..."
    npx grunt build --brands=adapted-from-phet || {
        echo "✗ Build failed. Check error messages above."
        exit 1
    }
fi

cd "$REPO_ROOT"
echo ""

# Step 4: Verify build
echo "Step 4: Verifying build..."
BUILD_DIR="$REPO_ROOT/density/build/adapted-from-phet"
BUILD_FILE="$BUILD_DIR/density_en_adapted-from-phet.html"

if [ -f "$BUILD_FILE" ]; then
    echo "✓ Build file exists: $BUILD_FILE"
    echo ""
    echo "File size:"
    ls -lh "$BUILD_FILE"
    echo ""
    echo "First few files in build directory:"
    ls -lh "$BUILD_DIR" | head -10
else
    echo "✗ Build file NOT found: $BUILD_FILE"
    echo ""
    echo "Checking what exists in build directory:"
    ls -la "$BUILD_DIR" 2>/dev/null || echo "  Build directory doesn't exist"
    exit 1
fi

echo ""
echo "========================================="
echo "✓✓✓ BUILD SUCCESSFUL! ✓✓✓"
echo "========================================="
echo ""
echo "Build location: $BUILD_DIR"
echo "Main file: density_en_adapted-from-phet.html"
echo ""
echo "Next steps:"
echo "1. Set permissions: sudo chown -R www-data:www-data $BUILD_DIR && sudo chmod -R 755 $BUILD_DIR"
echo "2. Reload nginx: sudo systemctl reload nginx"
echo "3. Access at: https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
echo ""
