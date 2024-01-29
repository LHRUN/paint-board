import { Object as FabricObject, IAllFilters } from 'fabric/fabric-impl'

declare module 'fabric/fabric-impl' {
  export interface Object {
    id: string
    _customType: string
    toObject_original: FabricObject.toObject
  }

  export interface Canvas {
    upperCanvasEl?: HTMLCanvasElement
    contextTop: CanvasRenderingContext2D
    _onMouseDownInDrawingMode: any
    _onMouseMoveInDrawingMode: any
    _onMouseUpInDrawingMode: any
    _currentTransform: any
  }

  export interface IAllFilters {
    BlackWhite: {
      new (options?: any): IBaseFilter
    }
    Vintage: {
      new (options?: any): IBaseFilter
    }
    Brownie: {
      new (options?: any): IBaseFilter
    }
    Kodachrome: {
      new (options?: any): IBaseFilter
    }
    Polaroid: {
      new (options?: any): IBaseFilter
    }
    Technicolor: {
      new (options?: any): IBaseFilter
    }
  }

  export interface IText {
    _textBeforeEdit: string
  }

  export interface Path {
    lineCoords: any
  }

  export interface Polyline {
    _setPositionDimensions: (options: IObjectOptions) => void
    __corner: number
  }

  export interface Control {
    pointIndex: number
  }
}
