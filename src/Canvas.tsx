import React, { useEffect, useRef } from "react";
import { FiberRoot } from "react-reconciler";
import { PaperScope } from "paper/dist/paper-core";

import { Renderer } from "./Renderer";

export type Props = React.ComponentProps<"canvas"> & {
  width: number;
  height: number;
  settings?: paper.PaperScopeSettings;
  onScopeReady?: (scope: paper.PaperScope) => void;
};

export const Canvas: React.FC<Props> = ({
  children,
  width,
  height,
  settings,
  onScopeReady,
  ...other
}) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const scope = useRef<paper.PaperScope | null>(null);
  const root = useRef<FiberRoot | null>(null);

  useEffect(() => {
    // create
    if (canvas.current instanceof HTMLCanvasElement) {
      //console.log("create");
      scope.current = new PaperScope();
      // settings
      Object.assign(scope.current.settings, settings);
      // setup project and view
      scope.current.setup(canvas.current);
      // create renderer
      root.current = Renderer.createContainer(scope.current, 0, false, null);
      // scope ready
      if (typeof onScopeReady === "function") {
        onScopeReady(scope.current);
      }
    }

    // destroy
    return () => {
      //console.log("destroy", root.current);
      if (root.current) {
        Renderer.updateContainer(null, root.current, null, () => null);
      }
      canvas.current = null;
      scope.current = null;
      root.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update
  useEffect(() => {
    //console.log("update", scope.current, root.current);
    if (scope.current && root.current) {
      //console.log("update b", scope.current, root.current);
      Renderer.updateContainer(children, root.current, null, () => null);
    }
  }, [children]);

  // resize
  useEffect(() => {
    if (scope.current) {
      scope.current.view.viewSize = new scope.current.Size(width, height);
    }
  }, [width, height]);

  return <canvas {...other} ref={canvas} />;
};

/**
 * Add custom paper.js attributes to <canvas> element
 *
 * @see http://paperjs.org/tutorials/getting-started/working-with-paper-js/#canvas-configuration
 */
declare global {
  type HTMLAttributes<T> = React.HTMLAttributes<T>;
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
      height?: number | string;
      width?: number | string;
      resize?: "true";
      hidpi?: "off";
      keepalive?: "true";
    }
  }
}
