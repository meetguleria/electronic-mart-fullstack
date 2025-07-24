FROM node:18-alpine AS build
ARG VITE_BASE_URL
ENV VITE_BASE_URL=${VITE_BASE_URL}
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]