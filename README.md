## paint-board v0.1.0
Canvas based drawing board

![](https://s1.ax1x.com/2022/09/21/xiXVPK.png)

Preview：[https://songlh.top/paint-board/](https://songlh.top/paint-board/)

Features: 
- [x] free drawing
- [x] eraser
- [x] drawing board dragging
- [x] undo，redo，clear，save
- [x] multi layer
- [ ] Infinite scaling
- [ ] multi project
- [ ] toggle background color
- [ ] ...

### Getting Started
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm run dev
```

### file list

```js
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
│       └─optionsMenu // tool panel
├─types
└─utils
  │  constants
  │  history.ts // history operation record
  │  common.ts 
  │  layer.ts // mutil layer
  │  paintBoard.ts // PaintBoard
  │  storage.ts // local cache
  │
  └─element
     cleanLine.ts // eraser
     element.ts // basic element
     freeLine.ts // free draw
```

### project design
1. First create a PaintBoard class，where all canvas data is processed, such as init, render, dragging...
```js
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
2. Then according to the current operation, create the corresponding canvas element
```js
class CanvasElement {
  type: string // element type
  layer: number // element layer
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
4. document: [基于canvas实现的多功能画板](https://lhrun.github.io/2022/09/21/%E5%9F%BA%E4%BA%8Ecanvas%E5%AE%9E%E7%8E%B0%E7%9A%84%E5%A4%9A%E5%8A%9F%E8%83%BD%E7%94%BB%E6%9D%BF/)

