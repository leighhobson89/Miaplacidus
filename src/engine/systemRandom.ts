/** Stable per-system random stream for saved generated content. */
export function createSystemRandom(seedText: string): () => number {
  let seed = 2_166_136_261;
  for (const character of seedText) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16_777_619) >>> 0;
  }
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
