#!/bin/bash
# Single command to fix everything - copy and paste this entire block
# Run from: /var/www/lab.adilishastemlabs.com/repo

cd /var/www/lab.adilishastemlabs.com/repo && \
echo "=== Fixing chipper ===" && \
([ -d "chipper" ] && [ ! -f "chipper/package.json" ] && rm -rf chipper || true) && \
([ ! -d "chipper" ] && git clone https://github.com/phetsims/chipper.git chipper || echo "chipper OK") && \
echo "=== Fixing perennial-alias ===" && \
([ -d "perennial-alias" ] && [ ! -f "perennial-alias/package.json" ] && rm -rf perennial-alias || true) && \
([ ! -d "perennial-alias" ] && git clone https://github.com/phetsims/perennial.git perennial-alias || echo "perennial-alias OK") && \
echo "=== Installing chipper dependencies ===" && \
cd chipper && npm install && cd .. && \
echo "=== Installing perennial-alias dependencies ===" && \
cd perennial-alias && npm install && cd .. && \
echo "=== Installing density dependencies ===" && \
cd density && npm install && \
echo "=== Building simulation ===" && \
npx grunt --brands=adapted-from-phet && \
cd .. && \
echo "" && \
echo "✓✓✓ SUCCESS! Build complete! ✓✓✓" && \
echo "Build location: /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/" && \
ls -la /var/www/lab.adilishastemlabs.com/repo/density/build/adapted-from-phet/ | head -10
