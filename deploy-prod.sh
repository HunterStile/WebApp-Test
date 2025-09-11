#!/bin/bash
# Bash script per deploy in produzione

echo "Starting WebApp production deployment..."

# Ferma e rimuove i container esistenti
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Rimuove le immagini vecchie per forzare la rebuild
echo "Removing old images..."
docker rmi webapp_nginx_prod webapp_server_prod webapp_react_builder -f

# Build e avvia i nuovi container
echo "Building and starting new containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Mostra lo stato dei container
echo "Container status:"
docker-compose -f docker-compose.prod.yml ps

echo "WebApp production deployment completed!"
echo "Application available at: http://localhost:8088"
