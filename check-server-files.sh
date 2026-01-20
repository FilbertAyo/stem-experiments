#!/bin/bash

# Script to check if all required files exist on the server
echo "======================================"
echo "Checking Server File Structure"
echo "======================================"
echo ""

cd /var/www/lab.adilishastemlabs.com/repo || exit 1

echo "Current directory: $(pwd)"
echo ""

echo "Checking main directories:"
echo "------------------------"
for dir in sherpa joist chipper assert query-string-machine density density-buoyancy-common mobius scenery-phet sun tambo twixt axon dot kite phet-core scenery brand babel perennial-alias phetcommon phetmarks utterance-queue tandem models-of-the-hydrogen-atom; do
    if [ -d "$dir" ]; then
        echo "✓ $dir/ exists"
    else
        echo "✗ $dir/ MISSING!"
    fi
done

echo ""
echo "Checking critical sherpa files:"
echo "------------------------------"
for file in sherpa/lib/lodash-4.17.4.js sherpa/lib/FileSaver-b8054a2.js sherpa/lib/p2-0.7.1.js sherpa/lib/three-r104.js; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file MISSING!"
    fi
done

echo ""
echo "Checking chipper files:"
echo "----------------------"
for file in chipper/js/browser/initialize-globals.js chipper/js/browser/load-unbuilt-strings.js; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file MISSING!"
    fi
done

echo ""
echo "Checking experiment HTML files:"
echo "------------------------------"
if [ -f "density/density_en.html" ]; then
    echo "✓ density/density_en.html exists"
else
    echo "✗ density/density_en.html MISSING!"
fi

if [ -f "models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html" ]; then
    echo "✓ models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html exists"
else
    echo "✗ models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html MISSING!"
fi

echo ""
echo "Checking index.html:"
echo "-------------------"
if [ -f "index.html" ]; then
    echo "✓ index.html exists"
else
    echo "✗ index.html MISSING!"
fi

echo ""
echo "File permissions check:"
echo "----------------------"
ls -la | head -20

echo ""
echo "======================================"
echo "Check complete!"
echo "======================================"
