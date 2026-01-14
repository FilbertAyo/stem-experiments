#!/bin/bash

# Script to set proper permissions for web server
# Run with sudo: sudo bash setup-permissions.sh

set -e

echo "========================================="
echo "Setting Web Server Permissions"
echo "========================================="
echo ""

BUILD_DIR="/var/www/lab.adilishastemlabs.com/repo/density/build"

# Detect web server user
if id "www-data" &>/dev/null; then
    WEB_USER="www-data"
    WEB_GROUP="www-data"
    echo "Detected web server user: www-data (Debian/Ubuntu)"
elif id "nginx" &>/dev/null; then
    WEB_USER="nginx"
    WEB_GROUP="nginx"
    echo "Detected web server user: nginx (CentOS/RHEL)"
elif id "apache" &>/dev/null; then
    WEB_USER="apache"
    WEB_GROUP="apache"
    echo "Detected web server user: apache"
else
    echo "Warning: Could not detect web server user"
    echo "Please specify manually or run:"
    echo "  sudo chown -R www-data:www-data $BUILD_DIR"
    echo "  sudo chmod -R 755 $BUILD_DIR"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "Error: Build directory not found: $BUILD_DIR"
    echo "Please build the simulation first:"
    echo "  cd /var/www/lab.adilishastemlabs.com/repo/density"
    echo "  grunt --brands=adapted-from-phet"
    exit 1
fi

echo ""
echo "Setting ownership to $WEB_USER:$WEB_GROUP..."
sudo chown -R $WEB_USER:$WEB_GROUP "$BUILD_DIR"
echo "✓ Ownership set"

echo ""
echo "Setting permissions..."
sudo chmod -R 755 "$BUILD_DIR"
echo "✓ Permissions set"

echo ""
echo "Verifying permissions..."
ls -la "$BUILD_DIR" | head -5

echo ""
echo "========================================="
echo "✓ Permissions configured successfully!"
echo "========================================="
echo ""
echo "The web server should now be able to serve files from:"
echo "  $BUILD_DIR/adapted-from-phet/"
