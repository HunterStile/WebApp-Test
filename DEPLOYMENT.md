# 🐧 Deployment su Ubuntu Server

## Requisiti
- Ubuntu Server 20.04+ / 22.04+
- Accesso sudo
- Almeno 2GB RAM
- Connessione internet

## Setup Rapido

```bash
# 1. Clona il repository
git clone https://github.com/HunterStile/WebApp-Test.git
cd WebApp-Test

# 2. Rendi eseguibile lo script di setup
chmod +x setup-linux.sh

# 3. Esegui lo script di setup
./setup-linux.sh

# 4. Verifica installazione Chrome
google-chrome --version
./scraper/chromedriver --version
```

## Avvio Manuale

### Terminale 1 - Flask API (porta 5001)
```bash
cd scraper
python3 api.py
```

### Terminale 2 - Node.js Server (porta 5000)
```bash
npm start
```

### Terminale 3 - React Frontend (porta 3000) - OPZIONALE
```bash
cd client
npm start
```

## Produzione con PM2

PM2 è un process manager per Node.js che mantiene le app attive.

```bash
# Installa PM2 globalmente
sudo npm install -g pm2

# Avvia Flask API
pm2 start scraper/api.py --interpreter python3 --name flask-api

# Avvia Node.js server
pm2 start npm --name nodejs-server -- start

# Mostra processi attivi
pm2 list

# Mostra logs
pm2 logs

# Riavvia tutti i processi
pm2 restart all

# Salva configurazione per auto-start
pm2 save
pm2 startup
```

## Build React per Produzione

Se vuoi servire React da Node.js senza un server separato:

```bash
cd client
npm run build
# I file compilati saranno in client/build/
```

Poi copia i file nella cartella `public/` del progetto principale.

## Nginx come Reverse Proxy (Opzionale)

```bash
sudo apt install nginx

# Crea configurazione
sudo nano /etc/nginx/sites-available/webapp-test

# Contenuto:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;  # React
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:5000;  # Node.js
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Abilita configurazione
sudo ln -s /etc/nginx/sites-available/webapp-test /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Troubleshooting Linux

### Chrome non si avvia in headless
Aggiungi queste opzioni nel codice:
```python
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-setuid-sandbox')
```

### Errore "Display not found"
```bash
# Installa display virtuale
sudo apt install xvfb
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99
```

### Permessi ChromeDriver
```bash
chmod +x scraper/chromedriver
```

### Errore dipendenze Chrome
```bash
sudo apt install -y libxss1 libappindicator1 libindicator7
sudo apt install -y fonts-liberation libasound2 libnspr4 libnss3 lsb-release xdg-utils
```

## Monitoraggio

```bash
# Logs PM2
pm2 logs flask-api
pm2 logs nodejs-server

# Memoria e CPU
pm2 monit

# Status
pm2 status
```

## Backup e Update

```bash
# Backup dati
tar -czf backup-$(date +%Y%m%d).tar.gz .

# Update codice
git pull origin main
npm install
cd client && npm install && cd ..
pm2 restart all
```

## Sicurezza

- Usa firewall per bloccare porte non necessarie
- Abilita SSL con Let's Encrypt
- Usa variabili d'ambiente per credenziali
- Limita accesso SSH

```bash
# Firewall base
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```
