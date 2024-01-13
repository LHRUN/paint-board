<div align="center">
  <img width="180" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>

<h4 align="center">

  A fun art drawing board that supports multi-end operation

</h4>


<div align="center">
  <a href="https://github.com/LHRUN/paint-board/stargazers">
    <img src="https://img.shields.io/github/stars/LHRUN/paint-board" alt="Stars Badge"/>
  </a>
  <a href="https://github.com/LHRUN/paint-board">
    <img src="https://img.shields.io/github/forks/LHRUN/paint-board" alt="Forks Badge"/>
  </a>
  <a href="https://github.com/LHRUN/paint-board/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/LHRUN/paint-board" alt="License Badge"/>
  </a>
  <a href="https://github.com/LHRUN/paint-board">
    <img src="https://img.shields.io/badge/Made%20with-React%20%26%20Vite-pink" alt="Next&Prisma" />
  </a>
  <a href="https://github.com/LHRUN/paint-board/releases">
    <img alt="release" src="https://img.shields.io/github/package-json/v/LHRUN/paint-board" />
  </a>
</div>

**English** | [简体中文](./README.zh.md)

## Preview
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

<div align="center" style="width: 100%;">
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="preview"/>
</div>

## Completed Features:
+ Drawing Mode
  - Provides 12 different styles of brushes, including Basic Brush, Rainbow Brush, Multi-Shape Brush, Multi-Material Brush, Pixel Brush, Multi-Color Brush, Text Brush, Multi-Line Connection Brush, Reticulate Brush, Multi-Point Connection Brush, Wiggle Brush, Thorn Brush. Satisfy the diversified drawing.
  - All brushes support color and brush width configuration, in addition to multi-shape, multi-material, multi-color and other brushes support custom configuration.
+ Eraser Mode
  - Eraser mode linearly erases all content and supports linear width configuration.
+ Select Mode
  - In the selection mode, you can frame the drawing content by clicking on it. The click handle supports dragging, zooming and rotating operations, providing flexible editing.
  - Selecting images supports multiple filter configurations.
  - Support for font settings when selecting text.
  - Layer settings are supported for all drawings, including Move Layer Up, Move Layer Down, Move to Top, and Move to Bottom.
  - All drawings support transparency configurations.
+ Drawing Board Configuration
  - Drawing board support for configuring background color and transparency configurations.
  - Supports painting caching, enabling caching will improve painting performance in the presence of large amounts of painted content, while disabling caching will improve canvas sharpness.
+ Multifunction Menu
  - The bottom left button shows the current zoom ratio in real time, click it to reset the zoom ratio.
  - The list of buttons in the center, in order from left to right, are: Undo, Redo, Copy Current Selection, Delete Current Selection, Draw Text, Upload Image, Clear Drawing, Save as Image, and Open File List.
  - PC:
    - Hold down the Space key and click the left mouse button to move the canvas, scroll the mouse wheel to zoom the canvas.
    - Press and hold the Backspace key to delete the selection.
    - Press and hold Ctrl + V at the same time to paste the clipboard image.
  - Mobile:
    - Supports dragging and zooming the canvas after a two-finger press.
+ Multifile Configuration
  - Support multiple canvas switching, each canvas can be customized title, add, delete, and provide upload and download
+ i18n
  - Currently support English, Chinese language display

## Pending Features:
+ Multi-platform authentication login and data synchronization
+ Drawing of common shapes
+ AI Drawing

## V1.0.0 Video Demo

[![v1.0.0 demo youtube](https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/v1.0.0_demo_youtube.jpg)](https://www.youtube.com/watch?v=zzWaR0wvz0s "")

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

## Contact me

If you have any suggestions or good ideas, welcome to contact me at any time!

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ WeChat:
  - <img style="width: 300px" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/wechat.JPG" alt="wechat"/>

## Contributing

I'm glad you're interested in contributing to PAINT BOARD. If you find a bug and want to fix it, please submit it in an Issue first. For new feature additions, please contact us in Discussions, or directly through the contact details provided above, and read the Contribution Guidelines below before contributing. Thank you for your support!

[Contribution Guidelines](./CONTRIBUTING.md)

## Document
+ After refactoring with Fabric.js
  - [Exploring the Canvas Series: The Art of Time Reversal in the Canvas](https://songlh.top/2024/01/10/Exploring-the-Canvas-Series-The-Art-of-Time-Reversal-in-the-Canvas/)
  - writing...
+ Before refactoring with Fabric.js
  - [Canvas Artistry：Mastering Selection, Dragging, and Scaling](https://songlh.top/2023/11/30/Canvas-Artistry1)
  - [Canvas Artistry：Drawing magic with multiple effects](https://songlh.top/2023/12/01/Canvas-Artistry2)

## License

MIT License. See the [LICENSE](https://github.com/LHRUN/paint-board/blob/main/LICENSE) file.
