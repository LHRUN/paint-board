import * as THREE from 'three'

import { ElementRect, ELEMENT_INSTANCE, MousePosition } from '@/types'
import { Eraser, eraserRender } from './element/eraser'
import {
  FreeDraw,
  FreeDrawStyle,
  freeDrawRender,
  threejsRender,
  Material
} from './element/freeDraw'
import { CANVAS_ELE_TYPE, CommonWidth, RESIZE_TYPE } from './constants'
import { formatHistory, History } from './history'
import { BOARD_STORAGE_KEY, storage } from './storage'
import { Layer } from './layer'
import { Cursor, CURSOR_TYPE } from './cursor'
import { TextElement, textRender } from './element/text'
import { drawResizeRect, SelectElement } from './select'
import { formatPublicUrl } from './common'
import { vsCode, fsCode } from './shaderCode.glsl';
import board from "@/pages/board";

type MOVE_ELE = FreeDraw | Eraser | null

// 画板状态缓存
export type HistoryState = Pick<
  PaintBoard,
  | 'currentLineColor'
  | 'currentLineWidth'
  | 'cleanWidth'
  | 'originTranslate'
  | 'layer'
  | 'version'
>

/**
 * PaintBoard
 */
export class PaintBoard {
  scene: THREE.Scene
  camera: THREE.OrthographicCamera
  renderer: THREE.WebGLRenderer
  //brush: THREE.RawShaderMaterial
  brush: THREE.RawShaderMaterial

  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  // 历史操作记录
  history: History<ELEMENT_INSTANCE>
  // 原点位置
  originPosition = {
    x: 0,
    y: 0
  }
  // 针对原点拖拽距离
  originTranslate = {
    x: 0,
    y: 0
  }
  // canvas几何属性
  canvasRect = {
    top: 0,
    left: 0
  }
  // 图层
  layer: Layer
  // 鼠标光标
  cursor: Cursor
  // 选择元素
  select: SelectElement
  // 版本号，主要用于兼容缓存数据
  version = '0.2.6'
  // 画笔素材加载状态
  loadMaterialState = false
  // 画笔素材
  material: Material = {
    crayon: null
  }

  constructor(canvas: HTMLCanvasElement) {
    // Webgl canvas initialization
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(
      0, canvas.width, 0, canvas.height, -1.0, 1000
    )

    const renderer = new THREE.WebGLRenderer( {
      canvas: canvas,
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false
    })
    renderer.setClearColor('#FFFFFF') // Set background colour
    renderer.setSize(canvas.width, canvas.height)
    renderer.sortObjects = false
    renderer.autoClear = false
    this.renderer = renderer

    window.addEventListener("resize", () => {
      const div = canvas.parentNode as HTMLDivElement
      const width = div.clientWidth;
      const height = div.clientHeight;
      renderer.setSize(width, height); // Update size
      this.camera.left = 0;
      this.camera.right= width;
      this.camera.top = 0;
      this.camera.bottom = height;
      this.camera.updateProjectionMatrix();
    });

    const Types = {
      Vanilla: 0,
      Stamp: 1,
      Airbrush: 2,
    }
    const StampModes = {
      EquiDistant: 0,
      RatioDistant: 1,
    }

    // this.brush = new THREE.RawShaderMaterial({
    this.brush = new THREE.RawShaderMaterial({
      uniforms: {
        type: {value: Types.Stamp},
        alpha: {value: 1.0},
        color: {value: [0.0, 0.0, 0.0]},
        uniRadius: {value: 4.0},
        // Stamp
        footprint: { value: new THREE.Texture()},
        stampInterval: { value: 2.0 },
        noiseFactor: { value: 0.0 },
        rotationFactor: { value: 0.0 },
        stampMode: {value: StampModes.RatioDistant},
        // Airbrush
        gradient: {value: new THREE.DataTexture() },
      },
      vertexShader: vsCode,
      fragmentShader: fsCode,
      side: THREE.DoubleSide,
      transparent: true,
      glslVersion: THREE.GLSL3,
    });

    // 初始化配置
    this.canvas = canvas
    // this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    // Give it a fake context
    this.context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
    this.initCanvasSize()
    this.initOriginPosition()
    const { top, left } = canvas.getBoundingClientRect()
    this.canvasRect = {
      top,
      left
    }
    this.cursor = new Cursor(canvas)
    this.select = new SelectElement(this)

    // 获取缓存
    const { history = [], state = {} } = storage.get(BOARD_STORAGE_KEY) || {}
    formatHistory(history, state, state?.version || '0.1.0')
    Object.assign(this, { ...state })

    // 初始化缓存数据
    this.layer = new Layer(this.render.bind(this), state?.layer)

    this.history = new History(history)

    this.context.translate(this.originTranslate.x, this.originTranslate.y)
    this.loadMaterial().then(() => {
      this.render()
    })
  }

  /**
   * 加载素材
   */
  loadMaterial() {
    return new Promise<void>((resolve) => {
      this.cleanCanvas()
      const loadPos = this.transformPosition({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      })
      this.context.fillText('loading...', loadPos.x, loadPos.y)
      const crayonImg = new Image()
      const imgurl = formatPublicUrl('pattern/crayon.png')
      crayonImg.src = imgurl
      crayonImg.onload = () => {
        this.loadMaterialState = true
        this.material.crayon = crayonImg
        resolve()
      }
    })
  }

  /**
   * 初始化canvas宽高
   */
  initCanvasSize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  /**
   * 初始化原点
   */
  initOriginPosition() {
    this.context.translate(0, 0)
    this.originPosition = {
      x: 0,
      y: 0
    }
  }

  // 记录当前移动元素，用于画笔和橡皮擦
  currentMoveEle: MOVE_ELE = null

  /**
   * 记录当前移动元素，并加入history
   */
  recordCurrent(type: string) {
    let ele: MOVE_ELE = null
    switch (type) {
      case CANVAS_ELE_TYPE.FREE_DRAW:
        ele = new FreeDraw(
          this.currentLineColor,
          this.currentLineWidth,
          this.layer.current,
          this.currentFreeDrawStyle,
          this.brush
        )
        break
      case CANVAS_ELE_TYPE.ERASER:
        ele = new Eraser(this.cleanWidth, this.layer.current)
        break
      default:
        break
    }
    this.select.cancelSelectElement()
    if (ele) {
      this.history.add(ele)
      this.currentMoveEle = ele
      this.sortOnLayer()
    }
  }

  /**
   * 对history进行排序
   */
  sortOnLayer() {
    this.history.sort((a, b) => {
      return (
        this.layer.stack.findIndex(({ id }) => id === b?.layer) -
        this.layer.stack.findIndex(({ id }) => id === a?.layer)
      )
    })
  }

  /**
   * 为当前移动元素添加坐标数据
   */
  currentAddPosition(position: MousePosition) {
    this.currentMoveEle?.addPosition({
      x: position.x - this.canvasRect.left - this.originTranslate.x,
      y: position.y - this.canvasRect.top - this.originTranslate.y
    })
    this.initOriginPosition()
    this.render()
  }

  /**
   * 拖拽画布
   */
  dragCanvas(position: MousePosition) {
    const mousePosition = {
      x: position.x - this.canvasRect.left,
      y: position.y - this.canvasRect.top
    }
    this.cursor.change(CURSOR_TYPE.POINTER)
    if (this.originPosition.x && this.originPosition.y) {
      const translteX = mousePosition.x - this.originPosition.x
      const translteY = mousePosition.y - this.originPosition.y
      this.context.translate(translteX, translteY)
      this.originTranslate = {
        x: translteX + this.originTranslate.x,
        y: translteY + this.originTranslate.y
      }
      this.render()
    }
    this.originPosition = mousePosition
  }

  /**
   * 遍历history渲染数据
   */
  render() {
    if (!this.loadMaterialState) {
      return
    }
    this.cleanCanvas()
    if (this.history.getCurrentStack()?.length ?? 0 > 0) {
      const showLayerIds = new Set(
        this.layer.stack.reduce<number[]>((acc, cur) => {
          return cur.show ? [...acc, cur.id] : acc
        }, [])
      )
      this.history.each((ele) => {
        if (ele?.layer && showLayerIds.has(ele.layer)) {
          this.context.save()
          switch (ele?.type) {
            case CANVAS_ELE_TYPE.FREE_DRAW:
              freeDrawRender(this.context, ele as FreeDraw, this.material)
              break
            case CANVAS_ELE_TYPE.ERASER:
              eraserRender(
                this.context,
                this.cleanCanvas.bind(this),
                ele as Eraser
              )
              break
            case CANVAS_ELE_TYPE.TEXT:
              textRender(this.context, ele as TextElement)
              break
            default:
              break
          }
          this.context.restore()
        }
      })

      this.history.each((ele) => {
        if (ele?.layer && showLayerIds.has(ele.layer)) {
          switch (ele?.type) {
            case CANVAS_ELE_TYPE.FREE_DRAW:
              threejsRender(this.scene, ele as FreeDraw, ele.brush)
              this.renderer.render(this.scene, this.camera)
              this.scene.clear()
              break
            default:
              break
          }
        }
      })

      if (this.select.selectElementIndex !== -1) {
        const rect = this.select.getCurSelectElement().rect
        drawResizeRect(this.context, rect)
      }
    }
    this.cache()
  }

  /**
   * localStorage 缓存
   */
  cache() {
    const history = this.history.getCurrentStack()
    const {
      currentLineColor,
      currentLineWidth,
      cleanWidth,
      originTranslate,
      layer,
      version
    } = this
    const state = {
      currentLineColor,
      currentLineWidth,
      cleanWidth,
      originTranslate,
      layer,
      version
    }
    storage.set(BOARD_STORAGE_KEY, { history, state })
  }

  /**
   * 清除画布
   */
  cleanCanvas(w = Number.MAX_SAFE_INTEGER) {
    this.context.clearRect(-(w / 2), -(w / 2), w, w)
    this.scene.clear()
    this.renderer.clear()
    this.renderer.dispose()
  }

  // 当前画笔颜色
  currentLineColor = ['#000000']
  // 当前画笔宽度
  currentLineWidth = CommonWidth.W4
  // 当前画笔模式
currentFreeDrawStyle = FreeDrawStyle.Basic

  /**
   * 修改画笔宽度
   * @param width 画笔宽度
   */
  setFreeDrawWidth(width: number) {
    if (width) {
      this.currentLineWidth = width
    }
  }

  /**
   * 修改画笔颜色
   * @param color 画笔颜色
   */
  setFreeDrawColor(colors: string[]) {
    if (colors) {
      this.currentLineColor = colors
    }
  }

  /**
   * 修改画笔模式
   * @param mode 画笔模式
   */
  setFreeDrawStyle(style: FreeDrawStyle) {
    if (style) {
      this.currentFreeDrawStyle = style
    }
  }

  // 当前橡皮擦宽度
  cleanWidth = CommonWidth.W4

  /**
   * 修改橡皮擦宽度
   * @param width 橡皮擦宽度
   */
  setCleanWidth(width: number) {
    if (width) {
      this.cleanWidth = width
    }
  }

  /**
   * 后退
   */
  undo() {
    this.select.cancelSelectElement()
    this.history.undo()
    this.render()
  }

  /**
   * 前进
   */
  redo() {
    this.select.cancelSelectElement()
    this.history.redo()
    this.render()
  }

  /**
   * 清除画布
   */
  clean() {
    this.select.cancelSelectElement()
    this.history.clean()
    this.render()
  }

  /**
   * 保存为图片
   */
  saveImage() {
    const imageUrl = this.canvas.toDataURL('image/png')
    const elink = document.createElement('a')
    elink.download = 'image'
    elink.style.display = 'none'
    elink.href = imageUrl
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href)
    document.body.removeChild(elink)
    this.context.translate(this.originTranslate.x, this.originTranslate.y)
  }

  /**
   * 转换坐标
   */
  transformPosition(position: MousePosition) {
    return {
      x: position.x - this.canvasRect.left - this.originTranslate.x,
      y: position.y - this.canvasRect.top - this.originTranslate.y
    }
  }

  /**
   * 鼠标松开
   */
  canvasMouseUp() {
    if (this.select.isCurrentChange && this.select.tempCache) {
      this.history.pushStack(
        this.history.getCurrentStack(),
        this.select.tempCache
      )
    }
    this.select.isCurrentChange = false
    this.select.tempCache = null
    this.select.resizeType = RESIZE_TYPE.NULL
    this.currentMoveEle = null
    this.initOriginPosition()
  }

  /**
   * 添加文本元素
   * @param value 文本内容
   * @param rect 文本矩形属性
   */
  addTextElement(value: string, rect: ElementRect) {
    if (value) {
      const position = this.transformPosition(rect)
      rect.x = position.x
      rect.y = position.y
      const text = new TextElement(this.layer.current, value, rect)
      this.history.add(text)
      this.render()
    }
  }
}
