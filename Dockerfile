FROM node:20-alpine3.20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production --base-href /app/

FROM nginx:1.27.4-alpine-slim

COPY --from=build /app/dist/bacs-frontend/browser /usr/share/nginx/html/app
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
