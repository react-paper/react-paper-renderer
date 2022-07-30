import React, { useEffect, useRef } from "react";
import { FiberRoot } from "react-reconciler";
import { ConcurrentRoot } from "react-reconciler/constants";
import { PaperScope } from "paper/dist/paper-core";

import { Renderer } from "./Renderer";
import { useEffectOnce } from "./useEffectOnce";

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

  useEffectOnce(() => {
    // create
    if (canvas.current instanceof HTMLCanvasElement) {
      scope.current = new PaperScope();
      Object.assign(scope.current.settings, settings);
      scope.current.setup(canvas.current);
      root.current = Renderer.createContainer(
        scope.current,
        ConcurrentRoot,
        null,
        false,
        null,
        "",
        console.error,
        null
      );
      if (typeof onScopeReady === "function") {
        onScopeReady(scope.current);
      }
    }

    // destroy
    return () => {
      Renderer.updateContainer(null, root.current, null, () => null);
      canvas.current = null;
      scope.current = null;
      root.current = null;
    };
  });

  // update
  useEffect(() => {
    if (scope.current && root.current) {
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
