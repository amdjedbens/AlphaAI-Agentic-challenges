# 🌊 DigitalOcean Deployment Guide

Deploy the RAG Challenge Platform on DigitalOcean with maximum stability.

---

## 🚀 Quick Start (15 minutes)

### Step 1: Create a Droplet

1. Go to [DigitalOcean](https://cloud.digitalocean.com/droplets/new)
2. Create a **Droplet** with these settings:

| Setting | Recommended Value |
|---------|-------------------|
| **Image** | Ubuntu 24.04 LTS |
| **Plan** | Basic → Regular → **$24/mo (4GB RAM, 2 vCPU)** |
| **Region** | Closest to your users |
| **Authentication** | SSH Key (recommended) |
| **Hostname** | `rag-challenge` |

> ⚠️ **Important**: You need at least **4GB RAM** for the ML models!

### Step 2: Connect to Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### Step 3: Initial Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Install Nginx & Certbot
apt install -y nginx certbot python3-certbot-nginx git

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Step 4: Clone & Deploy

```bash
# Clone your repo
cd /opt
git clone https://github.com/YOUR_USERNAME/alpha-ai-challenges.git
cd alpha-ai-challenges

# Create environment file
cat > .env << EOF
OPENAI_API_KEY=sk-your-openai-key-here
NEXT_PUBLIC_API_URL=http://YOUR_DROPLET_IP:8006
EOF

# Start the application
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps
```

### Step 5: Verify Deployment

```bash
# Wait 2-3 minutes for ML models to load, then test:
curl http://localhost:8006/           # Backend health
curl http://localhost:3000/           # Frontend health
```

Visit `http://YOUR_DROPLET_IP:3000` in your browser! 🎉

---

## 🔒 Production Setup (Optional but Recommended)

### Add a Domain & SSL

1. **Point your domain** to the Droplet IP (A record)

2. **Configure Nginx**:
```bash
# Copy the nginx config
cp /opt/alpha-ai-challenges/nginx.conf /etc/nginx/sites-available/rag-challenge

# Edit and replace 'your-domain.com' with your actual domain
nano /etc/nginx/sites-available/rag-challenge

# Enable the site
ln -s /etc/nginx/sites-available/rag-challenge /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default

# Test and reload
nginx -t
systemctl reload nginx
```

3. **Get SSL Certificate**:
```bash
certbot --nginx -d your-domain.com
```

4. **Update environment** for HTTPS:
```bash
cd /opt/alpha-ai-challenges
nano .env
# Change to: NEXT_PUBLIC_API_URL=https://your-domain.com/api
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🛡️ Stability Features (Already Configured)

The `docker-compose.prod.yml` includes:

| Feature | What it does |
|---------|--------------|
| `restart: always` | Auto-restart crashed containers |
| `healthcheck` | Monitors container health, restarts unhealthy |
| `resource limits` | Prevents memory exhaustion |
| `logging limits` | Prevents disk fill from logs |
| `watchtower` | Auto-updates containers (optional) |

---

## 📊 Monitoring & Maintenance

### View Logs
```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# Backend only
docker compose -f docker-compose.prod.yml logs -f backend

# Frontend only
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Check Container Status
```bash
docker compose -f docker-compose.prod.yml ps
```

### Restart Services
```bash
# Restart everything
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Update Application
```bash
cd /opt/alpha-ai-challenges
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### View Resource Usage
```bash
docker stats
```

---

## 🔄 Auto-Recovery Setup (Systemd)

Make Docker Compose start on boot and auto-recover:

```bash
# Create systemd service
cat > /etc/systemd/system/rag-challenge.service << 'EOF'
[Unit]
Description=RAG Challenge Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/alpha-ai-challenges
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable rag-challenge
systemctl start rag-challenge
```

---

## 💰 Cost Breakdown

| Resource | Monthly Cost |
|----------|-------------|
| Droplet (4GB/2vCPU) | $24 |
| Backups (optional) | $4.80 |
| **Total** | **~$24-29/month** |

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Common issues:
# - Missing OPENAI_API_KEY in .env
# - Not enough memory (need 4GB)
```

### Frontend can't reach backend
```bash
# Check NEXT_PUBLIC_API_URL in .env matches your setup
# If using domain: https://your-domain.com/api
# If using IP directly: http://YOUR_IP:8006
```

### Out of memory
```bash
# Check memory usage
free -h
docker stats

# If needed, upgrade Droplet via DigitalOcean panel (no data loss)
```

### Containers keep restarting
```bash
# Check health
docker compose -f docker-compose.prod.yml ps

# View detailed logs
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

---

## 📁 File Structure on Server

```
/opt/alpha-ai-challenges/
├── .env                      # Your secrets (OPENAI_API_KEY)
├── docker-compose.prod.yml   # Production compose file
├── backend/
├── frontend/
├── data/
└── ...
```

---

## ✅ Post-Deployment Checklist

- [ ] Droplet created with 4GB+ RAM
- [ ] Docker & Docker Compose installed
- [ ] Repository cloned to `/opt/`
- [ ] `.env` file created with `OPENAI_API_KEY`
- [ ] Containers running (`docker compose ps`)
- [ ] Frontend accessible at port 3000
- [ ] Backend health check passes
- [ ] (Optional) Domain configured
- [ ] (Optional) SSL certificate installed
- [ ] (Optional) Systemd service enabled
- [ ] (Optional) DigitalOcean backups enabled

