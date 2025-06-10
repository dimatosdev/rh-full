FROM node:16-alpine

WORKDIR /usr/src/app/react

# Copiar package.json se existir
COPY package*.json ./

# Instalar dependências básicas
RUN npm install node-sass && npm install

# Expor porta
EXPOSE 3000

# Comando padrão
CMD ["npm", "start"]
