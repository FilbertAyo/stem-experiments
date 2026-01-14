#!/bin/bash

# Deployment script for Density PhET Simulation
# Run this from the repo root: /var/www/lab.adilishastemlabs.com/repo

set -e  # Exit on error

echo "========================================="
echo "Density PhET Simulation Deployment"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "chipper" ] || [ ! -d "density" ] || [ ! -d "perennial-alias" ]; then
    echo "Error: This script must be run from the repo root directory"
    echo "Expected directories: chipper, density, perennial-alias"
    exit 1
fi

REPO_ROOT=$(pwd)
echo "Repo root: $REPO_ROOT"
echo ""

# Step 1: Install chipper dependencies
echo "Step 1/3: Installing chipper dependencies..."
cd "$REPO_ROOT/chipper"
if [ -f "package.json" ]; then
    npm install
    echo "✓ chipper dependencies installed"
else
    echo "⚠ Warning: chipper/package.json not found, skipping..."
fi
echo ""

# Step 2: Install perennial-alias dependencies
echo "Step 2/3: Installing perennial-alias dependencies..."
cd "$REPO_ROOT/perennial-alias"
if [ -f "package.json" ]; then
    npm install
    echo "✓ perennial-alias dependencies installed"
else
    echo "⚠ Warning: perennial-alias/package.json not found, skipping..."
fi
echo ""

# Step 3: Install density dependencies
echo "Step 3/3: Installing density dependencies..."
cd "$REPO_ROOT/density"
if [ -f "package.json" ]; then
    npm install
    echo "✓ density dependencies installed"
else
    echo "✗ Error: density/package.json not found!"
    exit 1
fi
echo ""

# Step 4: Build the simulation
echo "Building simulation..."
cd "$REPO_ROOT/density"

# Check if grunt is available
if ! command -v grunt &> /dev/null; then
    echo "Grunt not found globally, using npx..."
    npx grunt --brands=adapted-from-phet
else
    grunt --brands=adapted-from-phet
fi

echo ""
echo "========================================="
echo "✓ Build completed successfully!"
echo "========================================="
echo ""
echo "Built files are located at:"
echo "  $REPO_ROOT/density/build/adapted-from-phet/"
echo ""
echo "Next steps:"
echo "1. Configure your web server to serve the build directory"
echo "2. Access the simulation at:"
echo "   https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
echo ""
echo "See DEPLOYMENT.md for web server configuration details."
