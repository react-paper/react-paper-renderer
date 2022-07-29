import React, { ComponentProps, FC } from "react";
import { UndoButton } from "./UndoButton";
import { RedoButton } from "./RedoButton";
import { SaveButton } from "./SaveButton";
import { ToolButton } from "./ToolButton";
import { ToolName } from "../tools";

type Props = ComponentProps<"div">;

export const Toolbar: FC<Props> = (props) => {
  return (
    <div {...props}>
      <ToolButton tool={ToolName.Move} />
      <ToolButton tool={ToolName.Pen} />
      <ToolButton tool={ToolName.Circle} />
      <ToolButton tool={ToolName.Select} />
      <ToolButton tool={ToolName.Delete} />
      <span>|</span>
      <UndoButton />
      <RedoButton />
      <span>|</span>
      <SaveButton />
    </div>
  );
};
