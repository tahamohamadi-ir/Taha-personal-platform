# taha-admin — independent build (ADR-0032 S2)
# Multi-stage: node build → nginx serving the SPA at /admin/.
FROM node:22-alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /build/dist /usr/share/nginx/html/admin
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/admin/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
