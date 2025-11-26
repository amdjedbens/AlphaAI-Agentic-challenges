#!/bin/bash
# DigitalOcean Droplet Deployment Script
# Run this AFTER SSHing into your Droplet

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== RAG Challenge Platform - DigitalOcean Setup ===${NC}"

# ============================================
# Step 1: Update System
# ============================================
echo -e "\n${YELLOW}Step 1: Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# ============================================
# Step 2: Install Docker
# ============================================
echo -e "\n${YELLOW}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker installed. You may need to log out and back in.${NC}"
else
    echo -e "${GREEN}Docker already installed.${NC}"
fi

# ============================================
# Step 3: Install Docker Compose
# ============================================
echo -e "\n${YELLOW}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo apt install -y docker-compose-plugin
fi

# ============================================
# Step 4: Setup Firewall
# ============================================
echo -e "\n${YELLOW}Step 4: Configuring firewall...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend (temporary, will be proxied)
sudo ufw allow 8006/tcp  # Backend (temporary, will be proxied)
sudo ufw --force enable

# ============================================
# Step 5: Install Nginx (Reverse Proxy)
# ============================================
echo -e "\n${YELLOW}Step 5: Installing Nginx...${NC}"
sudo apt install -y nginx

# ============================================
# Step 6: Install Certbot for SSL
# ============================================
echo -e "\n${YELLOW}Step 6: Installing Certbot for SSL...${NC}"
sudo apt install -y certbot python3-certbot-nginx

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Base setup complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clone your repository"
echo "2. Create .env file with OPENAI_API_KEY"
echo "3. Run: docker compose -f docker-compose.prod.yml up -d"
echo "4. Configure Nginx reverse proxy"
echo "5. Setup SSL with Certbot"

