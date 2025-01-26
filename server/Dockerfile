FROM node:16

# Crea un utente non-root
RUN groupadd -r nodegroup && useradd -r -g nodegroup -m nodeuser

WORKDIR /app

# Create upload directories
RUN mkdir -p /app/server/uploads/profile-images
RUN chown -R nodeuser:nodegroup /app
RUN chmod -R 775 /app/server/uploads  # More permissive for testing

# Copia i file del progetto e installa le dipendenze come utente non-root
COPY package*.json ./
RUN npm install

COPY . .

# Cambia i permessi delle directory per l'utente non-root
RUN chown -R nodeuser:nodegroup /app

# Passa a questo utente per eseguire l'applicazione
USER nodeuser

WORKDIR /app/server

EXPOSE 5000

CMD ["npm", "start"]