FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build client
COPY client/ ./client/
RUN npm run build --prefix client

# Copy server
COPY server.js data.json ./

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
