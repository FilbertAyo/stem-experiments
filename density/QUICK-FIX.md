# Quick Fix Guide - Build and Deploy Density

## Problem Summary

1. **File not found**: The build file `density_en_adapted-from-phet.html` doesn't exist on the server
2. **URL confusion**: Why `density_en.html` (local) vs `density_en_adapted-from-phet.html` (hosting)?

## Quick Answer

**Why different filenames?**
- `density_en.html` = Development version (source file, works with dev server)
- `density_en_adapted-from-phet.html` = Production build (compiled, optimized, bundled)

**Solution:** Build the simulation on your server!

## Step-by-Step Fix

### Step 1: Build the Simulation

Run this on your server:

```bash
cd /var/www/lab.adilishastemlabs.com/repo
bash build-on-server.sh
```

Or manually:

```bash
cd /var/www/lab.adilishastemlabs.com/repo

# Install dependencies (if not done)
cd chipper && npm install && cd ..
cd perennial-alias && npm install && cd ..
cd density && npm install && cd ..

# Build the simulation
cd density
npx grunt --brands=adapted-from-phet
cd ..
```

### Step 2: Verify Build Exists

```bash
ls -la /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/density_en_adapted-from-phet.html
```

Should show the file exists.

### Step 3: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
```

### Step 4: Update Nginx Config (if using HTTPS)

If you're accessing via HTTPS (`https://lab.adilishastemlabs.com`), you need to uncomment the SSL server block in the nginx config:

```bash
sudo nano /etc/nginx/sites-available/lab.adilishastemlabs.com
```

Uncomment the SSL server block (lines starting with `server {` for port 443).

Then test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Test

Access the simulation at:
- **HTTP:** `http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
- **HTTPS:** `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`

## Alternative: Serve Development Version

If you prefer to use `density_en.html` (not recommended for production), you can configure nginx to serve the entire repo directory. However, this is slower and not optimized.

See `nginx-config-dev.conf` for development server configuration.

## Troubleshooting

### Build fails?
- Check Node.js version: `node --version` (should be 14+)
- Check npm: `npm --version`
- Check dependencies are installed in chipper, perennial-alias, and density

### Still getting 404?
- Verify build file exists (Step 2)
- Check nginx config has correct path
- Check nginx error logs: `sudo tail -f /var/log/nginx/lab.adilishastemlabs.com-error.log`

### HTTPS not working?
- Make sure SSL server block is uncommented in nginx config
- Verify SSL certificates exist: `ls -la /etc/letsencrypt/live/lab.adilishastemlabs.com/`
- Check nginx test: `sudo nginx -t`
