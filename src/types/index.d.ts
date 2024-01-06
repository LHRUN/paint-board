import { Object as FabricObject, IAllFilters } from 'fabric/fabric-impl'

declare module 'fabric/fabric-impl' {
  export interface Object {
    id: string
    _customType: string
    _stateProperties: Record<string, any>
  }

  export interface Canvas {
    upperCanvasEl?: HTMLCanvasElement
    _onMouseDownInDrawingMode: any
    _onMouseMoveInDrawingMode: any
    _onMouseUpInDrawingMode: any
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
}
