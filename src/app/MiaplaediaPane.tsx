import { Fragment, memo } from "react";
import type { LocaleId } from "../content/ids";
import {
  cosmicopediaArticles,
  cosmicopediaDescription,
  type CosmicopediaSectionId,
} from "../i18n/cosmicopediaMessages";
import { settingsSectionName } from "../i18n/settingsMessages";

const sectionNameIds: Record<CosmicopediaSectionId, Parameters<typeof settingsSectionName>[1]> = {
  getStarted: "getStarted",
  story: "story",
  conceptsEarly: "conceptsEarly",
  conceptsMid: "conceptsMid",
  conceptsLate: "conceptsLate",
  endGoal: "endGoal",
  philosophies: "philosophies",
};

const tutorialTargets: Partial<Record<CosmicopediaSectionId, string>> = {
  getStarted: "miaplaedia-get-started",
  story: "miaplaedia-story",
  conceptsEarly: "miaplaedia-concepts-early",
  conceptsMid: "miaplaedia-concepts-mid",
  conceptsLate: "miaplaedia-concepts-late",
};

export const MiaplaediaPane = memo(function MiaplaediaPane({
  locale,
  sectionId,
}: {
  readonly locale: LocaleId;
  readonly sectionId: CosmicopediaSectionId;
}) {
  const entries = cosmicopediaArticles(locale, sectionId);
  const heading = settingsSectionName(locale, sectionNameIds[sectionId]);
  const description = cosmicopediaDescription(locale, sectionId);
  const headingId = `miaplaedia-heading-${sectionId}`;

  return (
    <section
      className="miaplaedia-page"
      aria-labelledby={headingId}
      data-tutorial-target={tutorialTargets[sectionId]}
    >
      <h2 className="game-page-title" id={headingId}>
        {heading}
      </h2>
      {description && (
        <p className="miaplaedia-page-description" data-testid="miaplaedia-page-description">
          {description}
        </p>
      )}
      <div className="miaplaedia-articles">
        {entries.map((entry, index) => (
          <article className="miaplaedia-entry" key={`${sectionId}-${index}`}>
            <h3>{entry.heading}</h3>
            <div className="miaplaedia-entry-body">
              {entry.body
                .replace(/\\n/g, "\n")
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/\r?\n{2,}/g, "<br/><br/>")
                .split(/(<br\s*\/?>)/gi)
                .map((part, partIndex) =>
                  /^<br\s*\/?>$/i.test(part) ? (
                    <br key={partIndex} />
                  ) : (
                    <Fragment key={partIndex}>{part}</Fragment>
                  ),
                )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});
