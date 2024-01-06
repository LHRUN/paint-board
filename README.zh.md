<div align="center">
  <img width="180" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>
<h4 align="center">
  一款支持多端操作的趣味艺术画板
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

**简体中文** | [English](./README.md)

## 预览
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

<div align="center" style="width: 100%;">
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="logo"/>
</div>

## 已完成功能
+ 绘画模式
  - 提供了 12 种不同风格的画笔，包括基本画笔，彩虹画笔，多形状画笔，多素材画笔，像素画笔，多色画笔，文字画笔，多线连接画笔，网状画笔，多点连接画笔，波浪曲线画笔，荆棘画笔。以满足多样化的绘画需求。
  - 所有画笔均支持颜色和画笔宽度的配置，另外多形状、多素材、多色等画笔支持定制化配置。
+ 橡皮擦模式
  - 橡皮擦模式可线性擦除所有内容，并支持线性宽度配置
+ 选择模式
  - 在选择模式下，可以通过点击绘画内容进行框选。点击手柄支持拖拽、缩放和旋转操作，提供灵活的编辑方式。
  - 选择图片支持多种滤镜配置。
  - 选择文字时，支持字体设置
  - 所有绘制内容均支持图层设置，包括向上移动层级、向下移动层级、移动至顶层和移动至底层
  - 所有绘制内容支持透明度配置
+ 画板配置
  - 画板支持配置背景颜色和透明度配置
+ 多功能菜单
  - 左下角按钮实时显示当前缩放比例，点击即可重置缩放比例
  - 中间按钮列表按从左到右的功能分别为：撤销、反撤销、复制当前选择内容、删除当前选择内容、绘制文字、上传图片、清除绘制内容、保存为图片、打开文件列表
  - 电脑端：
    - 按住 Space 键并点击鼠标左键可移动画布，滚动鼠标滚轮实现画布缩放
    - 按住 Backspace 键可删除已选内容
    - 同时按住 Ctrl 键 + V 键可粘贴剪贴板图片
  - 移动端：
    - 支持双指按压后拖拽和缩放画布
+ 多文件配置
  - 支持多个画布切换，每个画布可自定义标题、增加、删除，并提供上传和下载功能

## 待完成功能
+ 多平台认证登录，数据同步

## 本地启动
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

## 技术文章
+ Fabric.js 重构后
  - 编写中...
+ Fabric.js 重构前
  - [基于canvas实现的多功能画板](https://songlh.top/2022/09/21/%E5%9F%BA%E4%BA%8Ecanvas%E5%AE%9E%E7%8E%B0%E7%9A%84%E5%A4%9A%E5%8A%9F%E8%83%BD%E7%94%BB%E6%9D%BF/)
  - [canvas画板之绘画元素的框选](https://songlh.top/2022/12/05/canvas%E7%94%BB%E6%9D%BF%E4%B9%8B%E7%BB%98%E7%94%BB%E5%85%83%E7%B4%A0%E7%9A%84%E6%A1%86%E9%80%89/)
  - [canvas画板之画笔的多种效果](https://songlh.top/2022/12/17/canvas%E7%94%BB%E6%9D%BF%E4%B9%8B%E7%94%BB%E7%AC%94%E7%9A%84%E5%A4%9A%E7%A7%8D%E6%95%88%E6%9E%9C/)