import React, { FC } from "react";
import { Layer } from "react-paper-renderer";
import { Route } from "./types";
import { usePaper } from "../context";
import { Items } from "../items";

type Props = {
  route: Route;
  index: number;
};

export const RouteLayer: FC<Props> = ({ route, index }) => {
  const [state] = usePaper();
  return (
    <Layer
      id={route.id}
      key={route.id}
      name={route.name}
      active={state.routeIndex === index}
      visible={!!state.image}
    >
      {route.items.map((item) => {
        const Item = Items[item.type];
        return <Item {...item} id={item.id} key={item.id} selected={state.selection === item.id} />;
      })}
    </Layer>
  );
};
