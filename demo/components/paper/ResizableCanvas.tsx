import React, { FC } from 'react';
import { useElementSize } from 'usehooks-ts';

import { Canvas } from '../../../src/Canvas';
import { Layer, Rectangle, View } from '../../../src/Items';

const styles = {
  div: { width: '100%', height: '100%', border: '2px solid green' },
};

type Props = React.ComponentProps<'canvas'> & {
  settings?: paper.PaperScopeSettings;
  scopeRef?: React.MutableRefObject<paper.PaperScope | null>;
  onScopeReady?: (scope: paper.PaperScope) => void;
};

export const ResizableCanvas: FC<Props> = (props) => {
  const [ref, { width, height }] = useElementSize();
  console.log({ width, height });

  return (
    <div style={styles.div} ref={ref}>
      <Canvas {...props} width={width || 800} height={height || 600} />
    </div>
  );
};
