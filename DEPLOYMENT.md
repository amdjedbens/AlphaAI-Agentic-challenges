# Azure Deployment Guide

This guide covers deploying the RAG Challenge Platform to Azure.

## 📋 Prerequisites

1. **Azure CLI** installed and logged in
   ```bash
   az login
   ```

2. **Docker** installed and running

3. **OpenAI API Key** for the backend

---

## 🚀 Deployment Options

### Option 1: Azure Container Apps (Recommended) ⭐

**Best for**: Production deployments with auto-scaling, cost-effective

**Cost**: ~$50-150/month (depending on usage)

```bash
# Make the script executable
chmod +x deploy-azure.sh

# Run deployment
./deploy-azure.sh
```

### Option 2: Azure VM (Full Control)

**Best for**: Development, custom configurations, GPU workloads

**Cost**: ~$100-300/month (depending on VM size)

```bash
# Create a VM (D4s_v3 recommended for ML workloads)
az vm create \
    --resource-group rag-challenge-rg \
    --name rag-challenge-vm \
    --image Ubuntu2204 \
    --size Standard_D4s_v3 \
    --admin-username azureuser \
    --generate-ssh-keys \
    --public-ip-sku Standard

# SSH into VM
ssh azureuser@<VM_IP>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone repo and deploy
git clone <your-repo>
cd alpha-ai-challenges
docker compose up -d
```

### Option 3: Azure App Service

**Best for**: Simple deployments, managed infrastructure

```bash
# Create App Service Plan
az appservice plan create \
    --name rag-challenge-plan \
    --resource-group rag-challenge-rg \
    --sku P1V3 \
    --is-linux

# Deploy Backend
az webapp create \
    --resource-group rag-challenge-rg \
    --plan rag-challenge-plan \
    --name rag-backend \
    --deployment-container-image-name <acr-name>.azurecr.io/rag-backend:latest

# Deploy Frontend  
az webapp create \
    --resource-group rag-challenge-rg \
    --plan rag-challenge-plan \
    --name rag-frontend \
    --deployment-container-image-name <acr-name>.azurecr.io/rag-frontend:latest
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for LLM evaluation | Yes |

#### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

### Update CORS Settings

After deployment, update `backend/main.py` to include your frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend-app.azurecontainerapps.io",  # Add this
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Resource Recommendations

### Backend (ML-heavy workload)
| Environment | CPU | Memory | Notes |
|-------------|-----|--------|-------|
| Development | 1 | 2Gi | Minimum viable |
| Production | 2 | 4Gi | Recommended |
| High Load | 4 | 8Gi | For concurrent users |

### Frontend (Next.js)
| Environment | CPU | Memory | Notes |
|-------------|-----|--------|-------|
| Development | 0.25 | 0.5Gi | Minimum |
| Production | 0.5 | 1Gi | Recommended |

---

## 🔧 Useful Commands

### Logs
```bash
# Backend logs
az containerapp logs show \
    --name rag-backend \
    --resource-group rag-challenge-rg \
    --follow

# Frontend logs
az containerapp logs show \
    --name rag-frontend \
    --resource-group rag-challenge-rg \
    --follow
```

### Update Deployment
```bash
# Rebuild and push new image
docker build -t <acr>.azurecr.io/rag-backend:latest ./backend
docker push <acr>.azurecr.io/rag-backend:latest

# Update container app
az containerapp update \
    --name rag-backend \
    --resource-group rag-challenge-rg \
    --image <acr>.azurecr.io/rag-backend:latest
```

### Scale
```bash
# Scale backend to 3 replicas
az containerapp update \
    --name rag-backend \
    --resource-group rag-challenge-rg \
    --min-replicas 1 \
    --max-replicas 5
```

### Delete Resources
```bash
# Delete everything
az group delete --name rag-challenge-rg --yes
```

---

## 🔐 Security Best Practices

1. **Use Azure Key Vault** for secrets:
   ```bash
   az keyvault create --name rag-challenge-kv --resource-group rag-challenge-rg
   az keyvault secret set --vault-name rag-challenge-kv --name openai-api-key --value $OPENAI_API_KEY
   ```

2. **Enable managed identity** for secure secret access

3. **Use Azure Front Door** for CDN and DDoS protection

4. **Enable Azure Monitor** for observability

---

## 💡 Architecture Diagram

```
                    ┌─────────────────────────────────────────┐
                    │           Azure Container Apps          │
                    │              Environment                │
                    │  ┌─────────────┐   ┌─────────────────┐ │
   Users ──────────►│  │  Frontend   │───│    Backend      │ │
                    │  │  (Next.js)  │   │   (FastAPI)     │ │
                    │  │  Port 3000  │   │   Port 8006     │ │
                    │  └─────────────┘   └────────┬────────┘ │
                    └─────────────────────────────┼──────────┘
                                                  │
                    ┌─────────────────────────────▼──────────┐
                    │          Azure Storage / SQLite        │
                    │  ┌──────────────┐  ┌────────────────┐ │
                    │  │  ChromaDB    │  │  challenges.db │ │
                    │  │ (Vector DB)  │  │   (SQLite)     │ │
                    │  └──────────────┘  └────────────────┘ │
                    └────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### Backend fails to start
- Check memory allocation (sentence-transformers needs ~2GB)
- Verify OPENAI_API_KEY is set
- Check logs: `az containerapp logs show --name rag-backend -g rag-challenge-rg`

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Ensure both apps are in same Container Apps Environment

### Slow first request
- ML models are loaded on first request
- Consider increasing min-replicas to 1 to keep warm

