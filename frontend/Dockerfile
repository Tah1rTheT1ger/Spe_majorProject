# Simple production build Dockerfile (serves static build via nginx)
from node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# optional: copy a custom nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
