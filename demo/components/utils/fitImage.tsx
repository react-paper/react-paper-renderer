import { Image } from "../types";

export const fitImage = (view: paper.View, image: Image) => {
  const { viewSize } = view;
  const wr = viewSize.width / image.width;
  const hr = viewSize.height / image.height;
  const zoom = wr < hr ? wr : hr;
  const iw = image.width * zoom;
  const ih = image.height * zoom;
  const x = (viewSize.width - iw) / 2 / zoom;
  const y = (viewSize.height - ih) / 2 / zoom;
  view.scale(zoom / view.zoom);
  view.translate(
    x - view.matrix.tx / view.zoom,
    y - view.matrix.ty / view.zoom
  );
};
