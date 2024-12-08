FROM node:16

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di configurazione di npm
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Cambia i permessi su node_modules e .cache solo dopo l'installazione
RUN mkdir -p /app/node_modules/.cache && chown -R node:node /app/node_modules /app/node_modules/.cache

# Copia il resto del progetto
COPY . .

# Esponi la porta
EXPOSE 3000

# Comando di avvio
CMD ["npm", "start"]
