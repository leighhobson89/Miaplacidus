export const CURRENCY_IDS = ["usd", "eur", "gbp", "jpy", "inr", "krw", "chf", "btc"] as const;

export type CurrencyId = (typeof CURRENCY_IDS)[number];

export const CURRENCY_SYMBOLS: Readonly<Record<CurrencyId, string>> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  jpy: "¥",
  inr: "₹",
  krw: "₩",
  chf: "₣",
  btc: "₿",
};

export const CURRENCY_CODES: Readonly<Record<CurrencyId, string>> = {
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
  jpy: "JPY",
  inr: "INR",
  krw: "KRW",
  chf: "CHF",
  btc: "BTC",
};

export function isCurrencyId(value: unknown): value is CurrencyId {
  return CURRENCY_IDS.includes(value as CurrencyId);
}
