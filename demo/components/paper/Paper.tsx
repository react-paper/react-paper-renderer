import React, { useCallback } from 'react';
import { Canvas, View, Layer, Raster } from 'react-paper-renderer';
import { Provider, useReducer } from './context';
import { Items } from './items';
import { Image, Route } from './types';

import { fitImage } from './utils/fitImage';
import { initScope } from './utils/initScope';

type Props = {
  image: Image;
  width: number;
  height: number;
} & React.ComponentProps<'canvas'>;

export const Paper: React.FC<Props> = ({ children, image, ...other }) => {
  const value = useReducer();
  const [state, dispatch] = value;

  const handleScopeReady = useCallback(
    (scope: paper.PaperScope) => {
      dispatch({ type: 'setScope', scope: scope });
      initScope(scope);
    },
    [dispatch]
  );

  const handleImageLoad = useCallback(
    (raster: paper.Raster) => {
      if (raster && raster.view) {
        raster.fitBounds(0, 0, image.width, image.height);
        fitImage(raster.view, image);
        dispatch({ type: 'setImage', image });
      }
    },
    [image, dispatch]
  );

  /*
  useEffect(
    () => () => {
      dispatch({ type: 'setImage', image: undefined });
    },
    [dispatch]
  );
  */

  const historyImage = state.history[state.historyIndex];

  return (
    <Canvas {...other} onScopeReady={handleScopeReady}>
      <Provider value={value}>
        <View>
          <Layer id={image.id} visible={!!state.image}>
            <Raster locked source={image.url} onLoad={handleImageLoad} />
          </Layer>
          {historyImage &&
            historyImage.routes.map((route, index) => (
              <Layer
                id={route.id}
                key={route.id}
                active={state.routeIndex === index}
                visible={!!state.image}
              >
                {route.items.map((item) => {
                  const Item = Items[item.type];
                  return (
                    <Item
                      {...item}
                      id={item.id}
                      key={item.id}
                      selected={state.selection === item.id}
                    />
                  );
                })}
              </Layer>
            ))}
          {children}
        </View>
      </Provider>
    </Canvas>
  );
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace paper {
    interface PaperScope {
      exportJSON: () => Route[];
    }
  }
}
