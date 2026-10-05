import { describe, expect, it } from "vitest";
import { weatherParticlePosition } from "../../src/app/weatherParticleGeometry";

describe("weather particle motion geometry", () => {
  const sourceX = 3_900;
  const width = 1_280;
  const height = 720;

  it("sends rain from two viewport widths left to its source X as it falls", () => {
    expect(weatherParticlePosition("rain", sourceX, width, height, 0)).toEqual({
      x: sourceX - 2 * width,
      y: -1.5 * height,
    });
    expect(weatherParticlePosition("rain", sourceX, width, height, 1)).toEqual({
      x: sourceX,
      y: 1.5 * height,
    });
  });

  it("keeps lava on its source column while it falls from above to below the viewport", () => {
    expect(weatherParticlePosition("volcano", sourceX, width, height, 0)).toEqual({
      x: sourceX - width,
      y: -1.5 * height,
    });
    expect(weatherParticlePosition("volcano", sourceX, width, height, 1)).toEqual({
      x: sourceX - width,
      y: height,
    });
  });
});
