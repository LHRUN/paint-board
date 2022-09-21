## paint-board画板 v0.1.0
基于canvas的手绘画板，效果如下
![](https://s1.ax1x.com/2022/09/18/xpLdFe.png)
Demo地址：https://lhrun.github.io/paint-board

目前已完成功能
- [x] 画笔
- [x] 橡皮擦
- [x] 画布拖拽
- [x] 操作记录，后退，前进，清除，保存画布
- [x] 多图层
- [ ] 无限缩放
- [ ] 多项目
- [ ] 油漆刷
- [ ] ...

**Start**
```
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

### 画笔
> ...
### 橡皮擦
> ...
### 画布拖拽
> ...
### 操作记录
> ...
### 图层配置
> ...
