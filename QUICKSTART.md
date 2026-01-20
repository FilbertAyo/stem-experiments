# Quick Start Guide

## Problem Summary

**Before**: When visiting `labs.adilishastemlabs.com`, the density experiment was loading directly at the root URL, and there was no way to navigate between different experiments.

**After**: Now `labs.adilishastemlabs.com` shows a beautiful landing page with cards for each experiment, allowing users to choose which one to explore.

## What Changed

### 1. New Landing Page (`index.html`)
- Created a modern, responsive landing page at the root
- Displays experiment cards with descriptions
- Provides clear navigation to each experiment

### 2. Updated Server Configurations

#### Nginx Configuration (`density/nginx-config.conf`)
- Changed `root` to point to `/var/www/lab.adilishastemlabs.com/repo`
- Updated `/density/` location to serve from the density folder
- Added `/models-of-the-hydrogen-atom/` location
- Root path now serves `index.html`

#### Apache Configuration (`density/apache-config.conf`)
- Changed `DocumentRoot` to `/var/www/lab.adilishastemlabs.com/repo`
- Updated Alias directives for both experiments
- Added directory permissions for all experiments

## URL Mapping

| Page | URL |
|------|-----|
| Landing Page | `https://labs.adilishastemlabs.com/` |
| Density | `https://labs.adilishastemlabs.com/density/density_en.html` |
| Hydrogen Atom | `https://labs.adilishastemlabs.com/models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html` |

## Quick Deployment

1. **Upload to server**:
```bash
rsync -avz /Users/ayo/Desktop/projects/stem-experiments/ \
  user@server:/var/www/lab.adilishastemlabs.com/repo/
```

2. **Update web server config** (choose Nginx OR Apache):

**For Nginx**:
```bash
sudo cp /var/www/lab.adilishastemlabs.com/repo/density/nginx-config.conf \
  /etc/nginx/sites-available/lab.adilishastemlabs.com
sudo nginx -t
sudo systemctl reload nginx
```

**For Apache**:
```bash
sudo cp /var/www/lab.adilishastemlabs.com/repo/density/apache-config.conf \
  /etc/apache2/sites-available/lab.adilishastemlabs.com.conf
sudo a2ensite lab.adilishastemlabs.com.conf
sudo systemctl reload apache2
```

3. **Test**:
- Visit `https://labs.adilishastemlabs.com/`
- You should see the landing page
- Click on experiment cards to access each experiment

## Next Steps

- Add more experiments as needed
- Customize the landing page colors/branding
- Add experiment screenshots to the cards
- Set up SSL if not already done

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
