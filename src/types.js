// @flow

const TYPES = {
  CIRCLE: 'Circle',
  ELLIPSE: 'Ellipse',
  GROUP: 'Group',
  LAYER: 'Layer',
  LINE: 'Line',
  PATH: 'Path',
  POINTTEXT: 'PointText',
  RASTER: 'Raster',
  RECTANGLE: 'Rectangle',
  ARC: 'Arc',
  TOOL: 'Tool',
}

export default TYPES

export type Point = {
  x: number,
  y: number,
} | Array<number>
