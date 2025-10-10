# 🐛 Fix Summary - Docker Production

## Problemi Identificati dai Logs:

### 1. ✅ ChromeDriver Path (RISOLTO)
**Errore**: `'chromedriver.exe' executable may have wrong permissions`
**Causa**: Cercava `chromedriver.exe` (Windows) invece di `/usr/local/bin/chromedriver` (Docker Linux)
**Fix**: Aggiunto fallback a `/usr/local/bin/chromedriver` in `scraper.py`

### 2. ⚠️ MongoDB Connection
**Errore**: `getaddrinfo EAI_AGAIN webapp_mongodb`
**Causa**: Node.js server cerca `webapp_mongodb` ma il container si chiama `webapp_mongodb_prod`
**Status**: Da verificare nel codice server

### 3. ⚠️ API Routes 404
```
GET /api/odds/sports HTTP/1.1" 404
GET /api/odds/upcoming-odds?sportKey=soccer HTTP/1.1" 404
GET /api/odds/major-leagues HTTP/1.1" 404
GET /api/odds/fantasy-betfair/status HTTP/1.1" 404
```
**Causa**: Questi endpoint non esistono nell'API Flask
**Status**: Da implementare o rimuovere le chiamate dal frontend

### 4. ✅ MongoDB Warning (Non critico)
**Warning**: `MongoDB 5.0+ requires a CPU with AVX support`
**Status**: Usando Mongo 4.4, funziona comunque

## Fix Applicati:

### scraper.py
```python
# Aggiunto fallback a /usr/local/bin/chromedriver
chromedriver_system = '/usr/local/bin/chromedriver'  # Docker installation path

if os.path.exists(chromedriver_path_win):
    # Windows locale
elif os.path.exists(chromedriver_path_linux):
    # Linux locale  
elif os.path.exists(chromedriver_system):
    # Docker system path ✅ NUOVO
    service = Service(chromedriver_system)
```

### test-docker.sh (nuovo)
Script di diagnostica per verificare:
- Container in esecuzione
- ChromeDriver installato
- Chrome version
- Connettività MongoDB
- File .env
- Endpoint API

## Prossimi Step:

### 1. Push modifiche
```bash
git add scraper/scraper.py scraper/Dockerfile client/src/App.js test-docker.sh
git commit -m "Fix: ChromeDriver path detection for Docker + diagnostics script"
git push origin advanced
```

### 2. Pull sul server e rebuild
```bash
cd ~/app/WebApp-Test
git pull origin advanced

# Rebuild solo scraper
sudo docker-compose -f docker-compose.prod.yml up -d --build scraper

# Oppure full rebuild
sudo ./deploy-prod.sh
```

### 3. Test diagnostico
```bash
chmod +x test-docker.sh
./test-docker.sh
```

### 4. Verifica logs
```bash
# Scraper logs
sudo docker logs webapp_scraper_prod -f

# Dovrebbe vedere:
# ✅ Usando ChromeDriver di sistema (Docker): /usr/local/bin/chromedriver
# invece di:
# ❌ Error: 'chromedriver.exe' executable may have wrong permissions
```

## Note:

- **Scraper**: Ora dovrebbe trovare ChromeDriver in `/usr/local/bin/`
- **MongoDB**: Server deve usare `webapp_mongodb_prod` invece di `webapp_mongodb`
- **Frontend**: Sta chiamando endpoint che non esistono (`/api/odds/sports`, etc.)
- **Porte**: Configurate correttamente (8089, 5010, 3010, 27022, 8090)

## Se il rebuild fallisce ancora:

```bash
# Check ChromeDriver nel container
sudo docker exec webapp_scraper_prod ls -la /usr/local/bin/chromedriver
sudo docker exec webapp_scraper_prod chromedriver --version

# Se manca, rebuild forzato
sudo docker-compose -f docker-compose.prod.yml down
sudo docker rmi webapp-test_scraper
sudo docker-compose -f docker-compose.prod.yml build --no-cache scraper
sudo docker-compose -f docker-compose.prod.yml up -d
```
