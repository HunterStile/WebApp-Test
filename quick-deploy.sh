#!/bin/bash
# Quick deploy script - riavvia solo i container modificati

echo "🚀 Quick Deploy - Restart Modified Containers"
echo ""

# Stop containers
echo "⏸️  Stopping containers..."
sudo docker-compose -f docker-compose.prod.yml stop nginx scraper webapp_server

# Rebuild solo scraper (ha codice modificato)
echo "🔨 Rebuilding scraper..."
sudo docker-compose -f docker-compose.prod.yml build --no-cache scraper

# Restart all
echo "🚀 Restarting containers..."
sudo docker-compose -f docker-compose.prod.yml up -d

# Wait
sleep 3

# Status
echo ""
echo "📊 Container status:"
sudo docker-compose -f docker-compose.prod.yml ps

# Test
echo ""
echo "🧪 Testing endpoints..."
echo ""
echo "1. Node.js API (sports):"
curl -s http://localhost:8089/api/odds/sports | head -c 100
echo "..."
echo ""
echo "2. Flask Scraper (status):"
curl -s http://localhost:8089/api/odds/status
echo ""
echo ""
echo "3. Scraper logs (last 10):"
sudo docker logs webapp_scraper_prod --tail=10

echo ""
echo "✅ Deploy completed!"
echo "Watch logs: sudo docker logs webapp_scraper_prod -f"
