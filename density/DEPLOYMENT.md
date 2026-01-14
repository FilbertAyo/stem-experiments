# Deployment Guide for Density Simulation

This guide will help you deploy the Density PhET simulation to your server at `/var/www/lab.adilishastemlabs.com/repo`.

## Prerequisites

Make sure you have Node.js and npm installed on your server.

## Step 0: Verify/Clone Dependencies

**IMPORTANT:** If you're getting errors about missing `package.json` files, the dependency directories may be empty or incomplete. First, verify and clone all dependencies:

```bash
# Option 1: Use the automated setup script (recommended)
# Copy setup-dependencies.sh to your server, then:
cd /var/www/lab.adilishastemlabs.com/repo
bash setup-dependencies.sh

# Option 2: Manually clone missing dependencies
# If chipper or perennial-alias are missing package.json:
cd /var/www/lab.adilishastemlabs.com/repo
git clone https://github.com/phetsims/chipper.git chipper
git clone https://github.com/phetsims/perennial.git perennial-alias
```

## Step 1: Install Dependencies

The PhET simulation requires dependencies to be installed in three directories. Run these commands from the repo root (`/var/www/lab.adilishastemlabs.com/repo`):

```bash
# Install chipper dependencies
cd chipper
npm install
cd ..

# Install perennial-alias dependencies
cd perennial-alias
npm install
cd ..

# Install density dependencies
cd density
npm install
cd ..
```

## Step 2: Build the Simulation

Build the simulation for production. From the repo root:

```bash
cd density
grunt --brands=adapted-from-phet
```

This will create the built files in `density/build/adapted-from-phet/` directory.

**Note:** It's safe to ignore warnings like `>> WARNING404: Skipping potentially non-public dependency` - these indicate that non-public PhET-iO code is not being included in the build.

## Step 3: Configure Web Server

You have two options for serving the simulation:

### Option A: Serve the Built Files (Recommended for Production)

The built files will be in `density/build/adapted-from-phet/`. Configure your web server (nginx/apache) to serve this directory.

**For nginx**, add a location block:
```nginx
location /density {
    alias /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet;
    index density_en_adapted-from-phet.html;
}
```

**For Apache**, add to your virtual host:
```apache
Alias /density /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet
<Directory "/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

Then access the simulation at: `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`

### Option B: Serve Development Version

If you want to use the development version (not recommended for production), you can:

1. Use the grunt dev-server (for development only):
```bash
cd density
grunt dev-server
```

2. Or configure your web server to serve the entire repo directory and access: `https://lab.adilishastemlabs.com/density/density_en.html`

## Step 4: Verify Deployment

After building and configuring your web server, visit:
- Production build: `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
- Development version: `https://lab.adilishastemlabs.com/density/density_en.html`

## Troubleshooting

### If grunt command is not found:
```bash
# Install grunt globally (if needed)
npm install -g grunt-cli

# Or use npx
npx grunt --brands=adapted-from-phet
```

### If build fails:
- Make sure all dependencies are installed in chipper, perennial-alias, and density directories
- Check that Node.js version is compatible (PhET typically works with Node 14+)
- Ensure you have write permissions in the density directory

### If the simulation doesn't load:
- Check browser console for errors
- Verify all files in the build directory are accessible
- Ensure your web server is configured to serve the correct MIME types for .js files
- Check that the build directory has proper permissions
