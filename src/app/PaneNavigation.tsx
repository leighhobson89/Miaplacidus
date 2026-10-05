import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { readCollapsedGroupIds, writeCollapsedGroupIds } from "./navigationPreferences";

export interface PaneNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly panelId?: string;
  readonly sourceOptionId?: `option${number}`;
  readonly groupId?: string;
  readonly groupLabel?: string;
}

interface PaneNavigationSection {
  readonly id?: string;
  readonly label?: string;
  readonly items: readonly PaneNavigationItem[];
}

function groupItems(items: readonly PaneNavigationItem[]): readonly PaneNavigationSection[] {
  const sections: PaneNavigationSection[] = [];
  for (const item of items) {
    const previous = sections.at(-1);
    if (item.groupId && previous?.id === item.groupId) {
      sections[sections.length - 1] = {
        ...previous,
        items: [...previous.items, item],
      };
    } else if (previous && !item.groupId && previous.id === undefined) {
      sections[sections.length - 1] = {
        ...previous,
        items: [...previous.items, item],
      };
    } else {
      sections.push({
        ...(item.groupId ? { id: item.groupId, label: item.groupLabel } : {}),
        items: [item],
      });
    }
  }
  return sections;
}

export function PaneNavigation({
  items,
  selectedId,
  label,
  storageScope = "global",
  attentionIds,
  attentionLabel,
  attentionLabelsById,
  onSelect,
}: {
  readonly items: readonly PaneNavigationItem[];
  readonly selectedId: string;
  readonly label: string;
  readonly storageScope?: string;
  readonly attentionIds?: ReadonlySet<string>;
  readonly attentionLabel?: string;
  readonly attentionLabelsById?: ReadonlyMap<string, string>;
  readonly onSelect: (id: string) => void;
}) {
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<ReadonlySet<string>>(() =>
    readCollapsedGroupIds(storageScope),
  );
  const pendingKeyboardFocusId = useRef<string | null>(null);
  const sections = groupItems(items);
  const hasCollapsibleSections = sections.some((section) => section.id !== undefined);

  useLayoutEffect(() => {
    const pendingId = pendingKeyboardFocusId.current;
    if (!pendingId) return;
    pendingKeyboardFocusId.current = null;
    if (pendingId !== selectedId) return;
    document.getElementById(`tab-${pendingId}`)?.focus();
  }, [selectedId]);

  useEffect(() => {
    if (!hasCollapsibleSections || typeof window === "undefined") return;
    writeCollapsedGroupIds(storageScope, collapsedGroupIds);
  }, [collapsedGroupIds, hasCollapsibleSections, storageScope]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!(event.target instanceof HTMLElement) || !event.target.matches('[role="tab"]')) return;
    const visibleTabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).filter((tab) => !tab.closest<HTMLElement>("[hidden]"));
    const currentIndex = visibleTabs.indexOf(event.target as HTMLButtonElement);
    if (currentIndex < 0 || visibleTabs.length === 0) return;

    let targetIndex: number | undefined;
    if (event.key === "ArrowRight") targetIndex = (currentIndex + 1) % visibleTabs.length;
    else if (event.key === "ArrowLeft")
      targetIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
    else if (event.key === "Home") targetIndex = 0;
    else if (event.key === "End") targetIndex = visibleTabs.length - 1;
    if (targetIndex === undefined) return;

    event.preventDefault();
    const target = visibleTabs[targetIndex];
    if (!target) return;
    const id = target.id.replace(/^tab-/, "");
    if (id !== selectedId) pendingKeyboardFocusId.current = id;
    onSelect(id);
    if (id === selectedId) target.focus();
  }

  function toggleGroup(groupId: string): void {
    setCollapsedGroupIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  return (
    <nav className="pane-nav-scroll" aria-label={label}>
      <div className="pane-nav" onKeyDown={handleKeyDown}>
        {sections.map((section, sectionIndex) => {
          const collapsed = section.id ? collapsedGroupIds.has(section.id) : false;
          const listId = section.id ? `pane-nav-group-${section.id}` : undefined;
          const selectedInSection = section.items.some((item) => item.id === selectedId);
          return (
            <div
              className={section.id ? "pane-nav-group" : "pane-nav-ungrouped"}
              key={section.id ?? `ungrouped-${sectionIndex}`}
            >
              {section.id && section.label && (
                <button
                  className="pane-nav-group-heading"
                  type="button"
                  aria-expanded={!collapsed}
                  aria-controls={listId}
                  onClick={() => toggleGroup(section.id!)}
                >
                  <span>{section.label}</span>
                  <span className="pane-nav-group-arrow" aria-hidden="true">
                    {collapsed ? "▸" : "▾"}
                  </span>
                </button>
              )}
              <div
                id={listId}
                className="pane-nav-group-tabs"
                role="tablist"
                aria-label={section.label ?? label}
                hidden={collapsed}
              >
                {section.items.map((item, index) => {
                  const selected = item.id === selectedId;
                  const hasNewAttention = attentionIds?.has(item.id) ?? false;
                  const statusLabel = attentionLabelsById?.get(item.id);
                  const attentionReasons = [
                    hasNewAttention ? attentionLabel : undefined,
                    statusLabel,
                  ].filter((value): value is string => Boolean(value));
                  const badgeLabel = statusLabel ?? (hasNewAttention ? attentionLabel : undefined);
                  return (
                    <Fragment key={item.id}>
                      <button
                        id={`tab-${item.id}`}
                        className={`pane-nav-tab${selected ? " is-selected" : ""}`}
                        data-source-option-id={item.sourceOptionId}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={item.panelId ?? `panel-${item.id}`}
                        aria-label={
                          attentionReasons.length
                            ? `${item.label}, ${attentionReasons.join(", ")}`
                            : undefined
                        }
                        tabIndex={selected || (!selectedInSection && index === 0) ? 0 : -1}
                        onClick={() => onSelect(item.id)}
                      >
                        {item.label}
                        {badgeLabel && (
                          <span className="attention-badge" aria-hidden="true">
                            {badgeLabel}
                          </span>
                        )}
                      </button>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
