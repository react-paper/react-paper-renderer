// @flow

// $FlowFixMe
import { useEffect } from 'react'
import { Size } from 'paper/dist/paper-core'

import { debounce, debug } from '../utils'

export function useResize(scope: any, canvas: any) {

  useEffect(() => {
    let listener = null
    if (scope.current && canvas.current) {
      listener = debounce(() => {
        debug('[resize] resize')
        const { width, height } = canvas.current.getBoundingClientRect()
        scope.current.view.viewSize = new Size(width, height)
      })
      
      debug('[resize] watch')
      window.addEventListener('resize', listener)
    }
    return () => {
      debug('[resize] unwatch')
      if (listener) {
        window.removeEventListener('resize', listener)
      }
    }
  }, [])

}