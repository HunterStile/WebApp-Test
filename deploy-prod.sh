#!/bin/bash
# Bash script per deploy in produzione con Scraper Service

set -e  # Exit on error

echo "=========================================="
echo "🚀 WebApp Production Deployment"
echo "=========================================="
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check se Docker è installato
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker non trovato. Installalo prima di procedere.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose non trovato. Installalo prima di procedere.${NC}"
    exit 1
fi

# Check se Chrome è installato (per Ubuntu)
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" == "ubuntu" ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
        if ! command -v google-chrome &> /dev/null && ! command -v google-chrome-stable &> /dev/null; then
            echo -e "${YELLOW}⚠️  Chrome non trovato. Esegui ./setup-linux.sh per installare le dipendenze.${NC}"
            read -p "Vuoi eseguire il setup automatico? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                chmod +x setup-linux.sh
                sudo ./setup-linux.sh
            else
                echo -e "${RED}❌ Setup cancellato.${NC}"
                exit 1
            fi
        fi
    fi
fi

# Check file .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  File .env non trovato. Creazione da template...${NC}"
    cat > .env << EOF
MONGODB_URI=mongodb://admin:changeme@mongodb:27017/webapp?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme
NODE_ENV=production
FLASK_ENV=production
PORT=5000
EOF
    echo -e "${GREEN}✓ File .env creato. MODIFICA LE PASSWORD prima del deploy!${NC}"
    read -p "Premi ENTER per continuare o CTRL+C per modificare .env..."
fi

echo ""
echo "📋 Configurazione:"
echo "  - Nginx:        porta 8082"
echo "  - Scraper API:  porta 5001 (Flask + Selenium + Chrome)"
echo "  - Server API:   porta 5000 (Node.js)"
echo "  - MongoDB:      porta 27022"
echo "  - Mongo Express: porta 8088"
echo ""

# Ferma e rimuove i container esistenti
echo -e "${YELLOW}⏸️  Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Rimuove le immagini vecchie per forzare la rebuild
echo -e "${YELLOW}🗑️  Removing old images...${NC}"
docker rmi webapp_nginx_prod webapp_server_prod webapp_react_builder webapp-test_scraper -f 2>/dev/null || true

# Build delle immagini
echo ""
echo -e "${YELLOW}🔨 Building images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Avvia i container
echo ""
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Attendi che i servizi siano pronti
echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Mostra lo stato dei container
echo ""
echo -e "${GREEN}📊 Container status:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Verifica health
echo ""
echo -e "${YELLOW}🏥 Health checks:${NC}"

# Check Nginx
if curl -sf http://localhost:8082/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nginx: OK${NC}"
else
    echo -e "${RED}✗ Nginx: FAIL${NC}"
fi

# Check Scraper
if curl -sf http://localhost:5001/api/odds/status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Scraper API: OK${NC}"
else
    echo -e "${YELLOW}⚠️  Scraper API: Not responding (potrebbe essere in avvio)${NC}"
fi

# Mostra logs
echo ""
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ WebApp Production Deployment Completed!${NC}"
echo "=========================================="
echo ""
echo "🌐 URLs:"
echo "  - Frontend:     http://localhost:8082"
echo "  - API Node.js:  http://localhost:8082/api"
echo "  - API Scraper:  http://localhost:8082/api/odds"
echo "  - Mongo Express: http://localhost:8088"
echo ""
echo "📊 Useful commands:"
echo "  - Logs:         docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stats:        docker stats"
echo "  - Scraper logs: docker logs webapp_scraper -f"
echo "  - Stop:         docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🧪 Test scraper:"
echo "  curl http://localhost:8082/api/odds/fantasy-betfair"
echo ""
