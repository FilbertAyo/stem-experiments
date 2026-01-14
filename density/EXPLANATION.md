# Why Different URLs: Development vs Production

## Understanding the Two Versions

### Development Version (Local - Port 5501)
- **File:** `density_en.html`
- **URL:** `http://127.0.0.1:5501/density/density_en.html`
- **What it is:** Source file that loads dependencies dynamically
- **Use case:** Development and testing
- **Requires:** Dev server (like Live Server) that can serve the entire repo directory

### Production Build (Hosting)
- **File:** `density_en_adapted-from-phet.html`
- **URL:** `https://lab.adilishastemlabs.com/density/density_en_adapted-from-phet.html`
- **What it is:** Compiled/built version with all dependencies bundled
- **Use case:** Production hosting
- **Requires:** Build process (`grunt --brands=adapted-from-phet`)

## Why the Filename Changes?

When you run `grunt --brands=adapted-from-phet`, it:
1. Compiles all TypeScript/JavaScript files
2. Bundles all dependencies
3. Optimizes assets
4. Creates a self-contained HTML file named `density_en_adapted-from-phet.html`

The `_adapted-from-phet` suffix indicates it's a production build for the "adapted-from-phet" brand.

## Solution Options

### Option 1: Use Production Build (Recommended)
Build the simulation and use the production URL:
- Build command: `npx grunt --brands=adapted-from-phet`
- Access at: `/density/density_en_adapted-from-phet.html`

### Option 2: Serve Development Version (Not Recommended for Production)
Configure nginx to serve the entire repo directory and access `density_en.html` directly.
This is slower and not optimized for production.
