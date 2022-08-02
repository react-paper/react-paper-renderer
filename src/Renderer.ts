import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import paper from "paper/dist/paper-core";

import * as Item from "./Items";

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

type ApplyDefaultProp = (
  prop: string,
  instance: Instance,
  props: Props,
  prev: Props
) => void;

type ApplyProp = (instance: Instance, props: Props, prev: Props) => void;

const applyDefaultProp: ApplyDefaultProp = (prop, instance, props, prev) => {
  if (props[prop] !== prev[prop]) {
    Object.assign(instance, { [prop]: props[prop] });
  }
};

const applyProp: Index<ApplyProp> = {
  data: (instance, props, prev) => {
    if (props.data !== prev.data && instance instanceof paper.Item) {
      instance.data = {
        ...instance.data,
        ...props.data,
        type: instance.type,
      };
    }
  },
  active: (instance, props, prev) => {
    if (
      props.active &&
      props.active !== prev.active &&
      instance instanceof paper.Tool
    ) {
      instance.activate();
    }
  },
  point: (instance, props, prev) => {
    if (props.point !== prev.point && instance instanceof paper.Item) {
      instance.translate([
        props.point[0] - prev.point[0],
        props.point[1] - prev.point[1],
      ]);
    }
  },
  center: (instance, props, prev) => {
    if (props.center !== prev.center && instance instanceof paper.Item) {
      instance.translate([
        props.center[0] - prev.center[0],
        props.center[1] - prev.center[1],
      ]);
    }
  },
  radius: (instance, props, prev) => {
    if (props.radius !== prev.radius && instance instanceof paper.Item) {
      instance.scale(props.radius / prev.radius);
    }
  },
  rotation: (instance, props, prev) => {
    if (props.rotation !== prev.rotation && instance instanceof paper.Item) {
      if (props.rotation && prev.rotation) {
        instance.rotate(props.rotation - prev.rotation);
      } else {
        instance.rotation = props.rotation;
      }
    }
  },
  size: (instance, props, prev) => {
    if (props.size !== prev.size && instance instanceof paper.Item) {
      instance.scale(
        props.size[0] / prev.size[0],
        props.size[1] / prev.size[1]
      );
    }
  },
};

const applyProps = (
  instance: Instance,
  props: Props,
  prevProps: Props = {}
) => {
  const keys = Object.keys(props);
  const len = keys.length;
  let i = 0;
  // https://stackoverflow.com/a/7252102
  while (i < len) {
    const prop = keys[i];
    if (prop !== "id" && prop !== "children") {
      if (applyProp[prop]) {
        applyProp[prop](instance, props, prevProps);
      } else {
        applyDefaultProp(prop, instance, props, prevProps);
      }
    }
    i++;
  }
};

const getSymbolDefinition = (scope: Container, { id, name, svg }: Props) => {
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
  const definition = new paper.SymbolDefinition(scope.project.importSVG(svg));
  scope.symbols[key] = definition;

  // return created definition
  return definition;
};

// https://github.com/facebook/react/tree/master/packages/react-reconciler
// https://github.com/facebook/react/blob/master/packages/react-art/src/ReactARTHostConfig.js

export const Renderer = Reconciler({
  createInstance: (type: Type, instanceProps: Props, scope: Container) => {
    const { children, ...other } = instanceProps;
    const props: Props = { ...other, project: scope.project };

    let instance: Instance;

    switch (type) {
      case Item.View:
        instance = scope.view;
        break;
      case Item.Tool:
        instance = new scope.Tool();
        break;
      case Item.Layer:
        instance = new scope.Layer(props);
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

    instance.props = other;
    instance.type = type;

    /*
    console.log(
      "createInstance",
      scope.name,
      scope.project.name,
      instance.project?.name,
      instance.type,
      instance.id
    );
    */

    return instance;
  },

  createTextInstance: () => {
    throw new Error("PaperRenderer does not support text children");
  },

  getPublicInstance: (instance: Instance) => instance,
  prepareForCommit: () => null,
  prepareUpdate: () => true,
  resetAfterCommit: () => {},
  resetTextContent: () => {},
  getRootHostContext: () => null,
  getChildHostContext: () => null,
  shouldSetTextContent: () => false,

  getCurrentEventPriority: () => DefaultEventPriority,
  getInstanceFromNode: () => undefined,
  getInstanceFromScope: () => undefined,
  preparePortalMount: () => {},
  prepareScopeUpdate: () => {},
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: () => {},
  clearContainer: () => {},

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  isPrimaryRenderer: false,
  warnsIfNotActing: false,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,

  appendInitialChild: (parent: Instance, child: Instance) => {
    console.log("appendInitialChild");
    if (parent instanceof paper.Group && child instanceof paper.Item) {
      child.addTo(parent);
    }
    if (parent instanceof paper.View && child instanceof paper.Item) {
      child.addTo(parent._project);
    }
    /*
    console.log(
      "appendInitialChild",
      parent.project?._scope.name,
      parent.project?.name,
      child.project?._scope.name,
      child.project?.name,
      child.type,
      child.id
    );
    console.log({
      child: {
        item: child instanceof paper.Item,
        group: child instanceof paper.Group,
        layer: child instanceof paper.Layer,
        tool: child instanceof paper.Tool,
        raster: child instanceof paper.Raster,
        child,
      },
      parent: {
        item: parent instanceof paper.Item,
        group: parent instanceof paper.Group,
        layer: parent instanceof paper.Layer,
        tool: parent instanceof paper.Tool,
        view: parent instanceof paper.View,
        parent,
      },
    });
    */
  },

  finalizeInitialChildren: (instance: Instance, type: Type, props: Props) => {
    console.log("finalizeInitialChildren");
    if (instance instanceof paper.Tool) {
      applyProps(instance, props);
    }
    return false;
    /*
    console.log(
      "finalizeInitialChildren",
      instance.project?._scope.name,
      instance.project?.name,
      instance.type,
      instance.id
    );
    /*
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
    return true;
    */
  },

  appendChild: (parent: Instance, child: Instance) => {
    console.log("appendChild");
    if (parent instanceof paper.Group && child instanceof paper.Item) {
      child.addTo(parent);
    }
    if (parent instanceof paper.View && child instanceof paper.Item) {
      child.addTo(parent._project);
    }
    /*
    console.log(
      "appendChild",
      parent.project?._scope.name,
      parent.project?.name,
      child.project?._scope.name,
      child.project?.name,
      child.type,
      child.id
    );
    console.log({
      child: {
        item: child instanceof paper.Item,
        group: child instanceof paper.Group,
        layer: child instanceof paper.Layer,
        tool: child instanceof paper.Tool,
        raster: child instanceof paper.Raster,
        child,
      },
      parent: {
        item: parent instanceof paper.Item,
        group: parent instanceof paper.Group,
        layer: parent instanceof paper.Layer,
        tool: parent instanceof paper.Tool,
        view: parent instanceof paper.View,
        parent,
      },
    });
    */
  },

  appendChildToContainer: (container: Container, child: Instance) => {
    console.log("appendChildToContainer");
    if (!(child instanceof paper.View || child instanceof paper.Tool)) {
      throw new Error("Container can only hold View and Tool nodes");
    }
  },

  insertBefore: (parent: Instance, child: Instance, before: Instance) => {
    console.log("insertBefore");
    if (
      parent instanceof paper.Group &&
      child instanceof paper.Item &&
      before instanceof paper.Item
    ) {
      child.insertAbove(before);
    }
    /*
    console.log(
      "insertBefore",
      parent.project?._scope.name,
      parent.project?.name,
      child.project?._scope.name,
      child.project?.name,
      child.type,
      child.id
    );
    */
  },

  insertInContainerBefore: (
    container: Container,
    child: Instance,
    before: Instance
  ) => {
    console.log("insertInContainerBefore");
    if (
      !(child instanceof paper.View || child instanceof paper.Tool) ||
      !(before instanceof paper.View || before instanceof paper.Tool)
    ) {
      throw new Error("Container can only hold View and Tool nodes");
    }
  },

  removeChild: (parent: Instance, child: Instance) => {
    console.log("removeChild");
    if (typeof child.remove === "function") {
      child.remove();
    }
  },

  removeChildFromContainer: (container: Container, child: Instance) => {
    console.log("removeChildFromContainer");
    if (typeof child.remove === "function") {
      child.remove();
    }
  },

  commitTextUpdate: () => {},

  commitMount: () => {},

  commitUpdate: (
    instance: Instance,
    payload: any,
    type: Type,
    oldProps: Props,
    newProps: Props
  ) => {
    applyProps(instance, newProps, oldProps);
  },
});
