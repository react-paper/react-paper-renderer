import React, { FC, ComponentProps, useEffect, useRef } from 'react';
import { FiberRoot } from 'react-reconciler';
import { LegacyRoot } from 'react-reconciler/constants';
import { PaperScope } from 'paper/dist/paper-core';
import { Renderer } from './Renderer';

const canvasStyles = {
  width: '100%',
  height: '100%',
};

type Props = ComponentProps<'canvas'> & {
  width: number;
  height: number;
  settings?: paper.PaperScopeSettings;
  onScopeReady?: (scope: paper.PaperScope) => void;
};

export const Canvas: FC<Props> = ({
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
    if (canvas.current instanceof HTMLCanvasElement) {
      // create paper scope
      scope.current = new PaperScope();
      // apply settings
      Object.assign(scope.current.settings, settings);
      // setup empty project and view
      scope.current.setup(canvas.current);
      // create renderer
      root.current = Renderer.createContainer(
        scope.current,
        LegacyRoot,
        null,
        false,
        false,
        '',
        (error) => console.error(error),
        null
      );
      // scope ready
      if (typeof onScopeReady === 'function') {
        onScopeReady(scope.current);
      }
    }
    // destroy
    return () => {
      if (root.current) {
        Renderer.updateContainer(null, root.current, null);
      }
      canvas.current = null;
      scope.current = null;
      root.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update
  useEffect(() => {
    if (scope.current && root.current) {
      Renderer.updateContainer(children, root.current, null);
    }
  }, [children]);

  // resize
  useEffect(() => {
    if (scope.current) {
      scope.current.view.viewSize = new scope.current.Size(width, height);
    }
  }, [width, height]);

  return <canvas {...other} ref={canvas} style={canvasStyles} resize="true" />;
};

declare global {
  type HTMLAttributes<T> = React.HTMLAttributes<T>;
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
      height?: number | string;
      width?: number | string;
      resize?: string; // allow resize="true" on canvas
    }
  }
}
