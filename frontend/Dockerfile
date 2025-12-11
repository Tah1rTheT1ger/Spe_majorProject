# Simple production build Dockerfile (serves static build via nginx)
FROM node:18-alpine as build
WORKDIR /app

# 1. Copy manifest files first (Stable layers)
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# 2. Copy source code and immediately run the build (Cache Busting)
#    Any change in the source code (like Register.jsx) will invalidate this layer,
#    forcing npm run build to run again.
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# 3. Copy the fresh build output
COPY --from=build /app/build /usr/share/nginx/html
# optional: copy a custom nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]