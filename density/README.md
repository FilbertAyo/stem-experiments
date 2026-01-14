# Density Simulation - Build & Deploy

## Quick Build

Just run this one script:

```bash
cd /var/www/lab.adilishastemlabs.com/repo
bash density/build.sh
```

This will:
1. ✅ Clone all missing dependencies
2. ✅ Install npm packages  
3. ✅ Build the simulation (skips lint to avoid failures)

## After Build

```bash
sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build
sudo systemctl reload nginx
```

## Access

**https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html**

---

## Available Scripts

- **`build.sh`** - Main build script (use this!)
- **`setup-nginx.sh`** - Configure nginx (if needed)
- **`update-nginx-config.sh`** - Update nginx config (if needed)
- **`setup-permissions.sh`** - Set file permissions (if needed)

That's it! All other scripts have been removed to keep things simple.

---

## Original README

See the original PhET README below for development information.
