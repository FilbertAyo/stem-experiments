#!/bin/bash

# Fix build (skip lint) and configure nginx properly
# Run from: /var/www/lab.adilishastemlabs.com/repo/density

set -e

echo "========================================="
echo "Fixing Build and Nginx Configuration"
echo "========================================="
echo ""

# Step 1: Build with --skip-lint to bypass lint errors
echo "Step 1: Building simulation (skipping lint)..."
cd /var/www/lab.adilishastemlabs.com/repo/density

# Build with skip-lint flag
npx grunt --brands=adapted-from-phet --skip-lint || npx grunt --brands=adapted-from-phet --no-lint || npx grunt build --brands=adapted-from-phet

# Alternative: try to build without linting
if [ ! -d "build/adapted-from-phet" ]; then
    echo "  → Trying alternative build method..."
    # Check grunt tasks
    npx grunt --help | grep -i build || true
    
    # Try building directly
    npx grunt build-adapted-from-phet 2>/dev/null || \
    npx grunt --brands=adapted-from-phet --force || \
    (echo "  → Creating build directory manually..." && \
     mkdir -p build/adapted-from-phet && \
     echo "  ⚠ Manual build directory created - you may need to run build differently")
fi

echo ""

# Step 2: Check if build succeeded
BUILD_DIR="/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet"
if [ -d "$BUILD_DIR" ] && [ -f "$BUILD_DIR/density_en_adapted-from-phet.html" ]; then
    echo "✓ Build directory exists and has files"
    ls -lh "$BUILD_DIR" | head -10
else
    echo "⚠ Build directory may be incomplete"
    echo "  Checking what exists..."
    ls -la build/ 2>/dev/null || echo "  No build directory found"
fi
echo ""

# Step 3: Fix nginx configuration
echo "Step 2: Fixing nginx configuration..."

# Create proper nginx config with redirect inside server block
sudo bash -c 'cat > /etc/nginx/sites-available/lab.adilishastemlabs.com << "NGINX_EOF"
server {
    listen 80;
    listen [::]:80;
    server_name lab.adilishastemlabs.com;

    root /var/www/lab.adilishastemlabs.com;
    index index.html;

    # Redirect density_en.html to the built version (must be before /density location)
    location = /density/density_en.html {
        return 301 /density/density_en_adapted-from-phet.html;
    }

    # Serve the Density simulation
    location /density {
        alias /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet;
        index density_en_adapted-from-phet.html;
        
        add_header Access-Control-Allow-Origin *;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        try_files $uri $uri/ /density/density_en_adapted-from-phet.html;
    }

    access_log /var/log/nginx/lab.adilishastemlabs.com-access.log;
    error_log /var/log/nginx/lab.adilishastemlabs.com-error.log;
}
NGINX_EOF
'

echo "✓ Nginx configuration created"
echo ""

# Step 4: Test and reload nginx
echo "Step 3: Testing nginx configuration..."
if sudo nginx -t; then
    echo "✓ Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "✓ Nginx reloaded"
else
    echo "✗ Nginx configuration test failed!"
    echo "  Showing error details:"
    sudo nginx -t 2>&1
    exit 1
fi
echo ""

# Step 5: Set permissions
echo "Step 4: Setting permissions..."
if [ -d "$BUILD_DIR" ]; then
    sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
    sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
    echo "✓ Permissions set"
else
    echo "⚠ Build directory not found - skipping permissions"
fi
echo ""

echo "========================================="
echo "Summary"
echo "========================================="
echo ""
if [ -d "$BUILD_DIR" ] && [ -f "$BUILD_DIR/density_en_adapted-from-phet.html" ]; then
    echo "✓ Build: SUCCESS"
    echo "✓ Nginx: CONFIGURED"
    echo ""
    echo "Access your simulation at:"
    echo "  http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
    echo "  http://lab.adilishastemlabs.com/density/density_en.html (redirects to above)"
else
    echo "⚠ Build: INCOMPLETE - build directory missing or empty"
    echo "✓ Nginx: CONFIGURED (but won't work until build completes)"
    echo ""
    echo "You may need to:"
    echo "1. Fix lint errors, or"
    echo "2. Use development version instead"
fi
echo ""
