# Adilisha STEM Labs - Interactive Science Experiments

A collection of interactive science experiments built on PhET Interactive Simulations framework, hosted for educational purposes.

## 🌐 Live Site

**Main Portal**: [labs.adilishastemlabs.com](https://labs.adilishastemlabs.com)

## 🧪 Available Experiments

1. **Density** - Explore the relationship between mass, volume, and density
   - URL: `/density/density_en.html`
   - Topics: Physics, Matter, Buoyancy

2. **Models of the Hydrogen Atom** - Journey through atomic models from classical to quantum mechanics
   - URL: `/models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html`
   - Topics: Chemistry, Quantum Physics, Atomic Structure

## 📁 Project Structure

```
stem-experiments/
├── index.html                    # Main landing page
├── density/                      # Density experiment
│   ├── density_en.html
│   ├── apache-config.conf        # Server configurations
│   ├── nginx-config.conf
│   └── js/
├── models-of-the-hydrogen-atom/  # Hydrogen atom experiment
│   ├── models-of-the-hydrogen-atom_en.html
│   └── js/
├── deploy.sh                     # Automated deployment script
├── QUICKSTART.md                 # Quick deployment guide
└── DEPLOYMENT.md                 # Detailed deployment guide
```

## 🚀 Quick Start

### Local Development

1. Clone the repository
2. Use a local web server (e.g., Python's http.server, Live Server, etc.)
3. Navigate to `http://localhost:8000/` (or your server's port)

```bash
# Example: Using Python's built-in server
python3 -m http.server 8000
```

### Deployment to Production

**Option 1: Automated Deployment (Recommended)**

```bash
chmod +x deploy.sh
./deploy.sh user@labs.adilishastemlabs.com
```

**Option 2: Manual Deployment**

See [QUICKSTART.md](./QUICKSTART.md) for step-by-step instructions.

## 🔧 Configuration

### Web Server Requirements

- **Nginx** (recommended) or **Apache**
- PHP not required
- SSL certificate (Let's Encrypt recommended)

### Server Configuration Files

- **Nginx**: `density/nginx-config.conf`
- **Apache**: `density/apache-config.conf`

Both configurations handle:
- URL routing for all experiments
- CORS headers
- Static file caching
- SSL support (when enabled)

## 📝 Adding New Experiments

1. Add experiment folder to the project root
2. Update `index.html` to include a new experiment card
3. Update server configuration files to add the new location
4. Deploy using `deploy.sh`

Example configuration for a new experiment:

**Nginx:**
```nginx
location /new-experiment/ {
    alias /var/www/lab.adilishastemlabs.com/repo/new-experiment/;
    try_files $uri $uri/ =404;
    add_header Access-Control-Allow-Origin *;
}
```

**Apache:**
```apache
Alias /new-experiment /var/www/lab.adilishastemlabs.com/repo/new-experiment

<Directory "/var/www/lab.adilishastemlabs.com/repo/new-experiment">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
    Header set Access-Control-Allow-Origin "*"
</Directory>
```

## 🎨 Customization

### Landing Page

Edit `index.html` to:
- Change branding colors
- Update experiment descriptions
- Add or remove experiments
- Modify layout and styling

### Styling Variables

The landing page uses CSS with the following main colors:
- Primary gradient: `#667eea` to `#764ba2`
- Background: White cards on gradient background
- Responsive grid layout

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment instructions
- [deploy.sh](./deploy.sh) - Automated deployment script

## 🛠️ Troubleshooting

### Issue: Root domain shows experiment instead of landing page
**Fix**: Ensure `DocumentRoot` points to `/var/www/lab.adilishastemlabs.com/repo` and `index.html` exists

### Issue: Experiments return 404
**Fix**: Check file paths in server config and verify permissions

### Issue: JavaScript not loading
**Fix**: Check browser console, verify CORS headers, and check file paths

For more troubleshooting tips, see [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

## 📜 License

These experiments are adapted from PhET Interactive Simulations (University of Colorado Boulder).

- Original PhET simulations: GPL-3.0
- This adapted collection: GPL-3.0

## 🙏 Acknowledgments

- **PhET Interactive Simulations** - University of Colorado Boulder
- Original simulations available at [phet.colorado.edu](https://phet.colorado.edu)

## 📧 Support

For questions or issues:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review server error logs
3. Test URLs using curl or browser DevTools

---

**© 2026 Adilisha STEM Labs** - Empowering students through interactive learning experiences.
