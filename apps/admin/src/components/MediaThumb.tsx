import type { ReactElement } from "react";
import type { MediaItem } from "../lib/api";

export function isImageMedia(media: MediaItem): boolean {
  return media.mime.startsWith("image/");
}

export default function MediaThumb({
  media,
}: {
  media: MediaItem;
}): ReactElement {
  if (!isImageMedia(media) || media.url === null) {
    return (
      <span className="admin-media-pdf" aria-hidden="true">
        PDF
      </span>
    );
  }
  return <img src={media.url} alt="" loading="lazy" />;
}
