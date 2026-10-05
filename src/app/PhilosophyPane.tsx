import { useEffect, useRef } from "react";
import { PHILOSOPHY_IDS } from "../content/ids";
import { PHILOSOPHY_ABILITY_RESEARCH_COST, PHILOSOPHY_PATHS } from "../content/philosophy";
import { checkPreconditions } from "../engine/commands";
import { philosophyRepeatablePrice } from "../engine/philosophy";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { philosophyText } from "../i18n/philosophyMessages";
import { formatNumber } from "./numberFormatting";
import { PhilosophyPathArtwork } from "./PhilosophyPathArtwork";

interface PhilosophyPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function number(state: GameState, value: number): string {
  return formatNumber(state.settings.locale, value, 0, state.settings.notation);
}

export function PhilosophyPane({ state, store }: PhilosophyPaneProps) {
  const locale = state.settings.locale;
  const copy = philosophyText(locale);
  const philosophyId = state.permanent.philosophyId;
  const choiceDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = choiceDialogRef.current;
    if (state.run.philosophyChoicePending && dialog && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("#philosophy-choice-title")?.focus();
    }
    if (!state.run.philosophyChoicePending && dialog?.open) dialog.close();
  }, [state.run.philosophyChoicePending]);

  if (state.run.philosophyChoicePending && philosophyId === null) {
    return (
      <dialog
        ref={choiceDialogRef}
        className="philosophy-choice-dialog"
        aria-labelledby="philosophy-choice-title"
        data-testid="philosophy-choice"
        onCancel={(event) => event.preventDefault()}
      >
        <p className="eyebrow">{copy.title}</p>
        <h2 id="philosophy-choice-title" tabIndex={-1}>
          {copy.choiceTitle}
        </h2>
        <p>{copy.choicePrompt}</p>
        <div className="philosophy-choice-grid">
          {PHILOSOPHY_IDS.map((id) => {
            const path = PHILOSOPHY_PATHS[id];
            const ability = copy.abilities[path.abilityId];
            return (
              <article className="philosophy-choice-card" key={id}>
                <div className="philosophy-choice-card-heading">
                  <PhilosophyPathArtwork id={id} />
                  <div>
                    <h3>{copy.paths[id].name}</h3>
                    <p>{copy.paths[id].summary}</p>
                  </div>
                </div>
                <h4>{ability.name}</h4>
                <p>{ability.effect}</p>
                <details className="philosophy-choice-repeatables">
                  <summary>{copy.repeatables}</summary>
                  <ul>
                    {path.repeatables.map((repeatableId) => (
                      <li key={repeatableId}>
                        <strong>{copy.upgrades[repeatableId].name}:</strong>{" "}
                        {copy.upgrades[repeatableId].effect}
                      </li>
                    ))}
                  </ul>
                </details>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    choiceDialogRef.current?.close();
                    store.dispatch({ type: "philosophy.select", philosophyId: id });
                  }}
                >
                  {copy.paths[id].name}
                </button>
              </article>
            );
          })}
        </div>
      </dialog>
    );
  }

  if (philosophyId === null) {
    return (
      <section className="economy-section philosophy-section" data-testid="philosophy-pane">
        <div className="economy-section-heading">
          <p className="eyebrow">{copy.title}</p>
          <h2>{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
      </section>
    );
  }

  const path = PHILOSOPHY_PATHS[philosophyId];
  const ability = copy.abilities[path.abilityId];
  const abilityCommand = { type: "philosophy.ability.purchase" as const };
  const abilityAvailable = checkPreconditions(state, abilityCommand).ok;

  return (
    <section className="economy-section philosophy-section" data-testid="philosophy-pane">
      <div className="economy-section-heading philosophy-path-heading">
        <PhilosophyPathArtwork id={philosophyId} />
        <div>
          <p className="eyebrow">{copy.title}</p>
          <h2>{copy.paths[philosophyId].name}</h2>
          <p>{copy.paths[philosophyId].summary}</p>
        </div>
      </div>
      <article className="economy-card philosophy-ability" data-philosophy-ability={path.abilityId}>
        <h3>
          {copy.ability}: {ability.name}
        </h3>
        <p>{ability.effect}</p>
        <p>
          {state.run.philosophyAbilityActive
            ? copy.active
            : `${copy.nextCost}: ${number(state, PHILOSOPHY_ABILITY_RESEARCH_COST)} ${copy.researchShort}`}
        </p>
        <button
          type="button"
          className="secondary-button"
          disabled={state.run.philosophyAbilityActive || !abilityAvailable}
          onClick={() => store.dispatch(abilityCommand)}
        >
          {state.run.philosophyAbilityActive ? copy.active : copy.buy}
        </button>
        {!state.run.philosophyAbilityActive && !abilityAvailable && (
          <p className="control-reason">{copy.unavailable}</p>
        )}
      </article>
      <div className="economy-section-heading">
        <h3>{copy.repeatables}</h3>
      </div>
      <div className="economy-card-grid">
        {path.repeatables.map((repeatableId) => {
          const definition = copy.upgrades[repeatableId];
          const rank = state.permanent.philosophyRepeatableRanks[repeatableId];
          const cost = philosophyRepeatablePrice(state, repeatableId);
          const command = { type: "philosophy.repeatable.purchase" as const, repeatableId };
          const available = checkPreconditions(state, command).ok;
          return (
            <article
              className="economy-card philosophy-repeatable"
              key={repeatableId}
              data-philosophy-repeatable={repeatableId}
            >
              <h4>{definition.name}</h4>
              <p>{definition.effect}</p>
              <p>
                {copy.rank}: {number(state, rank)}
              </p>
              <p>
                {copy.nextCost}: {number(state, cost)} {copy.researchShort}
              </p>
              <button
                type="button"
                className="secondary-button"
                disabled={!available}
                onClick={() => store.dispatch(command)}
              >
                {copy.buy}
              </button>
              {!available && <p className="control-reason">{copy.unavailable}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
