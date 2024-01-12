# node 构建
FROM node:16-alpine as build-stage
# 署名
MAINTAINER Adoin 'adoin@qq.com'
WORKDIR /app
COPY . ./
# 设置 node 阿里镜像
RUN npm config set registry https://registry.npmmirror.com
# 设置--max-old-space-size 防止可能的内存不足问题
ENV NODE_OPTIONS=--max-old-space-size=16384
# 设置阿里镜像、pnpm、依赖、编译
RUN npm install pnpm -g && \
    pnpm install --frozen-lockfile && \
    pnpm build
# node部分结束
RUN echo "🎉 编 🎉 译 🎉 成 🎉 功 🎉"
# nginx 部署
FROM nginx:1.23.3-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html/dist
COPY --from=build-stage /app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
## 将/usr/share/nginx/html/dist/assets/entry下所有index开头的js文件内部的$vg_base_url替换成$VG_BASE_URL,$vg_sub_domain 替换成VG_SUB_DOMAIN，$vg_default_user替换成VG_DEFAULT_USER，$vg_default_password替换成VG_DEFAULT_PASSWORD 而后启动nginx
CMD nginx -g 'daemon off;'
RUN echo "🎉 架 🎉 设 🎉 成 🎉 功 🎉"
