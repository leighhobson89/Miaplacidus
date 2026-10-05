const COLLAPSED_GROUPS_KEY = "miaplacidus:v1:ui:collapsed-pane-groups:";

function preferenceKey(scope: string): string {
  return `${COLLAPSED_GROUPS_KEY}${scope}`;
}

export function readCollapsedGroupIds(scope: string): ReadonlySet<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = window.localStorage.getItem(preferenceKey(scope));
    if (!stored) return new Set();
    const value: unknown = JSON.parse(stored);
    if (Array.isArray(value) && value.every((id) => typeof id === "string")) return new Set(value);
  } catch {
    // A broken or unavailable preference store should leave groups expanded.
  }
  return new Set();
}

export function writeCollapsedGroupIds(
  scope: string,
  collapsedGroupIds: ReadonlySet<string>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(preferenceKey(scope), JSON.stringify([...collapsedGroupIds]));
  } catch {
    // Navigation remains usable when browser storage is unavailable.
  }
}
