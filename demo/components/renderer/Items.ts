import React from 'react';

type Component = string | React.FC<{ [key: string]: any }>;

export const View: Component = 'View';
export const Group: Component = 'Group';
export const Layer: Component = 'Layer';
export const Path: Component = 'Path';
export const Line: Component = 'Line';
export const Circle: Component = 'Circle';
export const Rectangle: Component = 'Rectangle';
export const Ellipse: Component = 'Ellipse';
export const Arc: Component = 'Arc';
export const RegularPolygon: Component = 'RegularPolygon';
export const PointText: Component = 'PointText';
export const Raster: Component = 'Raster';
export const SymbolItem: Component = 'SymbolItem';
export const Tool: Component = 'Tool';
