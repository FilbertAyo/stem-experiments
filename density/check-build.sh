#!/bin/bash

# Quick script to check build status and show what's available

echo "========================================="
echo "Checking Density Build Status"
echo "========================================="
echo ""

BUILD_DIR="/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet"
DEV_FILE="/var/www/lab.adilishastemlabs.com/repo/density/density_en.html"

echo "Checking build directory..."
if [ -d "$BUILD_DIR" ]; then
    echo "✓ Build directory exists: $BUILD_DIR"
    echo ""
    echo "Files in build directory:"
    ls -lh "$BUILD_DIR" | head -15
    echo ""
    
    if [ -f "$BUILD_DIR/density_en_adapted-from-phet.html" ]; then
        echo "✓ Production build file exists: density_en_adapted-from-phet.html"
        echo "  Access at: https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
    else
        echo "✗ Production build file NOT found"
    fi
else
    echo "✗ Build directory NOT found: $BUILD_DIR"
    echo "  You need to build the simulation first"
fi

echo ""
echo "Checking development file..."
if [ -f "$DEV_FILE" ]; then
    echo "✓ Development file exists: $DEV_FILE"
    echo "  This requires serving the entire repo directory"
else
    echo "✗ Development file NOT found: $DEV_FILE"
fi

echo ""
echo "========================================="
echo "Nginx Configuration Check"
echo "========================================="
echo ""

if [ -f "/etc/nginx/sites-available/lab.adilishastemlabs.com" ]; then
    echo "✓ Nginx config found: /etc/nginx/sites-available/lab.adilishastemlabs.com"
    echo ""
    echo "Current /density location configuration:"
    grep -A 10 "location /density" /etc/nginx/sites-available/lab.adilishastemlabs.com || echo "  No /density location found in config"
elif [ -f "/etc/nginx/conf.d/lab.adilishastemlabs.com.conf" ]; then
    echo "✓ Nginx config found: /etc/nginx/conf.d/lab.adilishastemlabs.com.conf"
    echo ""
    echo "Current /density location configuration:"
    grep -A 10 "location /density" /etc/nginx/conf.d/lab.adilishastemlabs.com.conf || echo "  No /density location found in config"
else
    echo "✗ Nginx configuration not found"
    echo "  Run: sudo bash setup-nginx.sh"
fi

echo ""
echo "========================================="
echo "Recommendations"
echo "========================================="
echo ""

if [ ! -d "$BUILD_DIR" ]; then
    echo "1. Build the simulation:"
    echo "   cd /var/www/lab.adilishastemlabs.com/repo/density"
    echo "   npx grunt --brands=adapted-from-phet"
    echo ""
fi

if [ ! -f "/etc/nginx/sites-available/lab.adilishastemlabs.com" ] && [ ! -f "/etc/nginx/conf.d/lab.adilishastemlabs.com.conf" ]; then
    echo "2. Configure nginx:"
    echo "   sudo bash setup-nginx.sh"
    echo ""
fi

echo "3. Access the correct URL:"
echo "   Production: https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
echo "   (NOT density_en.html - that's the development file)"
echo ""
