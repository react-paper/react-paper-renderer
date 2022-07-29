import React, { ComponentProps, FC } from "react";
import { usePaper } from "../context";

type Props = ComponentProps<"button">;

export const UndoButton: FC<Props> = (props) => {
  const [{ historyIndex }, dispatch] = usePaper();
  return (
    <button
      {...props}
      disabled={historyIndex === 0}
      onClick={() => dispatch({ type: "undo" })}
    >
      Undo
    </button>
  );
};
