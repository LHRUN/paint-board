FROM node:16-alpine as build-stage
LABEL maintainer="Leo 'song.lhlh@gmail.com'"

WORKDIR /app
COPY . ./

RUN echo "https://registry.npmmirror.com" > .npmrc && \
    npm install -g pnpm && \
    pnpm install --frozen-lockfile && \
    pnpm build

FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html/dist
COPY --from=build-stage /app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
