#!/bin/bash

# Quick deployment script for VPS hosting
# This script helps you deploy the Density simulation quickly
# Run from: /var/www/lab.adilishastemlabs.com/repo

set -e

echo "========================================="
echo "Quick VPS Deployment for Density Simulation"
echo "========================================="
echo ""

REPO_ROOT=$(pwd)
BUILD_DIR="$REPO_ROOT/density/build/adapted-from-phet"

# Step 1: Check if build exists
echo "Step 1: Checking build..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "Build directory not found. Building simulation..."
    echo ""
    
    # Check dependencies
    if [ ! -f "$REPO_ROOT/chipper/package.json" ]; then
        echo "Error: chipper not found. Please run setup-dependencies.sh first"
        exit 1
    fi
    
    if [ ! -f "$REPO_ROOT/perennial-alias/package.json" ]; then
        echo "Error: perennial-alias not found. Please run setup-dependencies.sh first"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "$REPO_ROOT/chipper/node_modules" ]; then
        echo "Installing chipper dependencies..."
        cd "$REPO_ROOT/chipper" && npm install && cd "$REPO_ROOT"
    fi
    
    if [ ! -d "$REPO_ROOT/perennial-alias/node_modules" ]; then
        echo "Installing perennial-alias dependencies..."
        cd "$REPO_ROOT/perennial-alias" && npm install && cd "$REPO_ROOT"
    fi
    
    if [ ! -d "$REPO_ROOT/density/node_modules" ]; then
        echo "Installing density dependencies..."
        cd "$REPO_ROOT/density" && npm install && cd "$REPO_ROOT"
    fi
    
    # Build
    echo "Building simulation..."
    cd "$REPO_ROOT/density"
    if command -v grunt &> /dev/null; then
        grunt --brands=adapted-from-phet
    else
        npx grunt --brands=adapted-from-phet
    fi
    cd "$REPO_ROOT"
    
    echo "✓ Build completed"
else
    echo "✓ Build directory exists"
fi
echo ""

# Step 2: Check permissions
echo "Step 2: Checking permissions..."
if [ -w "$BUILD_DIR" ]; then
    echo "✓ Build directory is writable"
else
    echo "⚠ Build directory may need permission adjustments"
    echo "  Run: sudo bash setup-permissions.sh"
fi
echo ""

# Step 3: Detect web server
echo "Step 3: Detecting web server..."
if systemctl is-active --quiet nginx; then
    WEB_SERVER="nginx"
    echo "✓ Detected: nginx"
elif systemctl is-active --quiet apache2 || systemctl is-active --quiet httpd; then
    WEB_SERVER="apache"
    echo "✓ Detected: apache"
else
    WEB_SERVER="unknown"
    echo "⚠ Could not detect web server"
fi
echo ""

# Step 4: Provide next steps
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "1. Set permissions (if needed):"
echo "   sudo bash setup-permissions.sh"
echo ""
echo "2. Configure web server:"
if [ "$WEB_SERVER" = "nginx" ]; then
    echo "   - Copy nginx-config.conf to: /etc/nginx/sites-available/lab.adilishastemlabs.com"
    echo "   - Edit the file and adjust paths if needed"
    echo "   - Test: sudo nginx -t"
    echo "   - Enable: sudo ln -s /etc/nginx/sites-available/lab.adilishastemlabs.com /etc/nginx/sites-enabled/"
    echo "   - Reload: sudo systemctl reload nginx"
elif [ "$WEB_SERVER" = "apache" ]; then
    echo "   - Copy apache-config.conf to: /etc/apache2/sites-available/lab.adilishastemlabs.com.conf"
    echo "   - Edit the file and adjust paths if needed"
    echo "   - Enable: sudo a2ensite lab.adilishastemlabs.com.conf"
    echo "   - Test: sudo apache2ctl configtest"
    echo "   - Restart: sudo systemctl restart apache2"
else
    echo "   - See VPS-HOSTING.md for web server configuration"
fi
echo ""
echo "3. Access your simulation at:"
echo "   https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
echo ""
echo "4. For SSL setup:"
echo "   sudo certbot --nginx -d lab.adilishastemlabs.com"
echo "   (or --apache if using Apache)"
echo ""
echo "See VPS-HOSTING.md for detailed instructions."
