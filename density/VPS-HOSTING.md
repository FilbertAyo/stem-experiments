# VPS Hosting Guide for Density PhET Simulation

Complete guide to host the Density simulation on your VPS at `lab.adilishastemlabs.com`.

## Prerequisites

- VPS with root/sudo access
- Node.js and npm installed
- Web server (nginx or Apache) installed
- Domain configured to point to your VPS

## Step-by-Step Hosting Instructions

### Step 1: Build the Simulation

First, ensure the simulation is built on your server:

```bash
cd /var/www/lab.adilishastemlabs.com/repo

# Install dependencies (if not done already)
cd chipper && npm install && cd ..
cd perennial-alias && npm install && cd ..
cd density && npm install && cd ..

# Build the simulation
cd density
grunt --brands=adapted-from-phet
# Or if grunt is not installed globally:
npx grunt --brands=adapted-from-phet
```

The built files will be in: `/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/`

### Step 2: Set Proper Permissions

Set correct permissions for the web server to access the files:

```bash
# Make sure the web server user (www-data for Debian/Ubuntu, nginx for CentOS) can read the files
chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
# Or for nginx user:
# chown -R nginx:nginx /var/www/lab.adilishastemlabs.com/repo/density/build

# Set proper permissions
chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
```

### Step 3: Configure Web Server

Choose your web server configuration below.

---

## Option A: Nginx Configuration

### 3.1: Create Nginx Configuration

Create or edit the nginx configuration file for your domain:

```bash
sudo nano /etc/nginx/sites-available/lab.adilishastemlabs.com
```

Or if using a different structure:

```bash
sudo nano /etc/nginx/conf.d/lab.adilishastemlabs.com.conf
```

### 3.2: Add Configuration

Add this configuration (adjust paths and domain as needed):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name lab.adilishastemlabs.com;

    # Redirect HTTP to HTTPS (if you have SSL)
    # return 301 https://$server_name$request_uri;

    # Or if not using SSL, use this block:
    root /var/www/lab.adilishastemlabs.com;
    index index.html;

    # Serve the Density simulation
    location /density {
        alias /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet;
        index density_en_adapted-from-phet.html;
        
        # Enable CORS if needed
        add_header Access-Control-Allow-Origin *;
        
        # Proper MIME types
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # SSL Configuration (if using Let's Encrypt)
    # listen 443 ssl http2;
    # listen [::]:443 ssl http2;
    # ssl_certificate /etc/letsencrypt/live/lab.adilishastemlabs.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/lab.adilishastemlabs.com/privkey.pem;
}
```

### 3.3: Enable and Test Configuration

```bash
# Test nginx configuration
sudo nginx -t

# If test passes, enable the site (Debian/Ubuntu)
sudo ln -s /etc/nginx/sites-available/lab.adilishastemlabs.com /etc/nginx/sites-enabled/

# Reload nginx
sudo systemctl reload nginx
```

---

## Option B: Apache Configuration

### 3.1: Create Apache Virtual Host

Create or edit the Apache virtual host file:

```bash
sudo nano /etc/apache2/sites-available/lab.adilishastemlabs.com.conf
```

Or for CentOS/RHEL:

```bash
sudo nano /etc/httpd/conf.d/lab.adilishastemlabs.com.conf
```

### 3.2: Add Configuration

```apache
<VirtualHost *:80>
    ServerName lab.adilishastemlabs.com
    ServerAlias www.lab.adilishastemlabs.com
    
    DocumentRoot /var/www/lab.adilishastemlabs.com
    
    # Serve the Density simulation
    Alias /density /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet
    
    <Directory "/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet">
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
        
        # Enable CORS if needed
        Header set Access-Control-Allow-Origin "*"
    </Directory>
    
    # Optional: Redirect HTTP to HTTPS
    # Redirect permanent / https://lab.adilishastemlabs.com/
    
    ErrorLog ${APACHE_LOG_DIR}/lab.adilishastemlabs.com-error.log
    CustomLog ${APACHE_LOG_DIR}/lab.adilishastemlabs.com-access.log combined
</VirtualHost>

# SSL Configuration (if using Let's Encrypt)
# <VirtualHost *:443>
#     ServerName lab.adilishastemlabs.com
#     ServerAlias www.lab.adilishastemlabs.com
#     
#     DocumentRoot /var/www/lab.adilishastemlabs.com
#     
#     SSLEngine on
#     SSLCertificateFile /etc/letsencrypt/live/lab.adilishastemlabs.com/fullchain.pem
#     SSLCertificateKeyFile /etc/letsencrypt/live/lab.adilishastemlabs.com/privkey.pem
#     
#     Alias /density /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet
#     
#     <Directory "/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet">
#         Options Indexes FollowSymLinks
#         AllowOverride None
#         Require all granted
#     </Directory>
# </VirtualHost>
```

### 3.3: Enable and Restart Apache

```bash
# Enable the site (Debian/Ubuntu)
sudo a2ensite lab.adilishastemlabs.com.conf

# Enable required modules
sudo a2enmod rewrite
sudo a2enmod headers

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
# Or for CentOS/RHEL:
# sudo systemctl restart httpd
```

---

## Step 4: Set Up SSL (Recommended)

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
# Or for Apache:
# sudo apt-get install certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --nginx -d lab.adilishastemlabs.com
# Or for Apache:
# sudo certbot --apache -d lab.adilishastemlabs.com

# Auto-renewal is usually set up automatically
```

---

## Step 5: Verify Deployment

1. **Check file permissions:**
   ```bash
   ls -la /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/
   ```

2. **Test the URL:**
   - Open browser: `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
   - Or: `http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html` (if not using SSL)

3. **Check web server logs if issues:**
   ```bash
   # Nginx
   sudo tail -f /var/log/nginx/error.log
   
   # Apache
   sudo tail -f /var/log/apache2/error.log
   ```

---

## Step 6: Optional - Create a Landing Page

Create a simple index page that links to the simulation:

```bash
sudo nano /var/www/lab.adilishastemlabs.com/index.html
```

Add:

```html
<!DOCTYPE html>
<html>
<head>
    <title>STEM Labs - Density Simulation</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>STEM Labs</h1>
    <h2>Density Simulation</h2>
    <p><a href="/density/density_en_adapted-from-phet.html">Launch Density Simulation</a></p>
</body>
</html>
```

---

## Troubleshooting

### Issue: 403 Forbidden

**Solution:**
```bash
# Check permissions
ls -la /var/www/lab.adilishastemlabs.com/repo/density/build/

# Fix ownership (adjust user for your system)
sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
```

### Issue: 404 Not Found

**Solution:**
- Verify the build directory exists: `ls -la /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/`
- Check the web server configuration path is correct
- Ensure the location/alias path matches exactly

### Issue: JavaScript files not loading

**Solution:**
- Check browser console for CORS errors
- Verify MIME types are correct in web server config
- Ensure all files in build directory are readable

### Issue: Simulation loads but doesn't work

**Solution:**
- Check browser console for JavaScript errors
- Verify all dependencies were built correctly
- Rebuild the simulation: `cd density && grunt --brands=adapted-from-phet`

---

## Maintenance

### Rebuilding After Updates

If you update the code, rebuild:

```bash
cd /var/www/lab.adilishastemlabs.com/repo/density
git pull  # if using git
grunt --brands=adapted-from-phet
```

### Setting Up Auto-Rebuild (Optional)

Create a cron job or webhook to automatically rebuild when code changes.

---

## Quick Reference

- **Build directory:** `/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/`
- **Main HTML file:** `density_en_adapted-from-phet.html`
- **URL:** `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
- **Web server config:** 
  - Nginx: `/etc/nginx/sites-available/lab.adilishastemlabs.com`
  - Apache: `/etc/apache2/sites-available/lab.adilishastemlabs.com.conf`
