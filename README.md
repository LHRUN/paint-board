<h1 align="center">paint-board</h1>
<div align="center">

  基于canvas的多功能画板

</div>

**中文** | [English](./README.en-US.md)

## 预览
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

![](https://s1.ax1x.com/2022/12/03/zrR5Sf.png)

## 功能列表
已完成功能：
+ 画笔，可修改宽度颜色，根据速度动态展示线宽
+ 橡皮擦，随鼠标线性擦除内容
+ 绘制文字，双击画板输入文字绘制指定位置
+ 画板拖拽，按住空格可以无限拖拽画板
+ 选择模式，选择模式下可以点击元素进行框选，并按住手柄进行缩放或者移动，点击Backspace键可以删除选择元素
+ 图层，画板内容是按照图层顺序进行显示，可新增删除排序图层
+ 撤销，反撤销，清除画板，保存为图片

待完成功能：
+ 图片加载
+ 画板缩放
+ 背景颜色切换
+ 多画板
+ ...

## 操作指南
<image src="https://s1.ax1x.com/2022/12/03/zrDz4S.jpg" width="500" />

## 本地启动
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm run dev
```

## 文件结构

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
│       ├─info // 帮助信息
│       ├─layer // 多图层
│       └─toolPanel // 工具面板
├─types
└─utils
  │  constants
  │  history.ts // 历史记录
  │  common.ts 
  │  layer.ts // 图层
  │  paintBoard.ts // 画本主逻辑
  │  storage.ts // 缓存
  │  cursor.ts // 鼠标光标
  │  select.ts // 选择元素
  │
  └─element
     eraser.ts // 橡皮擦
     element.ts // 基础元素
     freeDraw.ts // 画笔
     text.ts // 文本元素
```

## 画板设计
1. 首先是建立一个PaintBoard画板类，所有canvas上的操作和数据都在此处理，例如初始化，渲染，拖拽画板等等
```ts
class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  ...
  constructor(canvas: HTMLCanvasElement) {}
  // 初始化canvas
  initCanvas() {}
  // 渲染
  render() {}
  // 拖拽
  drag() {}
  ...
}
```
2. 然后基于画板，根据当前，建立对应的canvas元素，比如画笔，橡皮擦，文字等等，基本类型如下
```ts
class CanvasElement {
  type: string // 元素类型
  layer: number // 图层
  // ...
  constructor(type: string, layer: number) {
    this.type = type
    this.layer = layer
    // ...
  }
  // ...
}
```
3. 最后根据渲染逻辑，还会封装一些通用的逻辑来改变canvas上最终的展示，比如撤回，反撤回，图层操作等等

## 技术文章
+ [基于canvas实现的多功能画板](https://lhrun.github.io/2022/09/21/%E5%9F%BA%E4%BA%8Ecanvas%E5%AE%9E%E7%8E%B0%E7%9A%84%E5%A4%9A%E5%8A%9F%E8%83%BD%E7%94%BB%E6%9D%BF/)
+ [canvas画板之绘画元素的框选](https://songlh.top/2022/12/05/canvas%E7%94%BB%E6%9D%BF%E4%B9%8B%E7%BB%98%E7%94%BB%E5%85%83%E7%B4%A0%E7%9A%84%E6%A1%86%E9%80%89/)

