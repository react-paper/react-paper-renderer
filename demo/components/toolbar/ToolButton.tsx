import React, { ComponentProps, FC } from "react";
import { usePaper } from "../context";
import { ToolName } from "../tools";

type Props = ComponentProps<"button"> & {
  tool: ToolName;
};

export const ToolButton: FC<Props> = ({ tool, ...props }) => {
  const [state, dispatch] = usePaper();
  return (
    <button {...props} onClick={() => dispatch({ type: "setTool", tool })}>
      {tool}
      {state.tool === tool ? <span /> : null}
    </button>
  );
};
