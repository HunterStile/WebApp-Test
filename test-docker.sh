#!/bin/bash
# Script di test rapido per verificare i container

echo "🔍 Verifica Container in esecuzione:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Verifica ChromeDriver nel container scraper:"
sudo docker exec webapp_scraper_prod which chromedriver || echo "❌ ChromeDriver non trovato"
sudo docker exec webapp_scraper_prod ls -la /usr/local/bin/chromedriver 2>/dev/null || echo "❌ /usr/local/bin/chromedriver non esiste"

echo ""
echo "🔍 Verifica Chrome nel container scraper:"
sudo docker exec webapp_scraper_prod google-chrome --version || echo "❌ Chrome non trovato"

echo ""
echo "🔍 Verifica connettività MongoDB dal server:"
sudo docker exec webapp_server_prod ping -c 2 webapp_mongodb_prod || echo "❌ MongoDB non raggiungibile"

echo ""
echo "🔍 Verifica file .env:"
if [ -f .env ]; then
    echo "✅ File .env esiste"
    echo "Contenuto (senza password):"
    grep -v "PASSWORD" .env | grep -v "^#"
else
    echo "❌ File .env NON ESISTE"
fi

echo ""
echo "🔍 Test endpoint scraper:"
curl -s http://localhost:5010/api/odds/status || echo "❌ Scraper non risponde"

echo ""
echo "🔍 Ultimi 20 log scraper:"
sudo docker logs webapp_scraper_prod --tail=20
