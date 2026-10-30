FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server.js wire.js engine.js GTA_Riviera.html ./
COPY assets/ ./assets/
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
