import React, { useCallback, useRef } from 'react';
import { Tool } from 'react-paper-renderer';
import { ItemName } from '../items';
import { useReducer } from '../context';
import { createItem, defaultProps } from './utils/item';

const NAME = 'Pen';

export const Pen: React.FC = () => {
  const [state, dispatch] = useReducer();
  const path = useRef<paper.Path>();

  const handleMouseDown = useCallback(() => {
    if (state.selection !== null) {
      dispatch({ type: 'setSelection', selection: undefined });
    }
  }, [dispatch, state.selection]);

  const handleMouseDrag = useCallback(
    (event: paper.ToolEvent) => {
      if (state.scope) {
        if (!path.current) {
          path.current = new state.scope.Path({
            ...defaultProps,
            segments: [event.point],
          });
        } else {
          path.current.add(event.point);
        }
      }
    },
    [state.scope]
  );

  const handleMouseUp = useCallback(() => {
    if (state.image && path.current) {
      path.current.simplify(10);
      dispatch({
        type: 'addItem',
        item: createItem(ItemName.Path, {
          pathData: path.current.pathData,
        }),
      });
      path.current.remove();
      path.current = undefined;
    }
  }, [dispatch, state.image]);

  return (
    <Tool
      name={NAME}
      active={state.tool === NAME}
      onMouseDown={handleMouseDown}
      onMouseDrag={handleMouseDrag}
      onMouseUp={handleMouseUp}
    />
  );
};
