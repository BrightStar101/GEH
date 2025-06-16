# Stage 1: Build React frontend
FROM node:20 as build
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Stage 2: Setup backend with static frontend
FROM node:20
WORKDIR /app
COPY backend ./backend
COPY --from=build /app/frontend/dist ./backend/public
WORKDIR /app/backend
RUN npm install

ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
