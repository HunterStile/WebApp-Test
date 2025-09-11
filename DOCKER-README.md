# WebApp-Test Docker Configuration

## Panoramica delle Porte

### Porte Utilizzate
- **8082:80** - Nginx (per talkchain.xyz)
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
- **webapp_server**: Server Node.js con hot reload
- **webapp_client**: Client React in modalità development
- **mongodb**: Database MongoDB
- **mongo-express**: Interfaccia web per MongoDB

### Production (docker-compose.prod.yml)
- **nginx**: Serve file statici buildati + reverse proxy per API
- **webapp_server**: Server Node.js ottimizzato per produzione
- **react_builder**: Build della React app (container temporaneo)
- **mongodb**: Database MongoDB per produzione

## Accesso ai Servizi

### Development
- **Applicazione**: http://localhost:8082
- **API diretta**: http://localhost:5007/api
- **Client React**: http://localhost:3007
- **Mongo Express**: http://localhost:8088

### Production
- **Applicazione**: http://localhost:8082
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
- Rate limiting per le API
- Security headers
- Gzip compression
- Health checks
- User non-root nei container
- File sensibili nascosti
