# PowerShell script per deploy in produzione
Write-Host "Starting WebApp production deployment..." -ForegroundColor Green

# Ferma e rimuove i container esistenti
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Rimuove le immagini vecchie per forzare la rebuild
Write-Host "Removing old images..." -ForegroundColor Yellow
docker rmi webapp_nginx_prod webapp_server_prod webapp_react_builder -f

# Build e avvia i nuovi container
Write-Host "Building and starting new containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up --build -d

# Mostra lo stato dei container
Write-Host "Container status:" -ForegroundColor Green
docker-compose -f docker-compose.prod.yml ps

Write-Host "WebApp production deployment completed!" -ForegroundColor Green
Write-Host "Application available at: http://localhost:8082" -ForegroundColor Cyan
