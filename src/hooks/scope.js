// @flow

// $FlowFixMe
import { useEffect, useRef } from 'react'
import { PaperScope, Size } from 'paper/dist/paper-core'

import { debug } from '../utils'

export function useScope(settings?: any) {
  const canvas = useRef(null)
  const scope = useRef(null)

  useEffect(() => {
    if (canvas.current) {
      scope.current = new PaperScope()
      scope.current.setup(canvas.current)
      debug('[scope] create', scope.current._id)
  
      const { width, height } = canvas.current.getBoundingClientRect()
      scope.current.view.viewSize = new Size(width, height)
  
      if (settings) {
        for (let key of Object.keys(settings)) {
          scope.current.settings[key] = settings[key]
        }
      }
    }
    return () => {
      debug('[scope] remove')
      if (scope.current) {
        scope.current.project.remove()
      }
      scope.current = null
      canvas.current = null
    }
  }, [])

  return { scope, canvas }
}
