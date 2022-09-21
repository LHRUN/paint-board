## paint-board画板 v0.1.0
基于canvas的手绘画板，效果如下
![](https://s1.ax1x.com/2022/09/21/xiXVPK.png)
Demo地址：https://lhrun.github.io/paint-board

目前已完成功能
- [x] 画笔
- [x] 橡皮擦
- [x] 画布拖拽
- [x] 撤回，反撤回，清除，保存画布
- [x] 多图层
- [ ] 无限缩放
- [ ] 多项目
- [ ] 油漆刷
- [ ] ...

### 本地启动
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm run dev
```

### 目录结构

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
│       ├─info // 帮助信息
│       ├─layer // 图层
│       └─optionsMenu // 工具面板
├─types
└─utils
  │  constants
  │  history.ts // 操作记录
  │  common.ts 
  │  layer.ts // 图层
  │  paintBoard.ts // 主类
  │  storage.ts // 缓存
  │
  └─element
     cleanLine.ts // 线性清除
     element.ts // 基本元素
     freeLine.ts // 画笔
```

### 画板设计
1. 首先是建立一个canvas画板类，所有在canvas上的操作和canvas的信息全部都在这里处理，例如初始化，渲染，拖拽画板等等
2. 然后基于canvas类，根据对应的操作类型，建立相应的canvas元素，比如画笔，橡皮擦...
3. 然后根据这些渲染逻辑，再封装一些通用的逻辑来改变canvas上最终的展示，比如缓存，历史操作，图层操作等等
4. blog：[基于canvas实现的画板记录](https://lhrun.github.io/2022/09/21/%E5%9F%BA%E4%BA%8Ecanvas%E5%AE%9E%E7%8E%B0%E7%9A%84%E7%94%BB%E6%9D%BF%E8%AE%B0%E5%BD%95/)

