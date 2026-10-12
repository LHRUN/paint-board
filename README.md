<div align="center">
  <img width="240" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>

<h4 align="center">
  An open-source web-based creative canvas
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
  <strong>English</strong> / 
  <a href="./readmes/README.zh_cn.md">中文(简体)</a> / 
  <a href="./readmes/README.zh_tw.md">中文(繁体)</a> / 
  <a href="./readmes/README.ja.md">日本語</a> / 
  <a href="./readmes/README.ko.md">한국어</a>
</p>


## Preview
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

<div align="center" style="width: 100%;">
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="preview"/>
</div>

## Features
+ Drawing Mode
  - Free Drawing: Provides 12 different brush styles, including basic brush, rainbow brush, multi-shape brush, multi-material brush, pixel brush, multi-color brush, text brush, multi-line connection brush, mesh brush, multi-point connection brush, wave curve brush, and thorn brush to meet diverse drawing needs.
  - Shape Drawing: Supports drawing rich graphics, including built-in shapes and Lucide icon library graphics, which can be used with just a click. Configurable line width, line style, fill color, and fill style.
+ Eraser Mode: Can linearly erase all content and supports linear width configuration.
+ Selection Mode: Supports clicking or box selection for editing. After selection, you can perform drag, scale, rotate operations and various custom configurations through handles.
+ Canvas Mode: Supports canvas background, custom size, and global drawing configuration.
+ Action Bar: Functions from left to right are undo, redo, copy current selection, delete current selection, draw text, upload image, clear drawing content, save as image, and open file list.
+ Multi-file Configuration: Supports switching between multiple canvases, each canvas can have custom titles, add, delete, and provides sorting and upload/download functions.
+ i18n: 中文(简体), 中文(繁体), English, 日本語, 한국어.

## V1.3.0 Video Demo

<a href="https://www.bilibili.com/video/BV1dJ4m1h7vg">
  <img width="500" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/v1.3.0_demo_bilibili.png"/>
</a>

## Quick Start
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

### Docker Support

1. Build a Docker image with the name `paint-board`.
```sh
docker build -t paint-board .
```

2. Start a docker container.
```sh
docker run -d -p 8080:80 --name paint-board paint-board
```

3. Accessed by opening `http://localhost:8080/paint-board/` in your browser.

## Browser support

We recommend using the latest version of Google Chrome, the following is the minimum version support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :--: | :--: | :--: | :--: |
| 80+ | 80+ | 70+ | 16.4+ |

Saving an image uses OffscreenCanvas on Safari 16.4 and later, and falls back to canvas.toBlob on older Safari.

## Contact me

If you have any suggestions or good ideas, welcome to contact me at any time!

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ Twiter: https://twitter.com/Song_LongHao
+ WeChat:
<img style="width: 300px" src="https://github.com/user-attachments/assets/719265e1-dbfa-4760-9482-aa0823b72df8" alt="wechat"/>


## Contributing

I'm glad you're interested in contributing to PAINT BOARD. If you find a bug and want to fix it, please submit it in an Issue first. For new feature additions, please contact us in Discussions, or directly through the contact details provided above, and read the Contribution Guidelines below before contributing. Thank you for your support!

[Contribution Guidelines](./CONTRIBUTING.md)

## Document
+ After refactoring with Fabric.js
  - [Exploring the Canvas Series: combined with Transformers.js to achieve intelligent image processing](https://songlh.top/2024/11/23/Exploring-the-Canvas-Series-combined-with-Transformers-js-to-achieve-intelligent-image-processing/)
  - [Exploring the Canvas Series: The Art of Time Reversal in the Canvas](https://songlh.top/2024/01/10/Exploring-the-Canvas-Series-The-Art-of-Time-Reversal-in-the-Canvas/)
  - [Exploring the Canvas Series: Creative Brushes Part 1](https://songlh.top/2024/04/14/Exploring-the-Canvas-Series-Creative-Brushes-Part-1/)
  - [Exploring the Canvas Series: Creative Brushes Part 2](https://songlh.top/2024/04/15/Exploring-the-Canvas-Series-Creative-Brushes-Part-2/)
  - [Exploring the Canvas Series: Creative Brushes Part 3](https://songlh.top/2024/04/16/Exploring-the-Canvas-Series-Creative-Brushes-Part-3/)
  - writing...
+ Before refactoring with Fabric.js
  - [Canvas Artistry：Mastering Selection, Dragging, and Scaling](https://songlh.top/2023/11/30/Canvas-Artistry1)
  - [Canvas Artistry：Drawing magic with multiple effects](https://songlh.top/2023/12/01/Canvas-Artistry2)

## License

MIT License. See the [LICENSE](https://github.com/LHRUN/paint-board/blob/main/LICENSE) file.
