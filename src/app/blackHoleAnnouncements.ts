/** Return an announcement only for the charging-to-ready transition. */
export function blackHoleChargeAnnouncement(
  wasReady: boolean,
  isReady: boolean,
  readyLabel: string,
): string {
  return !wasReady && isReady ? readyLabel : "";
}

/** Return an announcement only for an accepted warp-activation event. */
export function blackHoleWarpAnnouncement(warpActivated: boolean, warpingLabel: string): string {
  return warpActivated ? warpingLabel : "";
}
