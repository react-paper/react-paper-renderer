// @flow

import Paper from 'paper/dist/paper-core'
import Reconciler from 'react-reconciler'
import {
  unstable_now as now,
  unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback,
} from 'scheduler'
import invariant from 'fbjs/lib/invariant'
import emptyObject from 'fbjs/lib/emptyObject'

import * as Type from './types'

const applyProp = {
  default: (prop, instance, props, prevProps) => {
    if (props[prop] !== prevProps[prop]) {
      instance[prop] = props[prop]
    }
  },
  active: (instance, props, prevProps) => {
    if (props.active && props.active !== prevProps.active) {
      instance.activate()
    }
  },
  point: (instance, props, prevProps) => {
    if (props.point !== prevProps.point) {
      instance.translate([
        props.point[0] - prevProps.point[0],
        props.point[1] - prevProps.point[1],
      ])
    }
  },
  center: (instance, props, prevProps) => {
    if (props.center !== prevProps.center) {
      instance.translate([
        props.center[0] - prevProps.center[0],
        props.center[1] - prevProps.center[1],
      ])
    }
  },
  radius: (instance, props, prevProps) => {
    if (props.radius !== prevProps.radius) {
      instance.scale(props.radius / prevProps.radius)
    }
  },
  rotation: (instance, props, prevProps) => {
    if (props.rotation !== prevProps.rotation) {
      if (props.rotation && prevProps.rotation) {
        instance.rotate(props.rotation - prevProps.rotation)
      } else {
        instance.rotation = props.rotation
      }
    }
  },
  size: (instance, props, prevProps) => {
    if (props.size !== prevProps.size) {
      instance.scale(
        props.size[0] / prevProps.size[0],
        props.size[1] / prevProps.size[1]
      )
    }
  },
  scaling: (instance, props, prevProps) => {
    if (props.scaling !== prevProps.scaling) {
      if (instance.applyMatrix) {
        instance.scaling = props.scaling / prevProps.scaling
      } else {
        instance.scaling = props.scaling
      }
    }
  },
}

function applyProps(instance, props, prevProps = {}) {
  Object.keys(props).forEach(prop => {
    if (prop !== 'children' && prop !== 'id') {
      if (applyProp[prop]) {
        applyProp[prop](instance, props, prevProps)
      } else {
        applyProp.default(prop, instance, props, prevProps)
      }
    }
  })
}

function getSymbolDefinition(scope, { id, name, svg }) {
  const key = id || name
  if (!key) throw new Error(`Missing id or name prop on SymbolItem`)
  if (!svg) throw new Error(`Missing svg prop on SymbolItem`)

  // return cached definition
  if (scope.symbols && scope.symbols[key]) {
    return scope.symbols[key]
  }

  // create symbols cache
  if (!scope.symbols) {
    scope.symbols = {}
  }

  // create definition
  const definition = new scope.SymbolDefinition(
    scope.project.importSVG(svg)
  )
  scope.symbols[key] = definition

  // return created definition
  return definition
}

const PaperRenderer = Reconciler({
  // eslint-disable-next-line
  createInstance(type, { children, ...props }, scope) {
    let instance = {}

    switch (type) {
      case Type.View:
        instance = scope.view
        break
      case Type.Tool:
        instance = new scope.Tool()
        break
      case Type.Layer:
        instance = new scope.Layer(props)
        break
      case Type.Group:
        instance = new scope.Group(props)
        break
      case Type.Path:
        instance = new scope.Path(props)
        break
      case Type.Arc:
        instance = new scope.Path.Arc(props)
        break
      case Type.Circle:
        instance = new scope.Path.Circle(props)
        break
      case Type.Ellipse:
        instance = new scope.Path.Ellipse(props)
        break
      case Type.Line:
        instance = new scope.Path.Line(props)
        break
      case Type.Rectangle:
        instance = new scope.Path.Rectangle(props)
        break
      case Type.RegularPolygon:
        instance = new scope.Path.RegularPolygon(props)
        break
      case Type.SymbolItem: {
        // eslint-disable-next-line
        const { svg, ...other } = props
        const definition = getSymbolDefinition(scope, props)
        instance = new scope.SymbolItem(definition, other)
        break
      }
      case Type.PointText:
        instance = new scope.PointText(props)
        break
      case Type.Raster: {
        const { onLoad, ...other } = props
        instance = new scope.Raster(other)
        if (typeof onLoad === 'function') {
          instance.onLoad = () => onLoad(instance)
        }
        break
      }
      default:
        invariant(
          instance,
          'PaperRenderer does not support the type "%s"',
          type
        )
        break
    }

    if (!instance.data) {
      instance.data = {}
    }

    instance.data.type = type

    invariant(
      instance,
      'PaperRenderer does not support the type "%s"',
      type
    )

    return instance
  },

  createTextInstance(text) {
    return text
  },

  appendInitialChild(parentInstance, child) {
    if (typeof child === 'string') {
      invariant(false, 'Text children should already be flattened.')
    }
    if (
      parentInstance instanceof Paper.Group &&
      child instanceof Paper.Item
    ) {
      child.addTo(parentInstance)
    }
  },

  finalizeInitialChildren(instance, type, props) {
    switch (type) {
      case Type.View:
      case Type.Layer:
      case Type.Group:
      case Type.Tool:
        applyProps(instance, props)
        break
      default:
        break
    }
    return false
  },

  getPublicInstance(instance) {
    return instance
  },

  prepareForCommit() {
    // Noop
  },

  prepareUpdate() {
    return true
  },

  resetAfterCommit() {
    // Noop
  },

  resetTextContent() {
    // Noop
  },

  shouldDeprioritizeSubtree() {
    return false
  },

  getRootHostContext() {
    return emptyObject
  },

  getChildHostContext() {
    return emptyObject
  },

  isPrimaryRenderer: false,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,
  //useSyncScheduling: true,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  now,
  scheduleDeferredCallback,
  cancelDeferredCallback,

  shouldSetTextContent(type, props) {
    return (
      typeof props.children === 'string' ||
      typeof props.children === 'number'
    )
  },

  appendChild(parentInstance, child) {
    if (child.parentNode === parentInstance) {
      child.remove()
    }
    if (
      parentInstance instanceof Paper.Group &&
      child instanceof Paper.Item
    ) {
      child.addTo(parentInstance)
    }
  },

  appendChildToContainer(parentInstance, child) {
    if (child.parentNode === parentInstance) {
      child.remove()
    }
    if (
      parentInstance instanceof Paper.Group &&
      child instanceof Paper.Item
    ) {
      child.addTo(parentInstance)
    }
  },

  insertBefore(parentInstance, child, beforeChild) {
    invariant(
      child !== beforeChild,
      'PaperRenderer: Can not insert node before itself'
    )
    if (
      parentInstance instanceof Paper.Group &&
      child instanceof Paper.Path &&
      beforeChild instanceof Paper.Path
    ) {
      child.insertAbove(beforeChild)
    }
  },

  insertInContainerBefore(parentInstance, child, beforeChild) {
    invariant(
      child !== beforeChild,
      'PaperRenderer: Can not insert node before itself'
    )
    if (
      parentInstance instanceof Paper.Group &&
      child instanceof Paper.Path &&
      beforeChild instanceof Paper.Path
    ) {
      child.insertAbove(beforeChild)
    }
  },

  removeChild(parentInstance, child) {
    if (typeof child.remove === 'function') {
      child.remove()
    }
  },

  removeChildFromContainer(parentInstance, child) {
    if (typeof child.remove === 'function') {
      child.remove()
    }
  },

  commitTextUpdate() {
    // Noop
  },

  commitMount() {
    // Noop
  },

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    applyProps(instance, newProps, oldProps)
  },
})

PaperRenderer.injectIntoDevTools({
  findFiberByHostInstance: () => null,
  bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
  rendererPackageName: 'react-paper-renderer',
  version: '3.0.0-alpha.0',
})

export default PaperRenderer
