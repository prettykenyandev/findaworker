# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Node gateway + built frontend
FROM node:20-alpine

WORKDIR /app

COPY backend-node/package.json backend-node/package-lock.json* ./
RUN npm install --omit=dev

COPY backend-node/ .
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 3001

CMD ["node", "src/index.js"]
