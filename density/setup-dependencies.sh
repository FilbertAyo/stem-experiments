#!/bin/bash

# Script to clone/update all PhET dependencies for Density simulation
# Run this from the repo root: /var/www/lab.adilishastemlabs.com/repo

set -e  # Exit on error

echo "========================================="
echo "PhET Density Simulation - Dependency Setup"
echo "========================================="
echo ""

REPO_ROOT=$(pwd)
echo "Repo root: $REPO_ROOT"
echo ""

# Function to clone or update a repository
clone_or_update() {
    local repo_name=$1
    local repo_url=$2
    local target_dir=$3
    
    if [ -z "$target_dir" ]; then
        target_dir=$repo_name
    fi
    
    echo "Processing: $repo_name..."
    
    if [ -d "$target_dir" ]; then
        if [ -d "$target_dir/.git" ]; then
            echo "  → Updating existing git repository..."
            cd "$target_dir"
            git fetch origin
            git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
            git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
            cd "$REPO_ROOT"
        else
            echo "  → Directory exists but is not a git repo. Removing and cloning..."
            rm -rf "$target_dir"
            git clone "$repo_url" "$target_dir"
        fi
    else
        echo "  → Cloning new repository..."
        git clone "$repo_url" "$target_dir"
    fi
    
    # Check if package.json exists after clone/update
    if [ -f "$target_dir/package.json" ]; then
        echo "  ✓ $repo_name ready (package.json found)"
    else
        echo "  ⚠ Warning: $repo_name cloned but package.json not found"
    fi
    echo ""
}

# List of all required dependencies
echo "Cloning/updating all dependencies..."
echo ""

clone_or_update "assert" "https://github.com/phetsims/assert.git"
clone_or_update "axon" "https://github.com/phetsims/axon.git"
clone_or_update "babel" "https://github.com/phetsims/babel.git"
clone_or_update "brand" "https://github.com/phetsims/brand.git"
clone_or_update "chipper" "https://github.com/phetsims/chipper.git"
clone_or_update "density" "https://github.com/phetsims/density.git"
clone_or_update "density-buoyancy-common" "https://github.com/phetsims/density-buoyancy-common.git"
clone_or_update "dot" "https://github.com/phetsims/dot.git"
clone_or_update "joist" "https://github.com/phetsims/joist.git"
clone_or_update "kite" "https://github.com/phetsims/kite.git"
clone_or_update "mobius" "https://github.com/phetsims/mobius.git"
clone_or_update "perennial" "https://github.com/phetsims/perennial.git" "perennial-alias"
clone_or_update "phet-core" "https://github.com/phetsims/phet-core.git"
clone_or_update "phetcommon" "https://github.com/phetsims/phetcommon.git"
clone_or_update "phetmarks" "https://github.com/phetsims/phetmarks.git"
clone_or_update "query-string-machine" "https://github.com/phetsims/query-string-machine.git"
clone_or_update "scenery" "https://github.com/phetsims/scenery.git"
clone_or_update "scenery-phet" "https://github.com/phetsims/scenery-phet.git"
clone_or_update "sherpa" "https://github.com/phetsims/sherpa.git"
clone_or_update "sun" "https://github.com/phetsims/sun.git"
clone_or_update "tambo" "https://github.com/phetsims/tambo.git"
clone_or_update "tandem" "https://github.com/phetsims/tandem.git"
clone_or_update "twixt" "https://github.com/phetsims/twixt.git"
clone_or_update "utterance-queue" "https://github.com/phetsims/utterance-queue.git"

echo "========================================="
echo "✓ All dependencies cloned/updated!"
echo "========================================="
echo ""
echo "Next step: Run the installation script:"
echo "  cd density && bash ../density/deploy.sh"
echo ""
echo "Or manually install dependencies:"
echo "  cd chipper && npm install && cd .."
echo "  cd perennial-alias && npm install && cd .."
echo "  cd density && npm install && cd .."
echo "  cd density && grunt --brands=adapted-from-phet"
