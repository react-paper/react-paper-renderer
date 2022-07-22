/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Canvas } from './Canvas';
import { View, Layer, Rectangle } from './Items';
import { PaperScope } from 'paper/dist/paper-core';

test('render canvas', () => {
  const scope = { current: null };
  render(<Canvas width={400} height={300} scopeRef={scope} />);
  const el = screen.getByRole('img');
  expect(el).toBeInstanceOf(HTMLCanvasElement);
  expect(scope.current).toBeInstanceOf(PaperScope);
});

test('render canvas with children', () => {
  const scope = { current: null };
  render(
    <Canvas width={400} height={300} scopeRef={scope}>
      <View>
        <Layer>
          <Rectangle
            center={[200, 150]}
            fillColor={'#222222'}
            size={[200, 100]}
          />
        </Layer>
        <Layer>
          <Rectangle
            center={[250, 50]}
            fillColor={'#ff0000'}
            size={[100, 200]}
          />
        </Layer>
      </View>
    </Canvas>
  );
  const el = screen.getByRole('img');
  expect(el).toBeInstanceOf(HTMLCanvasElement);
  expect(scope.current).toBeInstanceOf(PaperScope);
  const project = (scope.current as any).project;
  expect(project.layers.length).toEqual(2);
});
