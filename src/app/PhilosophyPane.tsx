import { useEffect, useRef } from "react";
import { PHILOSOPHY_IDS } from "../content/ids";
import { PHILOSOPHY_ABILITY_RESEARCH_COST, PHILOSOPHY_PATHS } from "../content/philosophy";
import { checkPreconditions } from "../engine/commands";
import { philosophyRepeatablePrice } from "../engine/philosophy";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { philosophyText } from "../i18n/philosophyMessages";
import { starshipText } from "../i18n/starshipMessages";
import { formatNumber } from "./numberFormatting";
import { InfoTooltip } from "./InfoTooltip";
import { PhilosophyPathArtwork } from "./PhilosophyPathArtwork";
import { CelestialIllustration } from "./CelestialIllustration";
import { PageArtworkRow } from "./PageArtworkRow";

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
  const headerTooltipContent = copy.headerHelp.map((paragraph, index) => (
    <span
      key={index}
      style={{ display: "block", marginTop: index > 0 ? "0.65rem" : undefined }}
    >
      {paragraph}
    </span>
  ));
  const philosophyId = state.permanent.philosophyId;
  const choiceDialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = choiceDialogRef.current;
    if (state.run.philosophyChoicePending && dialog && !dialog.open) {
      const activeElement = document.activeElement;
      returnFocusTarget.current =
        activeElement instanceof HTMLElement &&
        activeElement !== document.body &&
        activeElement !== document.documentElement
          ? activeElement
          : document.getElementById("telescope-study-stars");
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
                    requestAnimationFrame(() => {
                      if (returnFocusTarget.current?.isConnected) {
                        returnFocusTarget.current.focus();
                      }
                    });
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
          <div className="economy-page-title-row">
            <h2 className="game-page-title">{copy.title}</h2>
            <InfoTooltip
              id="philosophy-page-help"
              label={`${copy.title} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={headerTooltipContent}
              testId="philosophy-page-help"
            />
          </div>
          <p>{copy.headerDescription}</p>
          <p>{copy.intro}</p>
        </div>
        <PageArtworkRow>
          <CelestialIllustration kind="star-system" />
        </PageArtworkRow>
      </section>
    );
  }

  const path = PHILOSOPHY_PATHS[philosophyId];
  const ability = copy.abilities[path.abilityId];
  const abilityCommand = { type: "philosophy.ability.purchase" as const };
  const abilityAvailable = checkPreconditions(state, abilityCommand).ok;
  const abilityUnavailable = !state.run.philosophyAbilityActive && !abilityAvailable;
  const abilityReasonId = "philosophy-ability-purchase-reason";

  return (
    <section className="economy-section philosophy-section" data-testid="philosophy-pane">
      <div className="economy-section-heading philosophy-path-heading">
        <div>
          <p className="eyebrow">{copy.title}</p>
          <div className="economy-page-title-row">
            <h2 className="game-page-title">{copy.paths[philosophyId].name}</h2>
            <InfoTooltip
              id="philosophy-page-help"
              label={`${copy.title} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={headerTooltipContent}
              testId="philosophy-page-help"
            />
          </div>
          <p>{copy.headerDescription}</p>
          <p>{copy.paths[philosophyId].summary}</p>
        </div>
      </div>
      <PageArtworkRow>
        <PhilosophyPathArtwork id={philosophyId} />
      </PageArtworkRow>
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
          aria-describedby={abilityUnavailable ? abilityReasonId : undefined}
          onClick={() => store.dispatch(abilityCommand)}
        >
          {state.run.philosophyAbilityActive ? copy.active : copy.abilityAction}
        </button>
        {abilityUnavailable && (
          <p className="control-reason" id={abilityReasonId}>
            {copy.unavailable}
          </p>
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
                aria-describedby={
                  !available ? `philosophy-repeatable-${repeatableId}-reason` : undefined
                }
                onClick={() => store.dispatch(command)}
              >
                {copy.buy}
              </button>
              {!available && (
                <p className="control-reason" id={`philosophy-repeatable-${repeatableId}-reason`}>
                  {copy.unavailable}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
