import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { COPY } from "~/lib/copy/copy.config";
import { HIGHLIGHT_PLAYER } from "./highlight-player.config";
import type { HighlightPlayerProps } from "./highlight-player.types";

/** Play button that opens a souvenir charm's highlight reel in a modal. */
export function HighlightPlayer({ videoUrl, title }: HighlightPlayerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const show = () => {
    setOpen(true);
    dialog.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={`${COPY.highlight.play}: ${title}`}
        className={HIGHLIGHT_PLAYER.badgeClass}
      >
        <Play size={HIGHLIGHT_PLAYER.iconSize} aria-hidden />
        {COPY.highlight.play}
      </button>
      <dialog
        ref={dialog}
        className={HIGHLIGHT_PLAYER.dialogClass}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        {/* Mounted only while open so closing stops playback and loading. */}
        {open && (
          <video src={videoUrl} controls autoPlay className="w-full rounded-lg" title={title}>
            {COPY.highlight.unsupported}
          </video>
        )}
      </dialog>
    </>
  );
}
