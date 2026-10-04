import { createStarCatalogue, GALAXY_SEED_DEFAULT } from "../content";
import { MEGASTRUCTURE_TRACKS, TECHNOLOGY_BY_ID } from "../content/technology";
import { checkPreconditions } from "../engine/commands";
import {
  megastructureResearchAvailable,
  miaplacidusForceFieldLevel,
} from "../engine/megastructures";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { TECHNOLOGY_NAMES } from "../content/technologyNames";
import { megastructureText } from "../i18n/megastructureMessages";

interface MegastructurePaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function starName(systemId: string): string {
  return (
    createStarCatalogue(GALAXY_SEED_DEFAULT).find((star) => star.id === systemId)?.name ?? systemId
  );
}

export function MegastructurePane({ state, store }: MegastructurePaneProps) {
  const locale = state.settings.locale;
  const text = megastructureText(locale);
  const progress = state.permanent.megastructures;
  const records = progress.ancientManuscripts;
  const forceFieldLevel = miaplacidusForceFieldLevel(state);
  const number = (value: number) =>
    new Intl.NumberFormat(locale, {
      notation: state.settings.notation === "scientific" ? "scientific" : "standard",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <section className="economy-section megastructure-pane" data-testid="megastructure-pane">
      <div className="economy-section-heading">
        <p className="eyebrow">05 / {text.title}</p>
        <h2>{text.title}</h2>
        <p>{text.introduction}</p>
        <p data-testid="megastructure-force-field">
          {text.forceField.replace("{level}", String(forceFieldLevel))}
        </p>
      </div>

      {records.length === 0 ? (
        <p className="control-reason">{text.noManuscripts}</p>
      ) : (
        <div className="megastructure-manuscripts" aria-label={text.title}>
          {records.map((record) => {
            const manuscript = starName(record.manuscriptSystemId);
            const factory = starName(record.factorySystemId);
            const message = record.reported
              ? text.manuscriptReported
                  .replace("{number}", String(record.position))
                  .replace("{manuscript}", manuscript)
                  .replace("{structure}", text.structureNames[record.megastructureId])
                  .replace("{factory}", factory)
              : text.manuscriptPending
                  .replace("{number}", String(record.position))
                  .replace("{manuscript}", manuscript);
            return (
              <p key={record.position} data-testid={`manuscript-${record.position}`}>
                {message}
              </p>
            );
          })}
        </div>
      )}

      <div className="megastructure-track-grid">
        {records
          .filter((record) => record.reported)
          .map((record) => {
            const track = MEGASTRUCTURE_TRACKS[record.megastructureId];
            const completed = track.filter((id) => progress.researchedTechnologyIds.includes(id));
            const nextStage = track.find((id) => !progress.researchedTechnologyIds.includes(id));
            const atFactory = state.run.space.currentSystemId === record.factorySystemId;
            const settled = state.permanent.settledSystemIds.includes(record.factorySystemId);
            const available =
              nextStage !== undefined &&
              megastructureResearchAvailable(state, nextStage) &&
              checkPreconditions(state, { type: "economy.research", technologyId: nextStage }).ok;
            const stageDefinition = nextStage ? TECHNOLOGY_BY_ID[nextStage] : undefined;
            return (
              <article
                className="economy-card megastructure-track"
                key={record.megastructureId}
                data-testid={`megastructure-track-${record.megastructureId}`}
              >
                <h3>{text.structureNames[record.megastructureId]}</h3>
                <p>{text.stageProgress.replace("{count}", String(completed.length))}</p>
                <ol>
                  {track.map((technologyId, index) => {
                    const done = progress.researchedTechnologyIds.includes(technologyId);
                    return (
                      <li key={technologyId}>
                        <span>
                          {text.stage.replace("{number}", String(index + 1))}:{" "}
                          {TECHNOLOGY_NAMES[technologyId][locale]}
                        </span>
                        {done && <span className="status-pill">{text.researched}</span>}
                      </li>
                    );
                  })}
                </ol>
                {nextStage && stageDefinition ? (
                  <>
                    {!settled ? (
                      <p className="control-reason">
                        {text.notSettled.replace("{factory}", starName(record.factorySystemId))}
                      </p>
                    ) : !atFactory ? (
                      <p className="control-reason">{text.notAtFactory}</p>
                    ) : (
                      <p
                        className="megastructure-next-stage"
                        data-testid="megastructure-next-stage"
                      >
                        {text.stage.replace("{number}", String(completed.length + 1))}:{" "}
                        {TECHNOLOGY_NAMES[nextStage][locale]}
                        {" · "}
                        {text.researchCost.replace("{cost}", number(stageDefinition.price))}
                      </p>
                    )}
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!available}
                      onClick={() =>
                        store.dispatch({ type: "economy.research", technologyId: nextStage })
                      }
                    >
                      {text.researchAction}
                    </button>
                  </>
                ) : (
                  <span className="status-pill">{text.researched}</span>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
}
