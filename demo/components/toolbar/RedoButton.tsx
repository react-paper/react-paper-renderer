import React, { ComponentProps, FC } from "react";
import { usePaper } from "../context";

type Props = ComponentProps<"button">;

export const RedoButton: FC<Props> = (props) => {
  const [{ history, historyIndex }, dispatch] = usePaper();
  return (
    <button
      {...props}
      disabled={historyIndex >= history.length - 1}
      onClick={() => dispatch({ type: "redo" })}
    >
      Redo
    </button>
  );
};
