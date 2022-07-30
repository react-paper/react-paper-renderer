import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import Paper from "paper/dist/paper-core";

import * as Item from "./Items";

//#region Types
type Container = paper.PaperScope;

type Instance =
  | paper.View
  | paper.Tool
  | paper.Layer
  | paper.Group
  | paper.Path
  | paper.SymbolItem
  | paper.PointText
  | paper.Raster;

type Type = keyof typeof Item;

type Index<T> = { [key: string]: T };
type Props = Index<any>;
//#endregion

//#region Props
const emptyObject = {};

const applyProp: Index<any> = {
  default: (
    prop: string,
    instance: Instance,
    props: Props,
    prevProps: Props
  ) => {
    if (props[prop] !== prevProps[prop]) {
      Object.assign(instance, { [prop]: props[prop] });
    }
  },
  data: (instance: Instance, props: Props, prevProps: Props) => {
    if (props.data !== prevProps.data && instance instanceof Paper.Item) {
      instance.data = {
        ...instance.data,
        ...props.data,
        type: instance.type,
      };
    }
  },
  active: (instance: Instance, props: Props, prevProps: Props) => {
    if (
      props.active &&
      props.active !== prevProps.active &&
      instance instanceof Paper.Tool
    ) {
      instance.activate();
    }
  },
  point: (instance: Instance, props: Props, prevProps: Props) => {
    if (props.point !== prevProps.point && instance instanceof Paper.Item) {
      instance.translate([
        props.point[0] - prevProps.point[0],
        props.point[1] - prevProps.point[1],
      ]);
    }
  },
  center: (instance: Instance, props: Props, prevProps: Props) => {
    if (props.center !== prevProps.center && instance instanceof Paper.Item) {
      instance.translate([
        props.center[0] - prevProps.center[0],
        props.center[1] - prevProps.center[1],
      ]);
    }
  },
  radius: (instance: Instance, props: Props, prevProps: Props) => {
    if (props.radius !== prevProps.radius && instance instanceof Paper.Item) {
      instance.scale(props.radius / prevProps.radius);
    }
  },
  rotation: (instance: Instance, props: Props, prevProps: Props) => {
    if (
      props.rotation !== prevProps.rotation &&
      instance instanceof Paper.Item
    ) {
      if (props.rotation && prevProps.rotation) {
        instance.rotate(props.rotation - prevProps.rotation);
      } else {
        instance.rotation = props.rotation;
      }
    }
  },
  size: (instance: Instance, props: Props, prevProps: Props) => {
    if (props.size !== prevProps.size && instance instanceof Paper.Item) {
      instance.scale(
        props.size[0] / prevProps.size[0],
        props.size[1] / prevProps.size[1]
      );
    }
  },
};

const applyProps = (
  instance: Instance,
  props: Props,
  prevProps: Props = {}
) => {
  Object.keys(props).forEach((prop: string) => {
    if (prop !== "id" && prop !== "children") {
      if (applyProp[prop]) {
        applyProp[prop](instance, props, prevProps);
      } else {
        applyProp.default(prop, instance, props, prevProps);
      }
    }
  });
};

const getSymbolDefinition = (
  scope: paper.PaperScope,
  { id, name, svg }: Props
) => {
  const key = id || name;
  if (!key) throw new Error("Missing id or name prop on SymbolItem");
  if (!svg) throw new Error("Missing svg prop on SymbolItem");

  // return cached definition
  if (scope.symbols && scope.symbols[key]) {
    return scope.symbols[key];
  }

  // create symbols cache
  if (!scope.symbols) {
    scope.symbols = {};
  }

  // create definition
  const definition = new scope.SymbolDefinition(scope.project.importSVG(svg));
  scope.symbols[key] = definition;

  // return created definition
  return definition;
};
//#endregion

// https://github.com/facebook/react/tree/master/packages/react-reconciler
// https://github.com/facebook/react/blob/master/packages/react-art/src/ReactARTHostConfig.js

export const Renderer = Reconciler({
  //#region createInstance
  createInstance: (type: Type, instanceProps: Props, scope: Container) => {
    const { children, ...props } = instanceProps;
    let instance: Instance;

    switch (type) {
      case Item.View:
        instance = scope.view;
        break;
      case Item.Tool:
        instance = new scope.Tool();
        break;
      case Item.Layer:
        if (!scope.layerMounted) {
          // first layer is created by paperjs
          // so we simply use it as our instance
          const { id, ...other } = props;
          instance = scope.project.layers[0];
          instance.set(other);
          scope.layerMounted = true;
        } else {
          instance = new scope.Layer(props);
        }
        break;
      case Item.Group:
        instance = new scope.Group(props);
        break;
      case Item.Path:
        instance = new scope.Path(props);
        break;
      case Item.Arc:
        instance = new scope.Path.Arc(props);
        break;
      case Item.Circle:
        instance = new scope.Path.Circle(props);
        break;
      case Item.Ellipse:
        instance = new scope.Path.Ellipse(props);
        break;
      case Item.Line:
        instance = new scope.Path.Line(props);
        break;
      case Item.Rectangle:
        instance = new scope.Path.Rectangle(props);
        break;
      case Item.RegularPolygon:
        instance = new scope.Path.RegularPolygon(props);
        break;
      case Item.PointText:
        instance = new scope.PointText(props);
        break;
      case Item.SymbolItem: {
        const definition = getSymbolDefinition(scope, props);
        instance = new scope.SymbolItem(definition, props.center);
        break;
      }
      case Item.Raster: {
        const { onLoad, ...other } = props;
        instance = new scope.Raster(other);
        if (typeof onLoad === "function") {
          instance.onLoad = () => onLoad(instance);
        }
        break;
      }
      default:
        throw new Error(`PaperRenderer does not support the type "${type}"`);
    }

    instance.props = props;
    instance.type = type;

    return instance;
  },
  //#endregion

  //#region core
  createTextInstance: (text: string) => {
    return text;
  },

  appendInitialChild: (parentInstance: Instance, child: Instance) => {
    if (typeof child === "string") {
      throw new Error("Text children should already be flattened.");
    }
    if (parentInstance instanceof Paper.Group && child instanceof Paper.Item) {
      child.addTo(parentInstance);
    }
  },

  finalizeInitialChildren: (instance: Instance, type: Type, props: Props) => {
    switch (type) {
      case Item.View:
      case Item.Layer:
      case Item.Group:
      case Item.Tool:
        applyProps(instance, props);
        break;
      default:
        break;
    }
    return false;
  },

  getPublicInstance: (instance: Instance) => {
    return instance;
  },

  prepareForCommit: () => {
    return null;
  },

  prepareUpdate: () => {
    return true;
  },

  resetAfterCommit: () => {
    // Noop
  },

  resetTextContent: () => {
    // Noop
  },

  getRootHostContext: (ctx) => {
    return emptyObject;
  },

  getChildHostContext: (ctx) => {
    return emptyObject;
  },

  shouldSetTextContent: (type: Type, { children }: Props) => {
    return typeof children === "string" || typeof children === "number";
  },
  //#endregion

  //#region config
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  isPrimaryRenderer: false,
  //warnsIfNotActing: false,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,
  //#endregion

  //#region mutation
  appendChild: (parentInstance: Instance, child: Instance) => {
    /*
    if (child.parent === parentInstance) {
      child.remove();
    }
    */
    if (parentInstance instanceof Paper.Group && child instanceof Paper.Item) {
      child.addTo(parentInstance);
    }
  },

  appendChildToContainer: (container: Container, child: Instance) => {
    /*
    if (!(
      child instanceof Paper.View || 
      child instanceof Paper.Tool
    ) && child.parent === container) {
      child.remove();
    }
    */
    // TODO: check this
    if (container instanceof Paper.Group && child instanceof Paper.Item) {
      child.addTo(container);
    }
  },

  insertBefore: (parent: Instance, child: Instance, beforeChild: Instance) => {
    if (child === beforeChild) {
      throw new Error("PaperRenderer: Can not insert node before itself");
    }
    if (
      parent instanceof Paper.Group &&
      child instanceof Paper.Path &&
      beforeChild instanceof Paper.Path
    ) {
      child.insertAbove(beforeChild);
    }
  },

  insertInContainerBefore: (
    container: Container,
    child: Instance,
    beforeChild: Instance
  ) => {
    if (child === beforeChild) {
      throw new Error("PaperRenderer: Can not insert node before itself");
    }
    // TODO: check this
    if (
      container instanceof Paper.Group &&
      child instanceof Paper.Path &&
      beforeChild instanceof Paper.Path
    ) {
      child.insertAbove(beforeChild);
    }
  },

  removeChild: (parent: Instance, child: Instance) => {
    if (typeof child.remove === "function") {
      child.remove();
    }
  },

  removeChildFromContainer: (container: Container, child: Instance) => {
    if (typeof child.remove === "function") {
      child.remove();
    }
  },

  commitTextUpdate: () => {
    // Noop
  },

  commitMount: () => {
    // Noop
  },

  commitUpdate: (
    instance: Instance,
    payload: any,
    type: Type,
    oldProps: Props,
    newProps: Props
  ) => {
    applyProps(instance, newProps, oldProps);
  },
  //#endregion

  //#region necessary stuff
  preparePortalMount: () => {
    // Noop
  },

  getCurrentEventPriority: () => {
    return DefaultEventPriority;
  },

  getInstanceFromNode: () => {
    return undefined;
  },
  beforeActiveInstanceBlur: () => {
    // Noop
  },

  afterActiveInstanceBlur: () => {
    // Noop
  },

  prepareScopeUpdate: () => {
    // Noop
  },

  getInstanceFromScope: () => {
    return undefined;
  },

  detachDeletedInstance: () => {
    // Noop
  },

  clearContainer: () => {
    // Noop
  },
  //#endregion
});

//#region PaperJS types
/**
 * Add custom paper.js types related to renderer
 *
 * @see http://paperjs.org/reference/paperscope/
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace paper {
    interface PaperScope {
      layerMounted?: boolean; // custom
      symbols?: { [key: string]: any }; // custom
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
//#endregion
