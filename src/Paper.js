// @flow

import React, { useEffect, useRef } from 'react'
import type { Node } from 'react'
import type { FiberRoot } from 'react-reconciler'
import { PaperScope } from 'paper/dist/paper-core'
import Renderer from './Renderer'

type Props = {
  children: Node,
  onScopeReady?: Function,
  settings?: Object,
}

export default function Paper(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>()
  const scopeRef = useRef<PaperScope>()
  const rootRef = useRef<FiberRoot>()

  const {
    children,
    onScopeReady,
    settings,
    ...other
  } = props

  useEffect(() => {
    const canvas = canvasRef.current

    if (canvas instanceof HTMLCanvasElement) {
      const scope = new PaperScope()
      if (typeof settings === 'object') {
        Object.assign(scope.settings, settings)
      }
      scopeRef.current = scope
      scope.setup(canvas)

      const root = Renderer.createContainer(scope)
      rootRef.current = root

      if (typeof onScopeReady === 'function') {
        onScopeReady(scope)
      }
    }
    return () => {
      Renderer.updateContainer(null, rootRef.current)
      canvasRef.current = null
      scopeRef.current = null
      rootRef.current = null
    }
  }, [])

  useEffect(() => {
    if (scopeRef.current && rootRef.current) {
      Renderer.updateContainer(children, rootRef.current)
    }
  }, [children])

  return <canvas {...other} ref={canvasRef} resize={'true'} />
}
