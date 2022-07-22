export { Renderer } from './Renderer';
export { Canvas } from './Canvas';
export {
  View,
  Group,
  Layer,
  Path,
  Line,
  Circle,
  Rectangle,
  Ellipse,
  Arc,
  RegularPolygon,
  PointText,
  Raster,
  SymbolItem,
  Tool,
} from './Items';

// add custom types to paperjs
// also fix missing paperjs types
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace paper {
    interface PaperScope {
      layerMounted?: boolean; // custom
      symbols?: { [key: string]: any }; // custom
      _scopes: any;
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
