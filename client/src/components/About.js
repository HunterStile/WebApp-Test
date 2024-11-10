// client/src/components/About.js
import React from 'react';

function About() {
  return (
    <div>

      <h1>Guida Completa al Deployment di un'Applicazione Web con Docker</h1>

      <div className="section-nav">
        <h2>Indice</h2>
        <ul>
          <li><a href="#config-iniziale">1. Configurazione Iniziale dell'Ambiente</a></li>
          <li><a href="#docker-setup">2. Installazione e Configurazione di Docker</a></li>
          <li><a href="#project-setup">3. Setup del Progetto Docker</a></li>
          <li><a href="#nginx-ssl">4. Configurazione NGINX e SSL</a></li>
          <li><a href="#dns-config">5. Configurazione DNS Dinamico e Record DNS</a></li>
          <li><a href="#gestione">6. Gestione e Manutenzione</a></li>
        </ul>
      </div>

      <section id="config-iniziale">
        <h2>1. Configurazione Iniziale dell'Ambiente</h2>

        <h3>1.1. Accesso al Server</h3>
        <pre><code>{`# Installazione SSH server
sudo apt install openssh-server
sudo systemctl start ssh

# Accesso remoto (se necessario)
ssh -p 2222 username@localhost`}</code></pre>

        <h3>1.2. Configurazione Utente</h3>
        <pre><code>{`# Configurazione sudoers per evitare password continue
sudo nano /etc/sudoers
# Aggiungere la riga:
username ALL=(ALL) NOPASSWD: ALL`}</code></pre>

        <h3>1.3. Configurazione Firewall e Port Forwarding</h3>

        <h4>1.3.1. Configurazione UFW (Uncomplicated Firewall)</h4>
        <pre><code>{`# Installazione UFW se non presente
sudo apt install ufw

# Configurazione regole di base
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Apertura porte necessarie
sudo ufw allow ssh        # Porta 22 per SSH
sudo ufw allow 80        # HTTP
sudo ufw allow 443       # HTTPS

# Abilitazione del firewall
sudo ufw enable

# Verifica stato e regole
sudo ufw status verbose`}</code></pre>

        <h4>1.3.2. Configurazione Port Forwarding sul Router</h4>
        <p>1. Accedere all'interfaccia di amministrazione del router (solitamente http://192.168.1.1 o http://192.168.0.1)</p>
        <p>2. Trovare la sezione "Port Forwarding" o "Virtual Server"</p>
        <p>3. Configurare il port forwarding:</p>
        <ul>
          <li>Porta 80 (HTTP) → IP interno del server:80</li>
          <li>Porta 443 (HTTPS) → IP interno del server:443</li>
          <li>Porta 22 (SSH) → IP interno del server:22 (opzionale, solo se necessario accesso SSH esterno)</li>
        </ul>
        <p><strong>Nota:</strong> Se ti trovi su una virtual machine con rete NAT, applicare l'inoltro delle porte nelle impostazioni della virtual machine.</p>

        <h4>1.3.3. Best Practices di Sicurezza</h4>
        <pre><code>{`# Modifica della porta SSH default (opzionale ma consigliato)
sudo nano /etc/ssh/sshd_config
# Modificare la linea:
# Port 22
# in:
# Port 2222 (o altro numero)

# Riavvio servizio SSH
sudo systemctl restart ssh

# Aggiornamento regola UFW per la nuova porta SSH
sudo ufw delete allow 22/tcp
sudo ufw allow 2222/tcp

# Configurazione fail2ban per protezione SSH (opzionale)
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Riavvio fail2ban
sudo systemctl restart fail2ban`}</code></pre>

        <h3>1.4. Configurazione Rete (in caso di VM con NAT e onlyhost)</h3>
        <pre><code>{`# Configurazione interfacce di rete
sudo nano /etc/netplan/00-installer-config.yaml

# Contenuto configurazione di rete
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: yes
    enp0s8:
      dhcp4: no
      addresses: [192.168.56.10/24]
      optional: true

# Applicare la configurazione
sudo netplan apply`}</code></pre>
      </section>

      <section id="docker-setup">
        <h2>2. Installazione e Configurazione di Docker</h2>

        <h3>2.1. Installazione Docker</h3>
        <pre><code>{`# Aggiornamento sistema
sudo apt update

# Installazione prerequisiti
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Aggiunta chiave GPG Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Aggiunta repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installazione Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose`}</code></pre>

        <h3>2.2. Verifica Installazione</h3>
        <pre><code>{`sudo docker --version
sudo docker-compose --version`}</code></pre>
      </section>


      <section id="project-setup">
        <h2>3. Setup del Progetto Docker</h2>

        <h3>3.1. Struttura del Progetto</h3>
        <pre><code>{`project-root/
├── client/
│   ├── Dockerfile
│   └── ...
├── server/
│   ├── Dockerfile
│   └── ...
├── nginx/
│   └── conf.d/
│       └── default.conf
└── docker-compose.yml`}</code></pre>

        <h3>3.2. Dockerfile per Client (React)</h3>
        <pre><code>{`FROM node:16

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`}</code></pre>

        <h3>3.3. Dockerfile per Server (Node.js)</h3>
        <pre><code>{`FROM node:16

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
WORKDIR /app/server
EXPOSE 5000
CMD ["npm", "start"]`}</code></pre>

        <h3>3.4. Docker Compose</h3>
        <pre><code>{`version: '3.8'

services:
  nginx:
    container_name: nginx
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/lib/letsencrypt:/var/lib/letsencrypt:ro
    depends_on:
      - client
      - server
    networks:
      - app-network

  client:
    container_name: client
    build:
      context: ./client
      dockerfile: Dockerfile
    expose:
      - "3000"
    volumes:
      - ./client:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=/api
    networks:
      - app-network

  server:
    container_name: server
    build:
      context: .
      dockerfile: server/Dockerfile
    expose:
      - "5000"
    volumes:
      - ./:/app
      - /app/node_modules
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/WebApp-Test
      - PORT=5000
    networks:
      - app-network

  mongodb:
    container_name: mongodb
    image: mongo:latest
    expose:
      - "27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge`}</code></pre>
      </section>

      <section id="nginx-ssl">
        <h2>4. Configurazione NGINX e SSL</h2>

        <h3>4.1. Configurazione NGINX</h3>
        <pre><code>{`# /nginx/conf.d/default.conf
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://client:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://server:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}`}</code></pre>

        <h3>4.2. Configurazione SSL con Let's Encrypt</h3>
        <pre><code>{`# Installazione Certbot
sudo apt install certbot python3-certbot-nginx -y

# Arresto temporaneo dei container
docker-compose down

# Ottenimento certificato
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Riavvio dei container
docker-compose up -d

# Configurazione rinnovo automatico
sudo crontab -e
# Aggiungere:
0 12 * * * /usr/bin/certbot renew --quiet`}</code></pre>
      </section>

      <section id="dns-config">
        <h2>5. Configurazione DNS Dinamico e Record DNS</h2>

        <h3>5.1. Configurazione ddclient</h3>
        <pre><code>{`# Installazione ddclient
sudo apt-get install ddclient

# Configurazione ddclient
sudo nano /etc/ddclient.conf

# Inserire la seguente configurazione:
protocol=namecheap
use=web, web=dyndns
login=YOUR_USERNAME
password='YOUR_DYNAMIC_DNS_PASSWORD'
your_domain.xyz`}</code></pre>

        <h3>5.2. Gestione Record DNS su Namecheap</h3>
        <p>1. Accedere al pannello di controllo Namecheap</p>
        <p>2. Selezionare il dominio e andare alla sezione "Advanced DNS"</p>
        <p>3. Configurare i seguenti record:</p>

        <p><strong>A Records:</strong></p>
        <ul>
          <li>Host: @ <br />Value: IP_PUBBLICO_SERVER <br />TTL: Automatic</li>
          <li>Host: www <br />Value: IP_PUBBLICO_SERVER <br />TTL: Automatic</li>
        </ul>

        <p><strong>TXT Records (per SPF/Email):</strong></p>
        <ul>
          <li>Host: @ <br />Value: v=spf1 include:spf.efwd.registrar-servers.com ~all <br />TTL: Automatic</li>
        </ul>

        <h3>5.3. Avvio e Verifica ddclient</h3>
        <pre><code>{`# Avvio del servizio ddclient
sudo systemctl start ddclient

# Abilitazione all'avvio del sistema
sudo systemctl enable ddclient

# Verifica stato del servizio
sudo systemctl status ddclient

# Test manuale aggiornamento
sudo ddclient -force

# Visualizzazione log per debugging
sudo tail -f /var/log/syslog | grep ddclient`}</code></pre>

        <h3>5.4. Configurazione Dynamic DNS su Namecheap</h3>
        <p>1. Attivare Dynamic DNS nelle impostazioni del dominio</p>
        <p>2. Copiare il Dynamic DNS Password fornito da Namecheap</p>
        <p>3. Assicurarsi che il Dynamic DNS sia abilitato (Status: ON)</p>
        <p>4. Utilizzare il Client Software fornito o ddclient come configurato sopra</p>

        <h3>5.5. Verifica della Configurazione</h3>
        <pre><code>{`# Verifica DNS propagation
dig @8.8.8.8 your_domain.xyz

# Verifica record A
dig A your_domain.xyz

# Verifica SPF record
dig TXT your_domain.xyz

# Test connettività
ping your_domain.xyz`}</code></pre>

        <h3>5.6. Best Practices per DNS</h3>
        <p><strong>1. Backup Configurazione:</strong></p>
        <pre><code>{`# Backup file configurazione ddclient
sudo cp /etc/ddclient.conf /etc/ddclient.conf.backup`}</code></pre>

        <p><strong>2. Monitoraggio:</strong></p>
        <pre><code>{`# Creazione script di monitoring
echo '#!/bin/bash
if ! systemctl is-active --quiet ddclient; then
    systemctl restart ddclient
    echo "ddclient restarted at $(date)" >> /var/log/ddclient-monitor.log
fi' | sudo tee /usr/local/bin/check-ddclient.sh

# Rendere eseguibile lo script
sudo chmod +x /usr/local/bin/check-ddclient.sh

# Aggiungere al crontab
(crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/check-ddclient.sh") | crontab -`}</code></pre>

        <p><strong>3. Sicurezza:</strong></p>
        <ul>
          <li>Mantenere il password del Dynamic DNS sicuro</li>
          <li>Utilizzare TTL appropriati (più bassi per test, più alti in produzione)</li>
          <li>Considerare l'utilizzo di DNSSEC se supportato</li>
        </ul>
      </section>

      <section id="gestione">
        <h2>6. Gestione e Manutenzione</h2>

        <h3>6.1. Comandi Utili per la Gestione</h3>
        <pre><code>{`# Verifica stato dei container
docker-compose ps

# Visualizzazione log
docker-compose logs

# Accesso al database MongoDB
docker exec -it mongodb mongosh

# Backup database
docker exec mongodb mongodump --out /dump`}</code></pre>

        <h3>6.2. Gestione dello Spazio</h3>
        <pre><code>{`# Verifica spazio utilizzato
sudo docker system df

# Pulizia risorse non utilizzate
docker-compose down --volumes --remove-orphans
docker system prune -af
docker system prune -a --volumes
docker builder prune -a

# Rimozione immagini non utilizzate
docker rmi $(docker images -q)
docker volume prune`}</code></pre>

        <h3>6.3. Ricostruzione dell'Applicazione</h3>
        <pre><code>{`# Gestione permessi
sudo chown -R 1000:1000 "/root/.npm"
sudo chmod -R 777 .

# Ricostruzione e avvio
docker-compose up -d --build`}</code></pre>

        <h3>6.4. Monitoraggio Database</h3>
        <pre><code>{`# Accesso alla shell di MongoDB
docker exec -it mongodb mongosh

# Comandi utili MongoDB
show dbs
use nome_database
show collections
db.nome_collezione.find().pretty()`}</code></pre>
      </section>

      <div className="warning">
        <strong>Importante:</strong> Assicurati di mantenere al sicuro le credenziali e di non condividerle mai in repository pubblici.
      </div>

    </div>
  );
}

export default About;
