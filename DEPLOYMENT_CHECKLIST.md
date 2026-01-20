# Deployment Checklist ✅

Use this checklist when deploying to ensure everything is set up correctly.

## Pre-Deployment

- [ ] All changes committed to git
- [ ] Tested locally (experiments work on localhost)
- [ ] Server credentials available
- [ ] Domain name DNS pointed to server
- [ ] Server has Nginx or Apache installed

## Deployment Steps

### Option A: Automated Deployment (Recommended)

- [ ] Run: `./deploy.sh user@labs.adilishastemlabs.com`
- [ ] Script completes without errors
- [ ] All tests pass at the end of the script

### Option B: Manual Deployment

- [ ] **Step 1**: Upload files
  ```bash
  rsync -avz stem-experiments/ user@server:/var/www/lab.adilishastemlabs.com/repo/
  ```

- [ ] **Step 2**: Set permissions
  ```bash
  sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo
  sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo
  ```

- [ ] **Step 3**: Configure web server (choose one)
  
  **For Nginx**:
  - [ ] Copy config: `sudo cp .../nginx-config.conf /etc/nginx/sites-available/lab.adilishastemlabs.com`
  - [ ] Create symlink: `sudo ln -s /etc/nginx/sites-available/lab.adilishastemlabs.com /etc/nginx/sites-enabled/`
  - [ ] Test config: `sudo nginx -t`
  - [ ] Reload: `sudo systemctl reload nginx`
  
  **For Apache**:
  - [ ] Copy config: `sudo cp .../apache-config.conf /etc/apache2/sites-available/lab.adilishastemlabs.com.conf`
  - [ ] Enable site: `sudo a2ensite lab.adilishastemlabs.com.conf`
  - [ ] Enable modules: `sudo a2enmod headers && sudo a2enmod alias`
  - [ ] Test config: `sudo apachectl configtest`
  - [ ] Reload: `sudo systemctl reload apache2`

## Post-Deployment Testing

### 1. Test Landing Page
- [ ] Visit: `https://labs.adilishastemlabs.com/`
- [ ] Page loads correctly
- [ ] All experiment cards visible
- [ ] Cards are clickable
- [ ] Responsive on mobile

### 2. Test Density Experiment
- [ ] Click on Density card from landing page
- [ ] OR visit: `https://labs.adilishastemlabs.com/density/density_en.html`
- [ ] Experiment loads
- [ ] Interactive controls work
- [ ] No console errors

### 3. Test Hydrogen Atom Experiment
- [ ] Click on Hydrogen Atom card from landing page
- [ ] OR visit: `https://labs.adilishastemlabs.com/models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html`
- [ ] Experiment loads
- [ ] Interactive controls work
- [ ] No console errors

### 4. Test Navigation
- [ ] Can navigate from landing page to experiments
- [ ] Browser back button works
- [ ] Direct URLs work (can bookmark)

### 5. Check Console & Network
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab - no errors
- [ ] Check Network tab - all resources load (200 OK)
- [ ] Check for any 404 errors

## SSL Setup (Optional but Recommended)

If not already set up:

- [ ] Install Certbot: `sudo apt install certbot python3-certbot-nginx` (or apache)
- [ ] Get certificate: `sudo certbot --nginx -d labs.adilishastemlabs.com`
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`
- [ ] Uncomment SSL section in config file
- [ ] Reload web server

## Performance Checks

- [ ] Page loads in < 3 seconds
- [ ] Images load properly
- [ ] No broken links
- [ ] Mobile performance is acceptable

## Security Checks

- [ ] HTTPS enabled (if SSL configured)
- [ ] HTTP redirects to HTTPS (if SSL configured)
- [ ] CORS headers set correctly
- [ ] File permissions are 755 (not 777)
- [ ] Owner is www-data (or appropriate web server user)

## Monitoring

- [ ] Set up server monitoring (optional)
- [ ] Configure error log monitoring
- [ ] Test error log location:
  - Nginx: `/var/log/nginx/lab.adilishastemlabs.com-error.log`
  - Apache: `/var/log/apache2/lab.adilishastemlabs.com-error.log`

## Documentation

- [ ] Server details documented
- [ ] Deployment process documented
- [ ] Emergency contacts updated
- [ ] Backup plan in place

## Rollback Plan

If something goes wrong:

- [ ] Know how to restore previous configuration
- [ ] Have backup of working config files
- [ ] Know how to check error logs:
  ```bash
  # Nginx
  sudo tail -f /var/log/nginx/error.log
  
  # Apache
  sudo tail -f /var/log/apache2/error.log
  ```

## Troubleshooting

If tests fail, check:

- [ ] Server error logs
- [ ] File permissions
- [ ] Web server config syntax
- [ ] DNS resolution
- [ ] Firewall rules (ports 80, 443 open)

## Common Issues & Solutions

### Issue: Landing page not showing
**Check**:
- [ ] `index.html` exists in `/var/www/lab.adilishastemlabs.com/repo/`
- [ ] DocumentRoot/root points to correct path
- [ ] File permissions are correct

### Issue: Experiments return 404
**Check**:
- [ ] Alias/location directives are correct
- [ ] Trailing slashes in config match URLs
- [ ] Files exist in specified locations
- [ ] Symlinks work (if used)

### Issue: JavaScript not loading
**Check**:
- [ ] Browser console for errors
- [ ] Network tab shows 200 OK for .js files
- [ ] CORS headers present
- [ ] File paths use correct relative paths

### Issue: Styles not applying
**Check**:
- [ ] CSS files load (200 OK in Network tab)
- [ ] No CSS errors in console
- [ ] Cache cleared (Ctrl+Shift+R)

## Final Verification

Before considering deployment complete:

- [ ] All tests passed
- [ ] No console errors
- [ ] All experiments work
- [ ] Mobile responsive
- [ ] Fast page loads
- [ ] SSL working (if configured)
- [ ] Team members can access
- [ ] Documentation updated

## Sign-off

**Deployed by**: _________________  
**Date**: _________________  
**Time**: _________________  
**Issues encountered**: _________________  
**Resolution**: _________________  

---

## Next Deployment

For future deployments, this process will be much simpler:

1. Make changes locally
2. Test locally
3. Run `./deploy.sh user@server`
4. Quick verification
5. Done! ✅
