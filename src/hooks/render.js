// @flow

// $FlowFixMe
import { useEffect, useRef } from 'react'
//import type { Node } from 'react'

import { debug } from '../utils'
import Renderer from '../Renderer'

export function useRender(scope: any, canvas: any, children?: any) {
  const node = useRef(null)

  useEffect(() => {
    if (canvas.current && scope.current) {
      node.current = Renderer.createContainer(scope.current)
      debug('[renderer] create', node.current.current._debugID)
    }
    return () => {
      if (node.current) {
        debug('[renderer] remove')
        Renderer.updateContainer(null, node.current)
        node.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (canvas.current && scope.current && node.current) {
      debug('[renderer] update')
      Renderer.updateContainer(children, node.current)
    }
  }, [children])

  return node
}
