<div align="center">
  <img width="240" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>
<h4 align="center">
  一款开源的 Web 端创意画板
</h4>

<div align="center">
  <a href="https://github.com/LHRUN/paint-board/stargazers"><img src="https://img.shields.io/github/stars/LHRUN/paint-board" alt="Stars Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board"><img src="https://img.shields.io/github/forks/LHRUN/paint-board" alt="Forks Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board/blob/master/LICENSE"><img src="https://img.shields.io/github/license/LHRUN/paint-board" alt="License Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board"><img src="https://img.shields.io/badge/Made%20with-React%20%26%20Vite-pink" alt="Next&Prisma" /></a>
  <a href="https://github.com/LHRUN/paint-board/releases"><img alt="release" src="https://img.shields.io/github/package-json/v/LHRUN/paint-board" /></a>
</div>

<br>

<p align="center">
  <strong>中文(简体)</strong> / 
  <a href="../README.md">English</a> / 
  <a href="./README.zh_tw.md">中文(繁体)</a> / 
  <a href="./README.ja.md">日本語</a> / 
  <a href="./README.ko.md">한국어</a>
</p>


## 预览
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

<div align="center" style="width: 100%;">
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="preview"/>
</div>

## 功能简介
+ 绘画模式
  - 自由绘画: 提供了 12 种不同风格的画笔，包括基本画笔，彩虹画笔，多形状画笔，多素材画笔，像素画笔，多色画笔，文字画笔，多线连接画笔，网状画笔，多点连接画笔，波浪曲线画笔，荆棘画笔。以满足多样化的绘画需求。
  - 图形绘画: 支持绘制丰富的图形，包括内置图形与 Lucide 图标库图形，只需点击添加即可使用。可配置线条宽度、线条样式、填充颜色与填充样式。
+ 橡皮擦模式: 可线性擦除所有内容，并支持线性宽度配置。
+ 选择模式: 支持点击或框选内容进行编辑, 选中后可通过手柄进行 拖拽、缩放、旋转 操作和多种自定义配置。
+ 画板模式: 支持画板背景, 自定义尺寸和全局绘画配置。
+ 操作栏: 从左到右的功能分别为撤销、反撤销、复制当前选择内容、删除当前选择内容、绘制文字、上传图片、清除绘制内容、保存为图片、打开文件列表。
+ 多文件配置: 支持多个画布切换，每个画布可自定义标题、增加、删除，并提供排序和上传下载功能。
+ 国际化: 支持中文(简体), 中文(繁体), English, 日本語, 한국어。

## V1.3.0 视频演示

<a href="https://www.bilibili.com/video/BV1dJ4m1h7vg">
  <img width="500" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/v1.3.0_demo_bilibili.png"/>
</a>

## 本地启动
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

### Docker 支持

1. 构建 Docker 镜像，镜像名称为 `paint-board`。
```sh
docker build -t paint-board .
```

2. 启动 docker 容器。
```sh
docker run -d -p 8080:80 --name paint-board paint-board
```

3. 在浏览器打开 `http://localhost:8080/paint-board/` 即可访问。

## 浏览器支持

建议使用最新版谷歌浏览器, 以下是最低版本支持

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :--: | :--: | :--: | :--: |
| 80+ | 80+ | 70+ | 16.4+ |

保存图片在 Safari 16.4 及以上使用 OffscreenCanvas，更旧的 Safari 会改用 canvas.toBlob。

## 联系我

如果你有任何建议或者有好的想法，欢迎随时与我联系！

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ Twiter: https://twitter.com/Song_LongHao
+ 微信:
<img style="width: 300px" src="https://github.com/user-attachments/assets/719265e1-dbfa-4760-9482-aa0823b72df8" alt="wechat"/>


## 贡献

我很高兴你有兴趣对 PAINT BOARD 做出贡献。如果你发现了 BUG 并希望进行修复，请先在 Issue 中提出。对于新功能的增加，请先在 Discussions 中与我们进行沟通，或者直接通过以上提供的联系方式联系，进行贡献前请阅读以下贡献指南。感谢你的支持！

[贡献指南](./CONTRIBUTING.md)

## 技术文章
+ Fabric.js 重构后
  - [画板探秘系列：结合 Transformers.js 实现图像智能处理](https://songlh.top/2024/11/23/%E7%94%BB%E6%9D%BF%E6%8E%A2%E7%A7%98%E7%B3%BB%E5%88%97%EF%BC%9A%E7%BB%93%E5%90%88%20Transformers.js%20%E5%AE%9E%E7%8E%B0%E5%9B%BE%E5%83%8F%E6%99%BA%E8%83%BD%E5%A4%84%E7%90%86/)
  - [画板探秘系列：画板中的时光倒流术](https://songlh.top/2024/01/09/%E7%94%BB%E6%9D%BF%E6%8E%A2%E7%A7%98%E7%B3%BB%E5%88%97%EF%BC%9A%E7%94%BB%E6%9D%BF%E4%B8%AD%E7%9A%84%E6%97%B6%E5%85%89%E5%80%92%E6%B5%81%E6%9C%AF/)
  - [画板探秘系列：创意画笔第一期](https://songlh.top/2024/04/11/%E7%94%BB%E6%9D%BF%E6%8E%A2%E7%A7%98%E7%B3%BB%E5%88%97%EF%BC%9A%E5%88%9B%E6%84%8F%E7%94%BB%E7%AC%94%E7%AC%AC%E4%B8%80%E6%9C%9F/)
  - [画板探秘系列：创意画笔第二期](https://songlh.top/2024/04/12/%E7%94%BB%E6%9D%BF%E6%8E%A2%E7%A7%98%E7%B3%BB%E5%88%97%EF%BC%9A%E5%88%9B%E6%84%8F%E7%94%BB%E7%AC%94%E7%AC%AC%E4%BA%8C%E6%9C%9F/)
  - [画板探秘系列：创意画笔第三期](https://songlh.top/2024/04/13/%E7%94%BB%E6%9D%BF%E6%8E%A2%E7%A7%98%E7%B3%BB%E5%88%97%EF%BC%9A%E5%88%9B%E6%84%8F%E7%94%BB%E7%AC%94%E7%AC%AC%E4%B8%89%E6%9C%9F/)
  - 编写中...
+ Fabric.js 重构前
  - [基于canvas实现的多功能画板](https://songlh.top/2022/09/21/%E5%9F%BA%E4%BA%8Ecanvas%E5%AE%9E%E7%8E%B0%E7%9A%84%E5%A4%9A%E5%8A%9F%E8%83%BD%E7%94%BB%E6%9D%BF/)
  - [canvas画板之绘画元素的框选](https://songlh.top/2022/12/05/canvas%E7%94%BB%E6%9D%BF%E4%B9%8B%E7%BB%98%E7%94%BB%E5%85%83%E7%B4%A0%E7%9A%84%E6%A1%86%E9%80%89/)
  - [canvas画板之画笔的多种效果](https://songlh.top/2022/12/17/canvas%E7%94%BB%E6%9D%BF%E4%B9%8B%E7%94%BB%E7%AC%94%E7%9A%84%E5%A4%9A%E7%A7%8D%E6%95%88%E6%9E%9C/)

## License

MIT License. See the [LICENSE](https://github.com/LHRUN/paint-board/blob/main/LICENSE) file.
