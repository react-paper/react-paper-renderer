// @flow

// $FlowFixMe
import React, { useEffect } from 'react'

function Test() {

  useEffect(() => {
    console.log('[test] mount')
    return () => {
      console.log('[test] unmount')
    }
  }, [])

  return (
    <div>test</div>
  )
}

export default Test
