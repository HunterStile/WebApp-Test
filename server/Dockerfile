FROM node:16

# Crea un utente non-root
RUN groupadd -r nodegroup && useradd -r -g nodegroup -m nodeuser

WORKDIR /app

# Copia i file del progetto e installa le dipendenze come utente non-root
COPY package*.json ./
RUN npm install

COPY . .

# Cambia i permessi delle directory per l'utente non-root
RUN mkdir -p /app/server/uploads/profile-images
RUN chown -R nodeuser:nodegroup /app
RUN chmod -R 777 /app/server/uploads

USER nodeuser

WORKDIR /app/server

EXPOSE 5000

CMD ["npm", "start"]