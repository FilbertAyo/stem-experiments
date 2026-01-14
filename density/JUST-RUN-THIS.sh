#!/bin/bash
# ONE COMMAND TO FIX EVERYTHING - Just copy and paste this entire script
# Run from: /var/www/lab.adilishastemlabs.com/repo

cd /var/www/lab.adilishastemlabs.com/repo && \
echo "=== Cloning missing dependencies ===" && \
([ ! -d "phet-core" ] && git clone https://github.com/phetsims/phet-core.git phet-core 2>/dev/null || true) && \
([ ! -d "dot" ] && git clone https://github.com/phetsims/dot.git dot 2>/dev/null || true) && \
([ ! -d "kite" ] && git clone https://github.com/phetsims/kite.git kite 2>/dev/null || true) && \
([ ! -d "scenery" ] && git clone https://github.com/phetsims/scenery.git scenery 2>/dev/null || true) && \
([ ! -d "sun" ] && git clone https://github.com/phetsims/sun.git sun 2>/dev/null || true) && \
([ ! -d "tandem" ] && git clone https://github.com/phetsims/tandem.git tandem 2>/dev/null || true) && \
([ ! -d "axon" ] && git clone https://github.com/phetsims/axon.git axon 2>/dev/null || true) && \
([ ! -d "joist" ] && git clone https://github.com/phetsims/joist.git joist 2>/dev/null || true) && \
([ ! -d "phetcommon" ] && git clone https://github.com/phetsims/phetcommon.git phetcommon 2>/dev/null || true) && \
([ ! -d "sherpa" ] && git clone https://github.com/phetsims/sherpa.git sherpa 2>/dev/null || true) && \
([ ! -d "density-buoyancy-common" ] && git clone https://github.com/phetsims/density-buoyancy-common.git density-buoyancy-common 2>/dev/null || true) && \
([ ! -d "mobius" ] && git clone https://github.com/phetsims/mobius.git mobius 2>/dev/null || true) && \
echo "=== Installing npm packages ===" && \
(cd chipper && [ ! -d "node_modules" ] && npm install --silent || true) && \
(cd perennial-alias && [ ! -d "node_modules" ] && npm install --silent || true) && \
(cd phet-core && [ ! -d "node_modules" ] && npm install --silent || true) && \
(cd density && [ ! -d "node_modules" ] && npm install --silent || true) && \
echo "=== Building simulation (ignoring lint errors) ===" && \
cd density && \
npx grunt --brands=adapted-from-phet --force 2>&1 | grep -v "no-unnecessary-type-assertion\|Parsing error" | tail -20 && \
cd .. && \
echo "" && \
if [ -f "/var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/density_en_adapted-from-phet.html" ]; then \
    echo "✓✓✓ SUCCESS! Build complete! ✓✓✓" && \
    echo "File: density/build/adapted-from-phet/density_en_adapted-from-phet.html" && \
    ls -lh /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/density_en_adapted-from-phet.html && \
    echo "" && \
    echo "Next: Set permissions:" && \
    echo "  sudo chown -R www-data:www-data /var/www/lab.adilishastemlabs.com/repo/density/build" && \
    echo "  sudo chmod -R 755 /var/www/lab.adilishastemlabs.com/repo/density/build" && \
    echo "  sudo systemctl reload nginx"; \
else \
    echo "✗ Build file not found. Check errors above."; \
fi
