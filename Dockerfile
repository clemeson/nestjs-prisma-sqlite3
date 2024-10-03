# Usar uma imagem do Node.js como base
FROM node:18-alpine

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Instalar o PM2 globalmente
RUN npm install -g pm2

# Copiar a pasta prisma (onde o schema.prisma está localizado)
COPY prisma ./prisma

# Gerar os binários do Prisma dentro do container
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copiar o restante da aplicação para o container
COPY . .

# Compilar a aplicação NestJS
RUN npm run build

# Expor a porta 3000 (onde a aplicação NestJS rodará)
EXPOSE 3000

# Comando para rodar a aplicação usando PM2
CMD ["pm2-runtime", "start", "dist/main.js"]


