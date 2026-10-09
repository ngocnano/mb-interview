# Ảnh backend (IS-1, IS-6). Ngữ cảnh build là thư mục gốc dự án: docker build -f backend/Dockerfile .
# Cần bản Flutter Web đã build ở app/build/web (script deploy làm bước này).
FROM node:22-slim AS build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json backend/tsconfig.build.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY backend/package.json ./
COPY app/build/web ./web
ENV WEB_DIR=/app/web
# Chạy bằng người dùng không phải root (IS-6)
USER node
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
