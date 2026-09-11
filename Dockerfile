# Multi-stage build for the NestJS API.
# Stage 1: install deps + build. Stage 2: slim runtime image.

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
# postinstall runs `prisma generate`; needs the schema (copied above).
RUN npm ci
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm ci --omit=dev
# Bring compiled output + the generated Prisma client from the build stage.
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
EXPOSE 3000
# Apply pending migrations, then start (prod uses `migrate deploy`, never `dev`).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
