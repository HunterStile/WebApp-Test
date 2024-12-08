FROM node:16

RUN chown -R node:node /app/node_modules
RUN chown -R node:node /app/node_modules/.cache

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]