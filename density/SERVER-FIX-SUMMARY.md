# Server Fix Summary - Complete Solution

## Your Two Issues Explained

### Issue 1: File Not Found (404 Error)
**Problem:** `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html` shows "not found"

**Root Cause:** The build file doesn't exist on your server. You need to build the simulation first.

**Solution:** Run the build script on your server (see Step 1 below).

---

### Issue 2: Why Different URLs?
**Question:** Why `density_en.html` (local) vs `density_en_adapted-from-phet.html` (hosting)?

**Answer:**
- **`density_en.html`** = Development version (source file)
  - Works with dev servers like Live Server (port 5501)
  - Loads dependencies dynamically
  - Not optimized for production
  
- **`density_en_adapted-from-phet.html`** = Production build (compiled)
  - Created by running `grunt --brands=adapted-from-phet`
  - All dependencies bundled and optimized
  - Self-contained, ready for production hosting

**Think of it like:** Source code vs compiled executable

---

## Complete Fix - Run These Commands on Your Server

### Step 1: Build the Simulation

```bash
cd /var/www/lab.adilishastemlabs.com/repo

# Option A: Use the automated script (recommended)
bash build-on-server.sh

# Option B: Manual build
cd density
npx grunt --brands=adapted-from-phet
cd ..
```

**Verify build exists:**
```bash
ls -la /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/density_en_adapted-from-phet.html
```

### Step 2: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
```

### Step 3: Update Nginx Configuration

```bash
# Option A: Use the automated script (recommended)
sudo bash update-nginx-config.sh

# Option B: Manual update
sudo nano /etc/nginx/sites-available/lab.adilishastemlabs.com
# Copy the updated nginx-config.conf content
# Uncomment the SSL server block if using HTTPS
```

**Test and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Test Access

- **HTTP:** `http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
- **HTTPS:** `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`

---

## Quick One-Liner Fix (All Steps Combined)

```bash
cd /var/www/lab.adilishastemlabs.com/repo && \
bash build-on-server.sh && \
sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build && \
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build && \
sudo bash update-nginx-config.sh
```

---

## Important Notes

### If Using HTTPS
The nginx config includes an SSL server block. If you're accessing via HTTPS, make sure:
1. SSL certificates are installed at `/etc/letsencrypt/live/lab.adilishastemlabs.com/`
2. The SSL server block is uncommented in the nginx config
3. The `update-nginx-config.sh` script will automatically detect and enable SSL if certificates exist

### If Build Fails
- Check Node.js version: `node --version` (should be 14+)
- Ensure all dependencies are installed in `chipper`, `perennial-alias`, and `density` directories
- Check build logs for specific errors

### If Still Getting 404
1. Verify build file exists (Step 1 verification)
2. Check nginx error logs: `sudo tail -f /var/log/nginx/lab.adilishastemlabs.com-error.log`
3. Verify nginx config path matches: `/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet`
4. Check file permissions (Step 2)

---

## Files Created for You

1. **`build-on-server.sh`** - Automated build script
2. **`update-nginx-config.sh`** - Automated nginx configuration update
3. **`QUICK-FIX.md`** - Quick reference guide
4. **`EXPLANATION.md`** - Detailed explanation of development vs production
5. **`TROUBLESHOOTING.md`** - Comprehensive troubleshooting guide
6. **`nginx-config.conf`** - Updated nginx configuration (with SSL support)

---

## Correct URLs After Fix

✅ **Production Build (Recommended):**
- `http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
- `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`

✅ **Redirect (Automatic):**
- `http://lab.adilishastemlabs.com/density/density_en.html` → redirects to production build

❌ **Development Version (Not Recommended for Production):**
- `http://lab.adilishastemlabs.com/density/density_en.html` (only works if serving entire repo directory)

---

## Need More Help?

Check these files:
- `TROUBLESHOOTING.md` - Detailed troubleshooting steps
- `QUICK-FIX.md` - Quick reference
- `EXPLANATION.md` - Understanding development vs production
