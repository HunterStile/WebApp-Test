# PowerShell script per deploy in produzione con Scraper Service
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 WebApp Production Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker non trovato. Installalo prima di procedere." -ForegroundColor Red
    exit 1
}

if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose non trovato. Installalo prima di procedere." -ForegroundColor Red
    exit 1
}

# Check file .env
if (!(Test-Path .env)) {
    Write-Host "⚠️  File .env non trovato. Creazione da template..." -ForegroundColor Yellow
    @"
MONGODB_URI=mongodb://admin:changeme@mongodb:27017/webapp?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme
NODE_ENV=production
FLASK_ENV=production
PORT=5000
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host "✓ File .env creato. MODIFICA LE PASSWORD prima del deploy!" -ForegroundColor Green
    Read-Host "Premi ENTER per continuare o CTRL+C per modificare .env"
}

Write-Host ""
Write-Host "📋 Configurazione:" -ForegroundColor Yellow
Write-Host "  - Nginx:         porta 8089 (8088 già occupata)"
Write-Host "  - Scraper API:   porta 5010 (5000-5007 occupate)"
Write-Host "  - Server API:    porta 5011 (interno)"
Write-Host "  - Client React:  porta 3010 (3000-3009 occupate)"
Write-Host "  - MongoDB:       porta 27022"
Write-Host "  - Mongo Express: porta 8090 (8088 già occupata)"
Write-Host ""

# Ferma e rimuove i container esistenti
Write-Host "⏸️  Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Rimuove le immagini vecchie per forzare la rebuild
Write-Host "🗑️  Removing old images..." -ForegroundColor Yellow
docker rmi webapp_nginx_prod, webapp_server_prod, webapp_react_builder, webapp-test_scraper -f 2>$null

# Build delle immagini
Write-Host ""
Write-Host "🔨 Building images..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

# Avvia i container
Write-Host ""
Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Attendi che i servizi siano pronti
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Mostra lo stato dei container
Write-Host ""
Write-Host "📊 Container status:" -ForegroundColor Green
docker-compose -f docker-compose.prod.yml ps

# Verifica health
Write-Host ""
Write-Host "🏥 Health checks:" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8089/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✓ Nginx: OK" -ForegroundColor Green
} catch {
    Write-Host "✗ Nginx: FAIL" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5010/api/odds/status" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✓ Scraper API: OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Scraper API: Not responding (potrebbe essere in avvio)" -ForegroundColor Yellow
}

# Mostra logs
Write-Host ""
Write-Host "📝 Recent logs:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail=20

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ WebApp Production Deployment Completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Yellow
Write-Host "  - Frontend:      http://localhost:8089"
Write-Host "  - API Node.js:   http://localhost:8089/api"
Write-Host "  - API Scraper:   http://localhost:8089/api/odds"
Write-Host "  - Scraper diretto: http://localhost:5010"
Write-Host "  - Mongo Express: http://localhost:8090"
Write-Host ""
Write-Host "📊 Useful commands:" -ForegroundColor Yellow
Write-Host "  - Logs:          docker-compose -f docker-compose.prod.yml logs -f"
Write-Host "  - Stats:         docker stats"
Write-Host "  - Scraper logs:  docker logs webapp_scraper -f"
Write-Host "  - Stop:          docker-compose -f docker-compose.prod.yml down"
Write-Host ""
Write-Host "🧪 Test scraper:" -ForegroundColor Yellow
Write-Host "  Invoke-WebRequest -Uri http://localhost:8089/api/odds/fantasy-betfair"
Write-Host ""
