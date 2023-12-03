<h1 align="center">paint-board</h1>
<h4 align="center">

  一款基于 canvas 的 Web 端多功能画板

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

**简体中文** | [English](./README.en-US.md)

## 预览
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

![](https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_image.png)

## 功能列表
已完成功能：
+ 画笔
  - 支持颜色变化，并可根据绘图速度实时调整线宽
  - 提供多种画笔效果，荧光、多色、蜡笔、喷雾、泡泡...
+ 橡皮擦
  - 通过鼠标移动线性擦除内容
+ 绘制文字
  - 双击画板后输入文字可在指定位置绘制
+ 画板拖拽
  - 按住空格键后可以无限拖拽画板
+ 选择模式
  - 进入选择模式后，可以通过点击元素来进行元素框选，并通过按住手柄来缩放或移动元素，点击 Backspace 键可删除选中的元素
+ 图层
  - 画板内容是按照图层顺序进行显示，可以新增或者删除排序图层
+ 提供撤销，反撤销，清除画板，内容保存为图像等功能

待完成功能：
+ 移动端适配
+ 背景颜色切换
+ 图片绘制
+ 画板缩放
+ 认证登录 + 多画板

## 操作指南

[![](https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_youtube.jpg)](https://www.youtube.com/watch?v=tHZTK9X7BUQ "")

<image src="/public/desc/desc_zh.png" width="70%" />

## 本地启动
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

## 文件结构

```bash
├─components  
│  ├─info // 帮助信息
│  ├─layer // 多图层
│  ├─mask // 蒙层
│  ├─toolPanel // 工具面板
│  └─icons
│
├─hooks
│  └─event.ts // event hook
├─pages
│  └─board // 画板页
│
├─types
│
├─i18n
│
└─utils
  ├─constants
  ├─history.ts // 历史记录
  ├─common.ts 
  ├─layer.ts // 图层
  ├─paintBoard.ts // 画本主逻辑
  ├─storage.ts // 缓存
  ├─cursor.ts // 鼠标光标
  ├─select.ts // 选择元素
  └─element
     ├─eraser.ts // 橡皮擦
     ├─element.ts // 基础元素
     ├─freeDraw.ts // 画笔
     └─text.ts // 文本元素
```

## 画板设计
1. 首先是需要建立一个 PaintBoard 画板类，所有画板上的操作和数据都在此处理，例如初始化数据，渲染元素，拖拽画板等
```ts
class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  ...
  constructor(canvas: HTMLCanvasElement) {}
  // 初始化
  init() {}
  // 渲染
  render() {}
  // 拖拽
  drag() {}
  ...
}
```
2. 然后基于画板，根据用户当前的行为和当前画板的配置，建立并初始化当前行为的 canvas 绘图元素，比如画笔，橡皮擦，文字等等，比如以下基础类型
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
3. 最后根据渲染逻辑，还会封装一些通用的逻辑来改变canvas上最终的展示，比如撤回，反撤回，图层排序等

## 技术文章
+ [基于canvas实现的多功能画板](https://songlh.top/2022/09/21/%E5%9F%BA%E4%BA%8Ecanvas%E5%AE%9E%E7%8E%B0%E7%9A%84%E5%A4%9A%E5%8A%9F%E8%83%BD%E7%94%BB%E6%9D%BF/)
+ [canvas画板之绘画元素的框选](https://songlh.top/2022/12/05/canvas%E7%94%BB%E6%9D%BF%E4%B9%8B%E7%BB%98%E7%94%BB%E5%85%83%E7%B4%A0%E7%9A%84%E6%A1%86%E9%80%89/)
+ [canvas画板之画笔的多种效果](https://songlh.top/2022/12/17/canvas%E7%94%BB%E6%9D%BF%E4%B9%8B%E7%94%BB%E7%AC%94%E7%9A%84%E5%A4%9A%E7%A7%8D%E6%95%88%E6%9E%9C/)

