import { Item } from "./items";

export type Image = {
  id: string;
  url: string;
  width: number;
  height: number;
  routes: Route[];
};

export type Route = {
  id: string;
  name: string;
  items: Item[];
};
