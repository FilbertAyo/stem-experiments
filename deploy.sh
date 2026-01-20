#!/bin/bash

# Deployment script for Adilisha STEM Labs
# Usage: ./deploy.sh [server-user@server-ip]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Adilisha STEM Labs Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if server argument is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./deploy.sh [user@server-ip]${NC}"
    echo -e "${YELLOW}Example: ./deploy.sh root@labs.adilishastemlabs.com${NC}"
    exit 1
fi

SERVER="$1"
REMOTE_PATH="/var/www/lab.adilishastemlabs.com/repo"
LOCAL_PATH="$(pwd)"

echo -e "${YELLOW}Deploying to: ${SERVER}${NC}"
echo -e "${YELLOW}Remote path: ${REMOTE_PATH}${NC}\n"

# Ask for confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# Step 1: Upload files
echo -e "\n${GREEN}Step 1: Uploading files to server...${NC}"
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.gitignore' \
    --exclude '.vscode' \
    --exclude 'deploy.sh' \
    --exclude '*.md' \
    "${LOCAL_PATH}/" "${SERVER}:${REMOTE_PATH}/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Files uploaded successfully${NC}"
else
    echo -e "${RED}✗ File upload failed${NC}"
    exit 1
fi

# Step 2: Set permissions
echo -e "\n${GREEN}Step 2: Setting proper permissions...${NC}"
ssh "${SERVER}" "sudo chown -R www-data:www-data ${REMOTE_PATH} && \
                 sudo chmod -R 755 ${REMOTE_PATH}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Permissions set successfully${NC}"
else
    echo -e "${RED}✗ Failed to set permissions${NC}"
    exit 1
fi

# Step 3: Detect and configure web server
echo -e "\n${GREEN}Step 3: Configuring web server...${NC}"

# Check which web server is running
ssh "${SERVER}" "command -v nginx" > /dev/null 2>&1
NGINX_INSTALLED=$?

ssh "${SERVER}" "command -v apache2" > /dev/null 2>&1
APACHE_INSTALLED=$?

if [ $NGINX_INSTALLED -eq 0 ]; then
    echo -e "${YELLOW}Nginx detected. Applying configuration...${NC}"
    ssh "${SERVER}" "sudo cp ${REMOTE_PATH}/density/nginx-config.conf \
                           /etc/nginx/sites-available/lab.adilishastemlabs.com && \
                     sudo ln -sf /etc/nginx/sites-available/lab.adilishastemlabs.com \
                                /etc/nginx/sites-enabled/ && \
                     sudo nginx -t && \
                     sudo systemctl reload nginx"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
    else
        echo -e "${RED}✗ Nginx configuration failed${NC}"
        exit 1
    fi

elif [ $APACHE_INSTALLED -eq 0 ]; then
    echo -e "${YELLOW}Apache detected. Applying configuration...${NC}"
    ssh "${SERVER}" "sudo cp ${REMOTE_PATH}/density/apache-config.conf \
                           /etc/apache2/sites-available/lab.adilishastemlabs.com.conf && \
                     sudo a2ensite lab.adilishastemlabs.com.conf && \
                     sudo a2enmod headers && \
                     sudo a2enmod alias && \
                     sudo apachectl configtest && \
                     sudo systemctl reload apache2"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Apache configured and reloaded${NC}"
    else
        echo -e "${RED}✗ Apache configuration failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ No supported web server found (Nginx or Apache required)${NC}"
    exit 1
fi

# Step 4: Test deployment
echo -e "\n${GREEN}Step 4: Testing deployment...${NC}"

DOMAIN="labs.adilishastemlabs.com"

# Test main page
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${DOMAIN}/")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 301 ] || [ "$HTTP_CODE" -eq 302 ]; then
    echo -e "${GREEN}✓ Main page: OK (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${YELLOW}⚠ Main page: HTTP ${HTTP_CODE}${NC}"
fi

# Test density experiment
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${DOMAIN}/density/density_en.html")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 301 ] || [ "$HTTP_CODE" -eq 302 ]; then
    echo -e "${GREEN}✓ Density experiment: OK (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${YELLOW}⚠ Density experiment: HTTP ${HTTP_CODE}${NC}"
fi

# Test hydrogen atom experiment
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${DOMAIN}/models-of-the-hydrogen-atom/models-of-the-hydrogen-atom_en.html")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 301 ] || [ "$HTTP_CODE" -eq 302 ]; then
    echo -e "${GREEN}✓ Hydrogen atom experiment: OK (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${YELLOW}⚠ Hydrogen atom experiment: HTTP ${HTTP_CODE}${NC}"
fi

# Final message
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Visit: http://${DOMAIN}${NC}"
echo -e "${YELLOW}Or: https://${DOMAIN} (if SSL is configured)${NC}\n"
