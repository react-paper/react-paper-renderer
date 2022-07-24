import React, { useCallback } from 'react';
import { Tool } from 'react-paper-renderer';
import { useReducer } from '../context';

const NAME = 'Delete';

export const Delete: React.FC = () => {
  const [state, dispatch] = useReducer();

  const handleMouseDown = useCallback(
    (event: paper.ToolEvent) => {
      if (!state.scope) return;

      const hit = state.scope.project.hitTest(event.point, {
        fill: true,
        segments: true,
        stroke: true,
        tolerance: 15,
      });
      if (!hit || !hit.item) return;

      dispatch({ type: 'removeItem', index: hit.item.index });
    },
    [dispatch, state.scope]
  );

  return (
    <Tool
      name={NAME}
      active={state.tool === NAME}
      onMouseDown={handleMouseDown}
    />
  );
};
