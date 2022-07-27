import React, { FC, useCallback, useContext } from "react";
import useMeasure from "react-use-measure";
import { Canvas, CanvasProps, View, Layer, Raster } from "react-paper-renderer";

import { Context } from "./context";
import { Items } from "./items";
import { Image, Route } from "./types";

import { fitImage } from "./utils/fitImage";
import { initScope } from "./utils/initScope";

const containerStyles = {
  width: "100%",
  height: "100%",
};

type Props = Omit<CanvasProps, "width" | "height"> & {
  image: Image;
};

export const Paper: FC<Props> = ({ children, image, ...other }) => {
  const [ref, { width, height }] = useMeasure();
  const value = useContext(Context);
  const [state, dispatch] = value;

  const historyImage = state.history[state.historyIndex];

  const handleScopeReady = useCallback(
    (scope: paper.PaperScope) => {
      dispatch({ type: "setScope", scope: scope });
      initScope(scope);
    },
    [dispatch]
  );

  const handleImageLoad = useCallback(
    (raster: paper.Raster) => {
      if (raster && raster.view) {
        raster.fitBounds(0, 0, image.width, image.height);
        fitImage(raster.view, image);
        dispatch({ type: "setImage", image });
      }
    },
    [image, dispatch]
  );

  return (
    <div style={containerStyles} ref={ref}>
      {width > 0 && height > 0 && (
        <Canvas
          {...other}
          width={width}
          height={height}
          onScopeReady={handleScopeReady}
        >
          <Context.Provider value={value}>
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
          </Context.Provider>
        </Canvas>
      )}
    </div>
  );
};

/**
 * Add custom exportJSON function to PaperScope
 *
 * @see utils/initScope.js
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace paper {
    interface PaperScope {
      exportJSON: () => Route[];
    }
  }
}
