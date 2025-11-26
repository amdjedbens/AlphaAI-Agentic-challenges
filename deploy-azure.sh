#!/bin/bash
# Azure Container Apps Deployment Script
# Prerequisites: Azure CLI installed and logged in

set -e

# ============================================
# CONFIGURATION - Update these values
# ============================================
RESOURCE_GROUP="rag-challenge-rg"
LOCATION="eastus"                    # Choose: eastus, westus2, westeurope, etc.
ENVIRONMENT_NAME="rag-challenge-env"
REGISTRY_NAME="ragchallengeacr"      # Must be globally unique, lowercase alphanumeric

# App names
BACKEND_APP="rag-backend"
FRONTEND_APP="rag-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Azure RAG Challenge Platform Deployment ===${NC}"

# ============================================
# Step 1: Create Resource Group
# ============================================
echo -e "\n${YELLOW}Step 1: Creating Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# ============================================
# Step 2: Create Azure Container Registry
# ============================================
echo -e "\n${YELLOW}Step 2: Creating Azure Container Registry...${NC}"
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $REGISTRY_NAME \
    --sku Basic \
    --admin-enabled true

# Get ACR credentials
ACR_LOGIN_SERVER=$(az acr show --name $REGISTRY_NAME --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name $REGISTRY_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $REGISTRY_NAME --query passwords[0].value -o tsv)

echo -e "${GREEN}ACR created: $ACR_LOGIN_SERVER${NC}"

# ============================================
# Step 3: Build and Push Docker Images
# ============================================
echo -e "\n${YELLOW}Step 3: Building and pushing Docker images...${NC}"

# Login to ACR
az acr login --name $REGISTRY_NAME

# Build and push backend
echo "Building backend image..."
docker build -t $ACR_LOGIN_SERVER/$BACKEND_APP:latest ./backend
docker push $ACR_LOGIN_SERVER/$BACKEND_APP:latest

# Build and push frontend
echo "Building frontend image..."
docker build -t $ACR_LOGIN_SERVER/$FRONTEND_APP:latest ./frontend
docker push $ACR_LOGIN_SERVER/$FRONTEND_APP:latest

# ============================================
# Step 4: Create Container Apps Environment
# ============================================
echo -e "\n${YELLOW}Step 4: Creating Container Apps Environment...${NC}"
az containerapp env create \
    --name $ENVIRONMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION

# ============================================
# Step 5: Deploy Backend Container App
# ============================================
echo -e "\n${YELLOW}Step 5: Deploying Backend...${NC}"

# Prompt for OpenAI API Key
echo -e "${YELLOW}Enter your OpenAI API Key:${NC}"
read -s OPENAI_API_KEY

az containerapp create \
    --name $BACKEND_APP \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT_NAME \
    --image $ACR_LOGIN_SERVER/$BACKEND_APP:latest \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 8006 \
    --ingress external \
    --cpu 2 \
    --memory 4Gi \
    --min-replicas 1 \
    --max-replicas 3 \
    --env-vars "OPENAI_API_KEY=$OPENAI_API_KEY"

# Get backend URL
BACKEND_URL=$(az containerapp show \
    --name $BACKEND_APP \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn -o tsv)

echo -e "${GREEN}Backend deployed: https://$BACKEND_URL${NC}"

# ============================================
# Step 6: Deploy Frontend Container App
# ============================================
echo -e "\n${YELLOW}Step 6: Deploying Frontend...${NC}"

az containerapp create \
    --name $FRONTEND_APP \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT_NAME \
    --image $ACR_LOGIN_SERVER/$FRONTEND_APP:latest \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 3000 \
    --ingress external \
    --cpu 0.5 \
    --memory 1Gi \
    --min-replicas 1 \
    --max-replicas 3 \
    --env-vars "NEXT_PUBLIC_API_URL=https://$BACKEND_URL"

# Get frontend URL
FRONTEND_URL=$(az containerapp show \
    --name $FRONTEND_APP \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn -o tsv)

# ============================================
# Step 7: Update Backend CORS
# ============================================
echo -e "\n${YELLOW}Step 7: Updating Backend CORS settings...${NC}"
echo -e "${YELLOW}Note: Update backend/main.py CORS origins to include: https://$FRONTEND_URL${NC}"

# ============================================
# Deployment Complete
# ============================================
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "Frontend URL: ${GREEN}https://$FRONTEND_URL${NC}"
echo -e "Backend URL:  ${GREEN}https://$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update backend CORS settings to allow: https://$FRONTEND_URL"
echo "2. Test the application at https://$FRONTEND_URL"
echo "3. Monitor logs: az containerapp logs show --name $BACKEND_APP --resource-group $RESOURCE_GROUP"
echo ""
echo -e "${YELLOW}To delete all resources:${NC}"
echo "az group delete --name $RESOURCE_GROUP --yes"

