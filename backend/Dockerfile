# --- Backend: Node/Express API ---
FROM node:20-alpine

WORKDIR /app

# Install deps first so this layer is cached unless package.json changes
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

# The uploads folder must be writable at runtime and persist via a volume
RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "server.js"]