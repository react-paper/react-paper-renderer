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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace paper {
    interface PaperScope {
      layerMounted?: boolean;
      symbols?: { [key: string]: any };
    }
    type PaperScopeSettings = {
      insertItems?: boolean;
      applyMatrix?: boolean;
      handleSize?: number;
      hitTolerance?: number;
    };
    interface View {
      props: { [key: string]: any };
      type: string;
      scale(scale: number, center?: Point): void;
      scale(hor: number, ver: number, center?: Point): void;
      scale(scale: number, center?: number[]): void;
      translate(delta: Point): void;
      translate(dx: number, dy: number): void;
      projectToView(point: Point): Point;
      projectToView(point: number[]): Point;
      viewToProject(point: Point): Point;
      viewToProject(point: number[]): Point;
    }
    interface Raster {
      fitBounds(rectangle: Rectangle, fill?: boolean): void;
      fitBounds(x: number, y: number, width: number, height: number): void;
    }
    interface Tool {
      props: { [key: string]: any };
      type: string;
      view: View;
    }
    interface ToolEvent {
      tool: Tool;
      event: PointerEvent;
    }
    interface Item {
      props: { [key: string]: any };
      type: string;
      pathData?: string;
      onLoad: any | null;
      translate(delta: Point): void;
      translate(delta: [number, number]): void;
      fitBounds(rectangle: Rectangle, fill?: boolean): void;
      fitBounds(x: number, y: number, width: number, height: number): void;
    }
  }
}
