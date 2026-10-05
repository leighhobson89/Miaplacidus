import { useEffect, useRef } from "react";
import type { SpaceWeatherCondition } from "../content/space";
import { weatherParticlePosition, type AnimatedSpaceWeather } from "./weatherParticleGeometry";

const PARTICLE_LIFETIME_SECONDS = 3;
const PARTICLE_RATE_PER_SECOND = 50;
const ACTIVE_PARTICLE_COUNT = PARTICLE_LIFETIME_SECONDS * PARTICLE_RATE_PER_SECOND;
const SOURCE_HORIZONTAL_RANGE = 5_000;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_CANVAS_PIXELS = 8_000_000;

interface Particle {
  readonly width: number;
  readonly height: number;
  age: number;
  sourceX: number;
}

interface Props {
  readonly weather: SpaceWeatherCondition;
  readonly enabled: boolean;
  readonly reducedMotion: boolean;
  readonly themeId: string;
}

function isAnimatedWeather(weather: SpaceWeatherCondition): weather is AnimatedSpaceWeather {
  return weather === "rain" || weather === "heavyRain" || weather === "volcano";
}

function makeParticle(weather: SpaceWeatherCondition): Particle {
  const lava = weather === "volcano";
  return {
    width: lava ? 5 : 2,
    height: lava ? 12 : 5,
    age: Math.random() * PARTICLE_LIFETIME_SECONDS,
    sourceX: Math.random() * SOURCE_HORIZONTAL_RANGE,
  };
}

/**
 * Draws the source game's small rain and lava drops into one bounded canvas.
 * A fixed particle pool avoids the source implementation's 50 DOM insertions
 * and removals per second while preserving its sizes, density, colors and paths.
 */
export function WeatherEffectsOverlay({ weather, enabled, reducedMotion, themeId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || reducedMotion || !isAnimatedWeather(weather)) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const particles = Array.from({ length: ACTIVE_PARTICLE_COUNT }, () => makeParticle(weather));
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let lastFrameAt = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
        Math.sqrt(MAX_CANVAS_PIXELS / Math.max(width * height, 1)),
      );
      canvas.width = Math.ceil(width * pixelRatio);
      canvas.height = Math.ceil(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
    };

    const rainColor =
      getComputedStyle(canvas).getPropertyValue("--text-color").trim() ||
      getComputedStyle(canvas).color;
    const particleColor = weather === "volcano" ? "rgb(193 60 11)" : rainColor;

    const draw = (now: number) => {
      if (document.hidden) {
        frame = 0;
        lastFrameAt = 0;
        return;
      }

      const elapsed = lastFrameAt === 0 ? 0 : Math.min((now - lastFrameAt) / 1000, 0.05);
      lastFrameAt = now;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 0.8;
      context.fillStyle = particleColor;

      for (const particle of particles) {
        particle.age += elapsed;
        if (particle.age >= PARTICLE_LIFETIME_SECONDS) {
          particle.age %= PARTICLE_LIFETIME_SECONDS;
          particle.sourceX = Math.random() * SOURCE_HORIZONTAL_RANGE;
        }

        const progress = particle.age / PARTICLE_LIFETIME_SECONDS;
        const { x, y } = weatherParticlePosition(
          weather,
          particle.sourceX,
          width,
          height,
          progress,
        );

        if (x + particle.width < 0 || x > width || y + particle.height < 0 || y > height) continue;
        context.fillRect(x, y, particle.width, particle.height);
      }

      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frame !== 0) window.cancelAnimationFrame(frame);
        frame = 0;
        lastFrameAt = 0;
        return;
      }

      if (frame === 0) frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!document.hidden) frame = window.requestAnimationFrame(draw);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      context.clearRect(0, 0, width, height);
    };
  }, [enabled, reducedMotion, themeId, weather]);

  return (
    <canvas
      ref={canvasRef}
      className="weather-effects-overlay"
      data-testid="weather-effects-overlay"
      data-weather={weather}
      aria-hidden="true"
    />
  );
}
