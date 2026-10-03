export interface StorageAdapter {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();
  constructor(private readonly quotaChars = Infinity) {}
  get length(): number {
    return this.values.size;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    const old = this.values.get(key)?.length ?? 0;
    const total =
      [...this.values.values()].reduce((size, entry) => size + entry.length, 0) -
      old +
      value.length;
    if (total > this.quotaChars) {
      const error = new Error("Storage quota exceeded.");
      error.name = "QuotaExceededError";
      throw error;
    }
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

export function browserStorage(): StorageAdapter {
  try {
    const storage = window.localStorage;
    const probe = "miaplacidus:v1:probe";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    throw new Error("Browser storage is unavailable.");
  }
}
