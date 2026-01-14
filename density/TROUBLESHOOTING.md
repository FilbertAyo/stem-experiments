# Troubleshooting Guide for Density Simulation Hosting

## Correct URL to Access Density Simulation

The correct URL to access the Density simulation is:

**Production Build:**
- `http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
- `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html` (if SSL is configured)

**Note:** The file `density_en.html` does NOT exist in the production build. The built file is named `density_en_adapted-from-phet.html`. The nginx configuration includes a redirect from `density_en.html` to the correct file.

## Common Issues and Solutions

### Issue 1: "Not Found" when accessing `/density/density_en.html`

**Problem:** You're trying to access `density_en.html` but the built file is `density_en_adapted-from-phet.html`.

**Solution:**
1. Use the correct URL: `http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
2. Or ensure the nginx config has the redirect rule (already included in the updated config)
3. Make sure the build was completed: Check if `/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/density_en_adapted-from-phet.html` exists

### Issue 2: Subdomain shows main domain content

**Problem:** When accessing `lab.adilishastemlabs.com`, it shows content from `adilishastemlabs.com` instead.

**Causes:**
1. Nginx configuration for `lab.adilishastemlabs.com` is not enabled
2. Default server block is catching all requests
3. Server name directive not matching correctly

**Solution Steps:**

1. **Check if the nginx config file exists:**
   ```bash
   ls -la /etc/nginx/sites-available/lab.adilishastemlabs.com
   # Or
   ls -la /etc/nginx/conf.d/lab.adilishastemlabs.com.conf
   ```

2. **Enable the site (if using sites-available/sites-enabled):**
   ```bash
   # Check if symlink exists
   ls -la /etc/nginx/sites-enabled/ | grep lab.adilishastemlabs.com
   
   # If not, create the symlink
   sudo ln -s /etc/nginx/sites-available/lab.adilishastemlabs.com /etc/nginx/sites-enabled/
   ```

3. **Verify the server_name directive:**
   ```bash
   # Check the config file
   grep "server_name" /etc/nginx/sites-available/lab.adilishastemlabs.com
   # Should show: server_name lab.adilishastemlabs.com;
   ```

4. **Check for default server blocks:**
   ```bash
   # Look for other server blocks that might be catching requests
   grep -r "default_server" /etc/nginx/
   ```

5. **Test and reload nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Check nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/lab.adilishastemlabs.com-error.log
   ```

### Issue 3: 403 Forbidden

**Solution:**
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
```

### Issue 4: Build directory doesn't exist

**Solution:**
```bash
cd /var/www/lab.adilishastemlabs.com/repo
bash one-command-fix.sh
# Or follow the steps in DEPLOYMENT.md
```

## Quick Verification Checklist

- [ ] Build directory exists: `/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/`
- [ ] Built file exists: `density_en_adapted-from-phet.html` in the build directory
- [ ] Nginx config file exists and is enabled
- [ ] Nginx config has correct `server_name lab.adilishastemlabs.com;`
- [ ] Nginx config test passes: `sudo nginx -t`
- [ ] Permissions are correct (www-data or nginx user can read files)
- [ ] Nginx has been reloaded: `sudo systemctl reload nginx`

## Testing the Configuration

After fixing the issues, test with:

```bash
# Test from command line
curl -I http://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html

# Should return HTTP 200 OK
# If it returns 404, check the build directory and nginx alias path
# If it returns 403, check file permissions
```

## Contact Points

If issues persist:
1. Check nginx error logs: `/var/log/nginx/lab.adilishastemlabs.com-error.log`
2. Check nginx access logs: `/var/log/nginx/lab.adilishastemlabs.com-access.log`
3. Verify DNS is pointing correctly: `nslookup lab.adilishastemlabs.com`
