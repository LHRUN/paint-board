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
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="logo"/>
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

## Pending Features:
+ Multi-platform authentication login and data synchronization


<!-- ## Operation Guide

[![](https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_youtube.jpg)](https://www.youtube.com/watch?v=tHZTK9X7BUQ "")

<image src="/public/desc/desc_en.png" width="70%" /> -->

## Getting Started
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

<!-- ## File List

```bash
├─components
│  ├─info // help info
│  ├─layer // multi layer
│  ├─mask // mask
│  ├─toolPanel // tool panel    
│  └─icons
│
├─hooks
│  └─event.ts // event hook
├─pages
│  └─board // board page
│
├─types
│
├─i18n
│
└─utils
  ├─constants
  ├─history.ts // history operation record
  ├─common.ts 
  ├─layer.ts // multi layer
  ├─paintBoard.ts // PaintBoard
  ├─storage.ts // localStorage cache
  ├─cursor.ts // mouse cursor
  ├─select.ts // select mode
  └─element
     ├─eraser.ts // eraser
     ├─element.ts // basic element
     ├─freeDraw.ts // free draw
     └─text.ts // text element
``` -->

<!-- ## paint-board design
1. The first step is to create a PaintBoard class, where all operations and data on the board are handled, such as initializing data, rendering elements, dragging and dropping the board, and so on.
```ts
class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  ...
  constructor(canvas: HTMLCanvasElement) {}
  init() {}
  render() {}
  drag() {}
  ...
}
```
2. Then based on the drawing board, based on the user's current behavior and the current configuration of the board, create and initialize canvas drawing elements for the current behavior, such as brushes, erasers, text, and so on, such as the following base types.
```ts
class CanvasElement {
  type: string
  layer: number
  // ...
  constructor(type: string, layer: number) {
    this.type = type
    this.layer = layer
    // ...
  }
  // ...
}
```
3. Finally, depending on the rendering logic, some generic logic is also encapsulated to change the final presentation on the canvas, such as undo, redo, layer sorting, etc. -->

## Document
+ After refactoring with Fabric.js
  + writing...
+ Before refactoring with Fabric.js
  - [Canvas Artistry： Mastering Selection, Dragging, and Scaling](https://songlh.top/2023/11/30/Canvas-Artistry1)
  - [Canvas Artistry：Drawing magic with multiple effects](https://songlh.top/2023/12/01/Canvas-Artistry2)

