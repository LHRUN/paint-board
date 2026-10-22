import { describe, expect, it } from 'vitest'
import rough from 'roughjs'
import { StrokeStyleType } from '@/constants/shape'
import {
  buildRoughShapeOptions,
  contentFrame,
  roughShapePlacement,
  undoStrokeOrigin
} from './roughFrame'

describe('rough shape bounds', () => {
  it('puts the centerline back on the path after Fabric shifts by half the stroke', () => {
    expect(undoStrokeOrigin({ left: -1.5, top: -1.5, strokeWidth: 3 })).toEqual(
      {
        left: 0,
        top: 0
      }
    )
  })

  it('ignores invisible paths and reports half the visible stroke as outset', () => {
    const frame = contentFrame([
      {
        left: 0,
        top: 0,
        width: 24,
        height: 24,
        stroke: '#000000',
        strokeWidth: 3,
        fill: 'transparent'
      },
      {
        left: -4,
        top: -4,
        width: 32,
        height: 32,
        stroke: 'transparent',
        strokeWidth: 3,
        fill: 'transparent'
      }
    ])

    expect(frame).toEqual({
      minX: 0,
      minY: 0,
      width: 24,
      height: 24,
      outset: 1.5
    })
  })

  it('follows the centerline Fabric draws inside a strokeUniform group', () => {
    const frame = contentFrame(
      [
        {
          left: -13.5,
          top: -13.5,
          width: 24,
          height: 24,
          stroke: '#000000',
          strokeWidth: 3,
          fill: 'transparent'
        }
      ],
      true
    )

    expect(frame).toEqual({
      minX: -12,
      minY: -12,
      width: 24,
      height: 24,
      outset: 1.5
    })
  })

  it('maps a rectangle centerline onto the drag rectangle', () => {
    expect(
      roughShapePlacement(10, 20, { x: 210, y: 120 }, { x: 24, y: 24 })
    ).toEqual({
      scaleX: 200 / 24,
      scaleY: 100 / 24,
      left: 10,
      top: 20
    })
  })

  it('keeps an icon inside the 24 viewBox when the drag is reversed', () => {
    expect(
      roughShapePlacement(
        240,
        240,
        { x: 0, y: 0 },
        { x: 24, y: 24 },
        { x: 2, y: 5 }
      )
    ).toEqual({
      scaleX: 10,
      scaleY: 10,
      left: 20,
      top: 50
    })
  })
})

describe('rough fill options', () => {
  it('does not ask roughjs to fill a transparent shape', () => {
    const options = buildRoughShapeOptions({
      stroke: '#000000',
      strokeStyle: StrokeStyleType.Sketch,
      fill: 'transparent'
    })
    const generator = rough.generator()
    const paths = generator.toPaths(generator.rectangle(0, 0, 24, 24, options))

    expect(options.fill).toBeUndefined()
    expect(paths).toHaveLength(1)
    expect(paths[0].stroke).toBe('#000000')
  })

  it('still fills a solid shape', () => {
    const options = buildRoughShapeOptions({
      stroke: '#000000',
      strokeStyle: StrokeStyleType.Solid,
      fill: '#65CC8A',
      fillStyle: 'solid'
    })
    const generator = rough.generator()
    const paths = generator.toPaths(generator.rectangle(0, 0, 24, 24, options))

    expect(paths.map((path) => path.fill)).toContain('#65CC8A')
    expect(paths.map((path) => path.stroke)).toContain('#000000')
  })
})
