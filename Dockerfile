FROM node:22-alpine as build-stage
LABEL maintainer="Leo 'song.lhlh@gmail.com'"

WORKDIR /app
COPY . ./

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN echo "https://registry.npmmirror.com" > .npmrc && \
    corepack enable && \
    pnpm install --frozen-lockfile && \
    pnpm build

FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html/dist
COPY --from=build-stage /app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
