#!/bin/bash
# Setup script for Ubuntu Server

echo "🚀 Setup WebApp-Test su Ubuntu Server"
echo "======================================"

# 1. Aggiorna sistema
echo "📦 Aggiornamento sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Installa dipendenze base
echo "📦 Installazione dipendenze base..."
sudo apt install -y wget unzip curl

# 3. Installa Node.js (v18+)
echo "📦 Installazione Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Installa Python 3 e pip
echo "📦 Installazione Python..."
sudo apt install -y python3 python3-pip python3-venv

# 5. Installa Chrome/Chromium
echo "📦 Installazione Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update
sudo apt install -y google-chrome-stable

# 6. Scarica ChromeDriver
echo "📦 Download ChromeDriver per Linux..."
cd scraper
CHROME_VERSION=$(google-chrome --version | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)
echo "Versione Chrome: $CHROME_VERSION"

# Download ChromeDriver matching (usa versione 131 se disponibile)
wget -q https://storage.googleapis.com/chrome-for-testing-public/131.0.6778.69/linux64/chromedriver-linux64.zip
unzip -q chromedriver-linux64.zip
mv chromedriver-linux64/chromedriver ./chromedriver
chmod +x chromedriver
rm -rf chromedriver-linux64 chromedriver-linux64.zip
echo "✅ ChromeDriver installato: $(pwd)/chromedriver"
cd ..

# 7. Installa dipendenze Python
echo "📦 Installazione dipendenze Python..."
cd scraper
pip3 install -r requirements.txt 2>/dev/null || pip3 install selenium flask flask-cors
cd ..

# 8. Installa dipendenze Node.js
echo "📦 Installazione dipendenze Node.js (server)..."
npm install

echo "📦 Installazione dipendenze React (client)..."
cd client
npm install
cd ..

# 9. Crea .env se non esiste
if [ ! -f .env ]; then
    echo "📝 Creazione file .env..."
    cat > .env << EOL
PORT=5000
FLASK_PORT=5001
NODE_ENV=production
EOL
fi

echo ""
echo "✅ Setup completato!"
echo ""
echo "Per avviare il sistema:"
echo "  1. Flask API:  cd scraper && python3 api.py"
echo "  2. Node.js:    npm start"
echo "  3. React:      cd client && npm start"
echo ""
echo "Oppure usa PM2 per produzione:"
echo "  npm install -g pm2"
echo "  pm2 start scraper/api.py --interpreter python3 --name flask-api"
echo "  pm2 start npm --name nodejs-server -- start"
