<h1 align="center">paint-board</h1>
<h4 align="center">

  A canvas-based multifunctional drawing board on the Web.

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

**English** | [简体中文](./README.md)

## Preview
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

![](https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_image.png)

## Features
Completed Features：
+ Free draw
  - Support color change and real-time line width adjustment according to the drawing speed.
  - Provide many kinds of drawing effects, fluorescent、multicolor、crayon、bubbles、spray.
+ Eraser
  - Linearly erase content by mouse movement.
+ Draw text
  - Double-click on the board and enter text to draw at the specified location.
+ Drag and Drop
  - Hold down the space bar and drag the drawing board indefinitely.
+ Selection Mode
  - When you enter the selection mode, you can click on an element to select it, and hold down the handle to zoom or move it, and click the Backspace key to delete the selected element.
+ Layers
  - The content of the drawing board is displayed in the order of layers, you can add or delete sorted layers.
+ Undo, Redo, Clear Panel, Save as Image, etc.

Unfinished Features:
+ Mobile Adaptation
+ Background color switching
+ Image Drawing
+ Board Zoom
+ Authentication + Multi-Panel

## Operation Guide

[![](https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_youtube.jpg)](https://www.youtube.com/watch?v=tHZTK9X7BUQ "")

<image src="/public/desc/desc_en.png" width="70%" />

## Getting Started
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

## File List

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
```

## paint-board design
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
3. Finally, depending on the rendering logic, some generic logic is also encapsulated to change the final presentation on the canvas, such as undo, redo, layer sorting, etc.

## Document
+ [Canvas Artistry： Mastering Selection, Dragging, and Scaling](https://songlh.top/2023/11/30/Canvas-Artistry1)
+ [Canvas Artistry：Drawing magic with multiple effects](https://songlh.top/2023/12/01/Canvas-Artistry2)
