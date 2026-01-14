#!/bin/bash
# Script to update nginx configuration on the server
# Run with sudo: sudo bash update-nginx-config.sh

set -e

echo "========================================="
echo "Updating Nginx Configuration"
echo "========================================="
echo ""

NGINX_CONFIG="/etc/nginx/sites-available/lab.adilishastemlabs.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/lab.adilishastemlabs.com"

# Check if config file exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "✗ Config file not found: $NGINX_CONFIG"
    echo "  Creating new configuration..."
    
    # Detect config location
    if [ -d "/etc/nginx/sites-available" ]; then
        CONFIG_DIR="/etc/nginx/sites-available"
    else
        CONFIG_DIR="/etc/nginx/conf.d"
        NGINX_CONFIG="$CONFIG_DIR/lab.adilishastemlabs.com.conf"
    fi
fi

# Backup existing config
if [ -f "$NGINX_CONFIG" ]; then
    echo "  → Backing up existing configuration..."
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Check if SSL certificates exist
SSL_CERT="/etc/letsencrypt/live/lab.adilishastemlabs.com/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/lab.adilishastemlabs.com/privkey.pem"
HAS_SSL=false

if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
    HAS_SSL=true
    echo "✓ SSL certificates found - will enable HTTPS"
else
    echo "⚠ SSL certificates not found - HTTPS will be disabled"
    echo "  Certificates expected at: $SSL_CERT"
fi

echo ""
echo "  → Creating nginx configuration..."

# Create the config file
cat > "$NGINX_CONFIG" << 'NGINX_CONFIG_EOF'
# Nginx configuration for Density PhET Simulation
# Auto-generated configuration

# HTTP Server Block
server {
    listen 80;
    listen [::]:80;
    server_name lab.adilishastemlabs.com;

    # Uncomment to redirect HTTP to HTTPS (if SSL is configured)
    # return 301 https://$server_name$request_uri;

    # Root directory for the site
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
        
        # Enable CORS if needed (for cross-origin requests)
        add_header Access-Control-Allow-Origin *;
        
        # Proper MIME types for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Try files, fallback to index
        try_files $uri $uri/ /density/density_en_adapted-from-phet.html;
    }

    # Default location for root path
    location / {
        try_files $uri $uri/ =404;
    }

    # Logging
    access_log /var/log/nginx/lab.adilishastemlabs.com-access.log;
    error_log /var/log/nginx/lab.adilishastemlabs.com-error.log;
}
NGINX_CONFIG_EOF

# Add SSL block if certificates exist
if [ "$HAS_SSL" = true ]; then
    echo "  → Adding SSL configuration..."
    cat >> "$NGINX_CONFIG" << NGINX_SSL_EOF

# HTTPS Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name lab.adilishastemlabs.com;

    root /var/www/lab.adilishastemlabs.com;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/lab.adilishastemlabs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lab.adilishastemlabs.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Redirect density_en.html to the built version (must be before /density location)
    location = /density/density_en.html {
        return 301 /density/density_en_adapted-from-phet.html;
    }

    # Serve the Density simulation
    location /density {
        alias /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet;
        index density_en_adapted-from-phet.html;
        
        # Enable CORS if needed (for cross-origin requests)
        add_header Access-Control-Allow-Origin *;
        
        # Proper MIME types for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Try files, fallback to index
        try_files $uri $uri/ /density/density_en_adapted-from-phet.html;
    }

    # Default location for root path
    location / {
        try_files $uri $uri/ =404;
    }

    access_log /var/log/nginx/lab.adilishastemlabs.com-ssl-access.log;
    error_log /var/log/nginx/lab.adilishastemlabs.com-ssl-error.log;
}
NGINX_SSL_EOF
fi

echo "✓ Configuration file created: $NGINX_CONFIG"
echo ""

# Enable the site (if using sites-available/sites-enabled)
if [ -d "/etc/nginx/sites-enabled" ] && [ ! -L "$NGINX_ENABLED" ]; then
    echo "  → Enabling site..."
    ln -s "$NGINX_CONFIG" "$NGINX_ENABLED"
    echo "✓ Site enabled"
elif [ -L "$NGINX_ENABLED" ]; then
    echo "✓ Site already enabled"
fi

echo ""

# Test configuration
echo "Step 2: Testing nginx configuration..."
if nginx -t; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration test failed!"
    echo "  Showing error details:"
    nginx -t 2>&1
    exit 1
fi

echo ""

# Reload nginx
echo "Step 3: Reloading nginx..."
if systemctl reload nginx; then
    echo "✓ Nginx reloaded successfully"
else
    echo "✗ Failed to reload nginx"
    exit 1
fi

echo ""
echo "========================================="
echo "✓✓✓ Nginx Configuration Updated! ✓✓✓"
echo "========================================="
echo ""
echo "Configuration file: $NGINX_CONFIG"
if [ "$HAS_SSL" = true ]; then
    echo "SSL: Enabled (HTTPS configured)"
else
    echo "SSL: Disabled (HTTP only)"
    echo "  To enable HTTPS, install SSL certificates with:"
    echo "  sudo certbot --nginx -d lab.adilishastemlabs.com"
fi
echo ""
echo "Test the configuration:"
echo "  HTTP:  http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
if [ "$HAS_SSL" = true ]; then
    echo "  HTTPS: https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html"
fi
echo ""
