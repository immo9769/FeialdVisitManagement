#!/bin/bash
# =================================================================
# Enterprise Field Visit & CRM System - 1-Click Production Deployment
# =================================================================

echo "====================================================="
echo "🚀 Starting Enterprise Field Visit CRM Deployment..."
echo "====================================================="

# 1. Install & Build Backend
echo "📦 Installing NestJS Backend Dependencies..."
cd backend
npm install --production=false
echo "🔨 Building Backend Production Code..."
npm run build
cd ..

# 2. Install & Build Frontend
echo "📦 Installing React Frontend Dependencies..."
cd frontend
npm install
echo "🔨 Building Frontend Production Bundle..."
npm run build
cd ..

# 3. Setup Nginx Configuration
echo "🌐 Configuring Nginx Web Server..."
sudo cat << 'EOF' > /etc/nginx/sites-available/field-crm
server {
    listen 80;
    server_name _;

    # React Frontend Bundle
    location / {
        root /var/www/field-crm/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # NestJS Backend API Proxy
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/field-crm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# 4. Start Backend with PM2 Process Manager
echo "⚙️ Starting PM2 Background Daemon..."
cd backend
pm2 restart field-crm-backend || pm2 start dist/main.js --name "field-crm-backend"
pm2 save
pm2 startup

echo "====================================================="
echo "✅ DEPLOYMENT COMPLETE! CRM IS LIVE ON PORT 80 / 443"
echo "====================================================="
