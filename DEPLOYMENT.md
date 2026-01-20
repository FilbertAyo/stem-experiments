# Deployment Guide for Adilisha STEM Labs

## Overview
This guide explains how to properly deploy your STEM experiments to `labs.adilishastemlabs.com` with correct URL routing.

## URL Structure

### Local Development
- Main page: `http://localhost/index.html`
- Density: `http://localhost/density/density_en.html`
- Hydrogen Atom: `http://localhost/models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html`

### Production (Hosted)
- Main page: `https://labs.adilishastemlabs.com/`
- Density: `https://labs.adilishastemlabs.com/density/density_en.html`
- Hydrogen Atom: `https://labs.adilishastemlabs.com/models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html`

## File Structure

```
/var/www/lab.adilishastemlabs.com/repo/
├── index.html                              # Main landing page
├── density/
│   ├── density_en.html                     # Density experiment
│   ├── js/
│   └── ... (other density files)
├── models-of-the-hydrogen-atom/
│   ├── models-of-the-hydrogen-atom_en.html # Hydrogen atom experiment
│   ├── js/
│   └── ... (other hydrogen atom files)
└── ... (shared libraries)
```

## Deployment Steps

### 1. Upload Files to Server
Upload your project files to the server:

```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /Users/ayo/Desktop/projects/stem-experiments/ \
  user@your-server:/var/www/lab.adilishastemlabs.com/repo/
```

### 2. Configure Web Server

#### For Nginx:

1. Copy the configuration file:
```bash
sudo cp /var/www/lab.adilishastemlabs.com/repo/density/nginx-config.conf \
  /etc/nginx/sites-available/lab.adilishastemlabs.com
```

2. Create a symbolic link:
```bash
sudo ln -s /etc/nginx/sites-available/lab.adilishastemlabs.com \
  /etc/nginx/sites-enabled/
```

3. Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### For Apache:

1. Copy the configuration file:
```bash
sudo cp /var/www/lab.adilishastemlabs.com/repo/density/apache-config.conf \
  /etc/apache2/sites-available/lab.adilishastemlabs.com.conf
```

2. Enable the site:
```bash
sudo a2ensite lab.adilishastemlabs.com.conf
```

3. Enable required modules:
```bash
sudo a2enmod headers
sudo a2enmod alias
```

4. Test and reload Apache:
```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

### 3. Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo
sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo
```

### 4. SSL Certificate (Optional but Recommended)

If using Let's Encrypt:

```bash
sudo certbot --nginx -d labs.adilishastemlabs.com
# or for Apache:
sudo certbot --apache -d labs.adilishastemlabs.com
```

Then uncomment the SSL section in the configuration file.

## Adding New Experiments

When you add a new experiment (e.g., "buoyancy"):

1. **Add the experiment files** to the repository
2. **Update `index.html`** to include a new card for the experiment
3. **Update server configuration** (nginx-config.conf or apache-config.conf) to add the new location block:

For Nginx:
```nginx
location /buoyancy/ {
    alias /var/www/lab.adilishastemlabs.com/repo/buoyancy/;
    try_files $uri $uri/ =404;
    add_header Access-Control-Allow-Origin *;
}
```

For Apache:
```apache
Alias /buoyancy /var/www/lab.adilishastemlabs.com/repo/buoyancy

<Directory "/var/www/lab.adilishastemlabs.com/repo/buoyancy">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
    Header set Access-Control-Allow-Origin "*"
</Directory>
```

4. **Reload the web server**

## Troubleshooting

### Issue: Root domain shows density instead of landing page
**Solution**: Make sure the `DocumentRoot` (Apache) or `root` (Nginx) points to `/var/www/lab.adilishastemlabs.com/repo` and that `index.html` exists in that directory.

### Issue: Experiments return 404
**Solution**: 
- Check file paths match the alias/location directives
- Verify file permissions (should be readable by www-data user)
- Check server error logs: `/var/log/nginx/error.log` or `/var/log/apache2/error.log`

### Issue: JavaScript files not loading
**Solution**:
- Ensure all relative paths in HTML files are correct
- Check CORS headers are set properly
- Verify MIME types are correct in server configuration

## Testing

After deployment, test all URLs:

```bash
# Test main page
curl -I https://labs.adilishastemlabs.com/

# Test density experiment
curl -I https://labs.adilishastemlabs.com/density/density_en.html

# Test hydrogen atom experiment
curl -I https://labs.adilishastemlabs.com/models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html
```

All should return `200 OK` or `301/302` (redirect).

## Support

For issues or questions, check:
- Server error logs
- Browser console for JavaScript errors
- Network tab in browser DevTools for failed requests
