# 🐳 WebApp-Test Docker Configuration

## Panoramica delle Porte

### Porte Utilizzate
- **8082:80** - Nginx (per talkchain.xyz)
- **5001:5001** - **[NEW]** Scraper Flask + Selenium + Chrome
- **5007:5000** - Server Node.js (development)
- **3007:3000** - Client React (development)
- **27022:27017** - MongoDB
- **8088:8081** - Mongo Express (gestione DB)

### Porte Evitate (già in uso)
- 8080: echoplaylist.it
- 8081: fastaffiliation.com
- 8084: degi.talkchain.xyz
- 8085: haccp.talkchain.xyz
- 8087: cassaforte.talkchain.xyz
- 3004: comparatore.talkchain.xyz
- 3008: bonuscanner.com
- 3009: curve.talkchain.xyz

## Configurazione

### Development
```bash
# Avvia tutti i servizi in modalità development
docker-compose up --build

# Avvia in background
docker-compose up --build -d
```

### Production
```bash
# Avvia in modalità produzione
docker-compose -f docker-compose.prod.yml up --build -d

# Oppure usa gli script di deploy
# Windows PowerShell:
./deploy-prod.ps1

# Linux/macOS:
./deploy-prod.sh
```

## Servizi

### Development (docker-compose.yml)
- **nginx**: Reverse proxy e server di file statici
- **scraper**: **[NEW]** Flask API + Selenium + Chrome headless per oddsmatcher
- **webapp_server**: Server Node.js con hot reload
- **webapp_client**: Client React in modalità development
- **mongodb**: Database MongoDB
- **mongo-express**: Interfaccia web per MongoDB

### Production (docker-compose.prod.yml)
- **nginx**: Serve file statici buildati + reverse proxy per API
- **scraper**: **[NEW]** Flask API con resource limits (2 CPU, 4GB RAM, 2GB shared memory)
- **webapp_server**: Server Node.js ottimizzato per produzione
- **react_builder**: Build della React app (container temporaneo)
- **mongodb**: Database MongoDB per produzione

## Accesso ai Servizi

### Development
- **Applicazione**: http://localhost:8082
- **API Node.js**: http://localhost:5007/api
- **API Scraper**: http://localhost:5001/api/odds
- **Client React**: http://localhost:3007
- **Mongo Express**: http://localhost:8088

### Production (via Nginx)
- **Applicazione**: http://localhost:8082
- **API Node.js**: http://localhost:8082/api (timeout: 60s)
- **API Scraper**: http://localhost:8082/api/odds (timeout: 900s)
- **Health Check**: http://localhost:8082/health

## File di Configurazione

- **nginx.conf**: Configurazione Nginx per development
- **nginx.prod.conf**: Configurazione Nginx per produzione con security headers
- **.env**: Variabili ambiente per development
- **.env.prod**: Variabili ambiente per produzione

## Variabili Ambiente Richieste

```env
MONGODB_URI=mongodb://webapp_mongodb:27017/webapp
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
NODE_ENV=development|production
```

## Note di Sicurezza

La configurazione di produzione include:
- Rate limiting per le API (burst=20 per Node.js, burst=5 per scraper)
- Security headers
- Gzip compression
- Health checks
- User non-root nei container
- File sensibili nascosti

## 🆕 Scraper Service

### Caratteristiche
- **Flask 3.0.0** + **Selenium 4.15.2** + **Chrome headless**
- **Dual OS Support**: Funziona su Windows e Ubuntu Server
- **Anti-Detection**: User agent override, stealth options
- **Gestione Popup**: Cookies e promo popup automatizzati
- **Pagination**: Gestisce paginazione Betflag con click incrementali

### Endpoints
```bash
# Test scraping
curl http://localhost:5001/api/odds/fantasy-betfair

# Con parametri
curl "http://localhost:5001/api/odds/fantasy-betfair?headless=true"
```

### Troubleshooting Scraper

#### Chrome crashia nel container
```bash
# Verifica shared memory
docker exec -it webapp_scraper df -h | grep shm
# Deve mostrare almeno 2GB

# Se serve aumentare in docker-compose.yml:
scraper:
  shm_size: 4gb
```

#### Timeout durante scraping
```bash
# Nginx già configurato con 900s (15 min)
# Se serve più tempo, modifica nginx.prod.conf:
proxy_read_timeout 1800s;  # 30 minuti
```

#### Verificare ChromeDriver
```bash
docker exec -it webapp_scraper /usr/bin/google-chrome --version
docker exec -it webapp_scraper chromedriver --version
```

#### Logs dettagliati
```bash
# Scraper logs
docker logs webapp_scraper -f

# Nginx logs
docker logs webapp_nginx -f
```

### Resource Monitoring
```bash
# Stats live
docker stats webapp_scraper

# Memory usage
docker exec -it webapp_scraper free -h
```

## Comandi Utili

### Rebuild Scraper
```bash
# Development
docker-compose up -d --build scraper

# Production
docker-compose -f docker-compose.prod.yml up -d --build scraper
```

### Accedi al Container
```bash
docker exec -it webapp_scraper /bin/bash
```

### Clean Build
```bash
# Stop e rimuovi
docker-compose down

# Rimuovi immagini
docker rmi webapp-test_scraper

# Rebuild
docker-compose build --no-cache scraper
docker-compose up -d
```
