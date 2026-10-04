import { useEffect, useRef, useState } from "react";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { miaplacidusStoryText } from "../i18n/miaplacidusStoryMessages";

interface MiaplacidusEndgameStoryProps {
  readonly state: GameState;
  readonly store: GameStore;
}

export function MiaplacidusEndgameStory({ state, store }: MiaplacidusEndgameStoryProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [page, setPage] = useState(0);
  const pending = state.permanent.megastructures.miaplacidusStoryPending;
  const text = miaplacidusStoryText(state.settings.locale);

  useEffect(() => {
    const element = dialog.current;
    if (pending && element && !element.open) element.showModal();
    if (!pending && element?.open) element.close();
    return () => {
      if (element?.open) element.close();
    };
  }, [pending]);

  if (!pending) return null;

  const complete = page === text.pages.length - 1;
  return (
    <dialog
      ref={dialog}
      className="miaplacidus-story-dialog"
      aria-labelledby="miaplacidus-story-title"
      aria-describedby="miaplacidus-story-page"
      data-testid="miaplacidus-endgame-story"
      onCancel={(event) => event.preventDefault()}
    >
      <p className="eyebrow">
        {text.page
          .replace("{current}", String(page + 1))
          .replace("{total}", String(text.pages.length))}
      </p>
      <h2 id="miaplacidus-story-title">{text.title}</h2>
      <div className={`miaplacidus-story-scene scene-${page + 1}`} aria-hidden="true">
        <span className="miaplacidus-story-world" />
        <span className="miaplacidus-story-rift" />
      </div>
      <p id="miaplacidus-story-page">{text.pages[page]}</p>
      <div className="miaplacidus-story-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            if (complete) {
              setPage(0);
              store.dispatch({ type: "meta.miaplacidus-story.acknowledge" });
            } else setPage((current) => Math.min(current + 1, text.pages.length - 1));
          }}
        >
          {text.continue}
        </button>
      </div>
    </dialog>
  );
}
