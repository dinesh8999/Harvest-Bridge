# Multi-stage Dockerfile for Harvest Bridge
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN npm install

COPY frontend/ ./frontend/
COPY backend/ ./backend/

RUN npm run build

# Production Stage for Backend Express Server & Static Frontend
FROM node:20-alpine AS production

WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/backend/ ./backend/
COPY --from=build /app/frontend/dist/ ./frontend/dist/

RUN npm --prefix backend install --only=production

EXPOSE 3001

CMD ["node", "backend/index.js"]
