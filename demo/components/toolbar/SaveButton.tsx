import React, { ComponentProps, FC, useCallback } from "react";
import { usePaper } from "../context";
import { exportJSON } from "./exportJSON";

type Props = ComponentProps<"button">;

export const SaveButton: FC<Props> = (props) => {
  const [state] = usePaper();

  const handleClick = useCallback(() => {
    if (state.scope) {
      const json = exportJSON(state.scope!);
      console.log(JSON.stringify(json));
    }
  }, [state.scope]);

  return (
    <button {...props} onClick={handleClick}>
      Save
    </button>
  );
};
