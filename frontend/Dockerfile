# Dockerfile pour le Frontend (Node/Vite/React)
FROM node:20-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install -g pnpm && pnpm install

# Copier le reste du code
COPY . .

# Construire l'application
RUN pnpm run build

# Servir l'application avec un serveur léger (ex: serve)
# RUN pnpm install -g serve
# CMD ["serve", "-s", "dist", "-l", "3000"]

# Exposer le port
EXPOSE 3000

# Commande par défaut (pour le développement, peut être surchargée)
CMD ["pnpm", "run", "dev"]
