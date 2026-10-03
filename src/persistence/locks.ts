export async function acquireSlotLock(slotId: string): Promise<(() => void) | null> {
  if (typeof navigator === "undefined" || !("locks" in navigator)) return null;
  let releaseHold = () => {};
  let signalAcquired: (acquired: boolean) => void = () => {};
  const acquired = new Promise<boolean>((resolve) => {
    signalAcquired = resolve;
  });
  const hold = new Promise<void>((resolve) => {
    releaseHold = resolve;
  });
  void navigator.locks
    .request("miaplacidus:slot:" + slotId, { ifAvailable: true }, async (lock) => {
      signalAcquired(lock !== null);
      if (lock) await hold;
    })
    .catch(() => signalAcquired(false));
  if (!(await acquired)) return null;
  return releaseHold;
}
