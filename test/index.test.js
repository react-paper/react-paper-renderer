// @flow

import React from 'react'
import ReactDOM from 'react-dom'
//import TestRenderer from 'react-test-renderer'
//import { PaperScope } from 'paper/dist/paper-core'
import { mount } from 'enzyme'

import App from './components/App'
import Paper from './components/Paper'
//import { View, Rectangle } from '../src'

describe('paper renderer', () => {

  it('can render app', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
  
  it('can render paper', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Paper width={600} height={400} />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('can mount paper scope', async () => {
    const wrapper = mount(<Paper width={600} height={400} />)
    const instance = wrapper.instance()
    
    expect(instance).toBeDefined()
    expect(instance).toHaveProperty('view')
    expect(instance.view).toHaveProperty('current')
    expect(instance.view.current).toBeDefined()
    
    const view = instance.view.current
    expect(typeof view.getCanvas).toEqual('function')
    expect(typeof view.getScope).toEqual('function')
  
    const canvas = view.getCanvas()
    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
  
    /*
    const scope = view.getScope()
    console.log('scope', scope)
    expect(scope).toHaveProperty('project')
  
    const project = scope.project
    expect(project).toHaveProperty('layers')
    
    const layers = project.layers
    expect(layers).toHaveLength(3)
  
    const rectangle = layers[2].children[0]
    expect(rectangle.fillColor.equals('green')).toBeTruthy()
    */
  })
  
})

