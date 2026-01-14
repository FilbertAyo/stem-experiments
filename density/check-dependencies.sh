#!/bin/bash

# Quick diagnostic script to check dependency status
# Run from: /var/www/lab.adilishastemlabs.com/repo

echo "========================================="
echo "Checking PhET Dependencies Status"
echo "========================================="
echo ""

REPO_ROOT=$(pwd)

check_dir() {
    local dir=$1
    local required=$2
    
    echo -n "Checking $dir... "
    
    if [ ! -d "$dir" ]; then
        echo "✗ MISSING"
        return 1
    fi
    
    if [ ! -d "$dir/.git" ]; then
        echo "⚠ EXISTS but NOT a git repository"
        return 2
    fi
    
    if [ ! -f "$dir/package.json" ]; then
        echo "⚠ EXISTS but NO package.json"
        return 3
    fi
    
    echo "✓ OK (has .git and package.json)"
    return 0
}

echo "Critical dependencies:"
check_dir "chipper" "required"
check_dir "perennial-alias" "required"
check_dir "density" "required"
echo ""

echo "Other dependencies:"
check_dir "assert"
check_dir "axon"
check_dir "babel"
check_dir "brand"
check_dir "density-buoyancy-common"
check_dir "dot"
check_dir "joist"
check_dir "kite"
check_dir "mobius"
check_dir "phet-core"
check_dir "phetcommon"
check_dir "phetmarks"
check_dir "query-string-machine"
check_dir "scenery"
check_dir "scenery-phet"
check_dir "sherpa"
check_dir "sun"
check_dir "tambo"
check_dir "tandem"
check_dir "twixt"
check_dir "utterance-queue"
echo ""

echo "========================================="
echo "Summary:"
echo "========================================="
echo ""
echo "If chipper, perennial-alias, or density show issues, run:"
echo "  bash setup-dependencies.sh"
echo ""
echo "Then proceed with installation:"
echo "  cd chipper && npm install && cd .."
echo "  cd perennial-alias && npm install && cd .."
echo "  cd density && npm install && cd .."
