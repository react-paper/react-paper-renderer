import React, { FC, useCallback, useContext } from "react";
import { Canvas, View, Layer, Raster } from "react-paper-renderer";
import useMeasure from "react-use-measure";

import { Context } from "./context";
import { Items } from "./items";
import { Image, Route } from "./types";

import { fitImage } from "./utils/fitImage";
import { exportJSON } from "./utils/exportJSON";

import { Tool, ToolName } from "./tools";

import styles from "./Paper.module.css";

type Props = {
  image: Image;
};

export const Paper: FC<Props> = ({ image }) => {
  const [ref, { width, height }] = useMeasure({ debounce: 150 });
  const value = useContext(Context);
  const [state, dispatch] = value;

  const historyImage = state.history[state.historyIndex];

  const handleScopeReady = useCallback(
    (scope: paper.PaperScope) => dispatch({ type: "setScope", scope: scope }),
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

  const setTool = (tool: ToolName) => dispatch({ type: "setTool", tool });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button onClick={() => setTool(ToolName.Move)}>{ToolName.Move}</button>
        <button onClick={() => setTool(ToolName.Pen)}>{ToolName.Pen}</button>
        <button onClick={() => setTool(ToolName.Circle)}>{ToolName.Circle}</button>
        <button onClick={() => setTool(ToolName.Select)}>{ToolName.Select}</button>
        <button onClick={() => setTool(ToolName.Delete)}>{ToolName.Delete}</button>
        <button onClick={() => dispatch({ type: "undo" })}>Undo</button>
        <button onClick={() => dispatch({ type: "redo" })}>Redo</button>
        <button onClick={() => console.log(JSON.stringify(exportJSON(state.scope!)))}>Save</button>
      </div>
      <div className={styles.paper} ref={ref}>
        {width > 0 && height > 0 && (
          <Canvas
            className={styles.canvas}
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
                      name={route.name}
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
              </View>
              <Tool.Move />
              <Tool.Pen />
              <Tool.Circle />
              <Tool.Select />
              <Tool.Delete />
            </Context.Provider>
          </Canvas>
        )}
      </div>
    </div>
  );
};
