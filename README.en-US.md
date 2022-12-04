<h1 align="center">paint-board</h1>
<div align="center">

  Canvas based drawing board

</div>

**English** | [中文](./README.md)

## Preview
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

![](https://s1.ax1x.com/2022/12/03/zrR5Sf.png)

## Features
Completed Features：
+ free draw, width and color can be modified
+ eraser
+ draw text, dclick the board to enter text
+ drawing board drag and drop
+ select mode, can zoom, move and delete(Backspace) elements
+ multi layer, can add, delete and sort
+ undo, redo, clean, save

Unfinished Features:
+ image
+ Infinite scaling
+ toggle background color
+ multi project
+ ...

## Operation Guide
<image src="https://s1.ax1x.com/2022/12/03/zrDz4S.jpg" width="500" />

## Getting Started
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm run dev
```

## File List

```bash
├─components        
│  └─icons
├─hooks
│  event.ts // event hook
├─pages
│  └─board
│    │ index.tsx
│    │
│    └─components
│       ├─info // help info
│       ├─layer // multi layer
│       └─toolPanel // tool panel
├─types
└─utils
  │  constants
  │  history.ts // history operation record
  │  common.ts 
  │  layer.ts // multi layer
  │  paintBoard.ts // PaintBoard
  │  storage.ts // localStorage cache
  │  cursor.ts // mouse cursor
  │  select.ts // select mode
  │
  └─element
     eraser.ts // eraser
     element.ts // basic element
     freeDraw.ts // free draw
     text.ts // text element
```

## paint-board design
1. First create a PaintBoard class，where all canvas data is processed, such as init, render, dragging...
```ts
class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  ...
  constructor(canvas: HTMLCanvasElement) {}
  initCanvas() {}
  render() {}
  drag() {}
  ...
}
```
2. Then according to the current operation, create the corresponding canvas element, such as freedraw, eraserm, text...
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
3. Finally, some universal logic will be encapsulated to change the final display on canvas, such as undo, redo, layer...

## Document
+ [基于canvas实现的多功能画板](https://lhrun.github.io/2022/09/21/%E5%9F%BA%E4%BA%8Ecanvas%E5%AE%9E%E7%8E%B0%E7%9A%84%E5%A4%9A%E5%8A%9F%E8%83%BD%E7%94%BB%E6%9D%BF/)

