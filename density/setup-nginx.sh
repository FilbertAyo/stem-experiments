#!/bin/bash

# Script to configure nginx for Density simulation
# Run with sudo: sudo bash setup-nginx.sh

set -e

echo "========================================="
echo "Nginx Configuration for Density Simulation"
echo "========================================="
echo ""

BUILD_DIR="/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet"
NGINX_CONFIG="/etc/nginx/sites-available/lab.adilishastemlabs.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/lab.adilishastemlabs.com"

# Step 1: Check if build exists
echo "Step 1: Checking build directory..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "✗ Error: Build directory not found: $BUILD_DIR"
    echo ""
    echo "Please build the simulation first:"
    echo "  cd /var/www/lab.adilishastemlabs.com/repo/density"
    echo "  npx grunt --brands=adapted-from-phet"
    exit 1
fi

if [ ! -f "$BUILD_DIR/density_en_adapted-from-phet.html" ]; then
    echo "✗ Error: Build file not found: $BUILD_DIR/density_en_adapted-from-phet.html"
    echo ""
    echo "Please build the simulation first."
    exit 1
fi

echo "✓ Build directory found"
echo "✓ Build file exists: density_en_adapted-from-phet.html"
echo ""

# Step 2: Create nginx configuration
echo "Step 2: Creating nginx configuration..."

# Detect if we should use sites-available or conf.d
if [ -d "/etc/nginx/sites-available" ]; then
    CONFIG_DIR="/etc/nginx/sites-available"
    ENABLED_DIR="/etc/nginx/sites-enabled"
    USE_SITES_AVAILABLE=true
else
    CONFIG_DIR="/etc/nginx/conf.d"
    USE_SITES_AVAILABLE=false
fi

CONFIG_FILE="$CONFIG_DIR/lab.adilishastemlabs.com"

# Backup existing config if it exists
if [ -f "$CONFIG_FILE" ]; then
    echo "  → Backing up existing configuration..."
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create nginx configuration
cat > "$CONFIG_FILE" << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;
    server_name lab.adilishastemlabs.com;

    root /var/www/lab.adilishastemlabs.com;
    index index.html;

    # Serve the Density simulation
    location /density {
        alias /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet;
        index density_en_adapted-from-phet.html;
        
        # Enable CORS if needed
        add_header Access-Control-Allow-Origin *;
        
        # Proper MIME types for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Try files, fallback to index
        try_files $uri $uri/ /density/density_en_adapted-from-phet.html;
    }

    # Logging
    access_log /var/log/nginx/lab.adilishastemlabs.com-access.log;
    error_log /var/log/nginx/lab.adilishastemlabs.com-error.log;
}
NGINX_CONFIG

echo "✓ Configuration file created: $CONFIG_FILE"
echo ""

# Step 3: Enable the site (if using sites-available)
if [ "$USE_SITES_AVAILABLE" = true ]; then
    echo "Step 3: Enabling site..."
    if [ ! -L "$ENABLED_DIR/lab.adilishastemlabs.com" ]; then
        ln -s "$CONFIG_FILE" "$ENABLED_DIR/lab.adilishastemlabs.com"
        echo "✓ Site enabled"
    else
        echo "✓ Site already enabled"
    fi
    echo ""
fi

# Step 4: Test nginx configuration
echo "Step 4: Testing nginx configuration..."
if nginx -t; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration test failed!"
    exit 1
fi
echo ""

# Step 5: Set permissions
echo "Step 5: Setting file permissions..."
chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
echo "✓ Permissions set"
echo ""

# Step 6: Reload nginx
echo "Step 6: Reloading nginx..."
systemctl reload nginx
echo "✓ Nginx reloaded"
echo ""

echo "========================================="
echo "✓ Configuration complete!"
echo "========================================="
echo ""
echo "Your simulation should now be accessible at:"
echo "  http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
echo ""
echo "Note: You're accessing 'density_en.html' but the built file is:"
echo "  'density_en_adapted-from-phet.html'"
echo ""
echo "To access the development version, you need to serve the entire repo."
echo "Or create a symlink/redirect for density_en.html"
echo ""
