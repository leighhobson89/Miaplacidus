import type { SpaceWeatherCondition } from "../content/space";

export type AnimatedSpaceWeather = Extract<SpaceWeatherCondition, "rain" | "heavyRain" | "volcano">;

export interface WeatherParticlePosition {
  readonly x: number;
  readonly y: number;
}

/** Source-compatible travel path for one weather drop, expressed in CSS pixels. */
export function weatherParticlePosition(
  weather: AnimatedSpaceWeather,
  sourceX: number,
  width: number,
  height: number,
  progress: number,
): WeatherParticlePosition {
  if (weather === "volcano") {
    return { x: sourceX - width, y: -height * 1.5 + progress * height * 2.5 };
  }

  return {
    x: sourceX - width * 2 + progress * width * 2,
    y: -height * 1.5 + progress * height * 3,
  };
}
