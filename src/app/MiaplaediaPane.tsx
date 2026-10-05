import { Fragment } from "react";
import type { LocaleId } from "../content/ids";
import { cosmicopediaArticles, type CosmicopediaSectionId } from "../i18n/cosmicopediaMessages";
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

export function MiaplaediaPane({
  locale,
  sectionId,
}: {
  readonly locale: LocaleId;
  readonly sectionId: CosmicopediaSectionId;
}) {
  const entries = cosmicopediaArticles(locale, sectionId);
  const heading = settingsSectionName(locale, sectionNameIds[sectionId]);
  const headingId = `miaplaedia-heading-${sectionId}`;

  return (
    <section className="miaplaedia-page" aria-labelledby={headingId}>
      <h3 id={headingId}>{heading}</h3>
      <div className="miaplaedia-articles">
        {entries.map((entry, index) => (
          <article className="miaplaedia-entry" key={`${sectionId}-${index}`}>
            <h4>{entry.heading}</h4>
            <div className="miaplaedia-entry-body">
              {entry.body
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
}
