import { describe, expect, it } from "vitest";
import {
  GALAXY_STAR_COUNT,
  STAR_FIELD_NOMINAL_HEIGHT,
  STAR_FIELD_NOMINAL_WIDTH,
  STAR_NAME_CATALOGUE,
  createStarCatalogue,
  distanceBetweenStars,
  findHomeSystem,
  findStarByName,
  findStartingSystem,
} from "../../src/content";
import {
  createStarMapModel,
  searchStarCatalogue,
  selectStarMapNode,
} from "../../src/engine/starMap";

describe("stable star catalogue", () => {
  it("creates all source-named stars with deterministic stable IDs", () => {
    const first = createStarCatalogue();
    const second = createStarCatalogue();

    expect(first).toEqual(second);
    expect(first).toHaveLength(GALAXY_STAR_COUNT);
    expect(new Set(first.map((star) => star.id)).size).toBe(GALAXY_STAR_COUNT);
    expect(new Set(first.map((star) => star.name)).size).toBe(GALAXY_STAR_COUNT);
    expect(first.map((star) => star.id)).toEqual(
      Array.from({ length: GALAXY_STAR_COUNT }, (_, slot) => `system:80:${slot}`),
    );
    expect(new Set(STAR_NAME_CATALOGUE.map(([name]) => name)).size).toBe(GALAXY_STAR_COUNT);
  });

  it("preserves the original seed-80 names and nominal geometry", () => {
    const catalogue = createStarCatalogue(80);
    expect(catalogue.slice(0, 3).map(({ name }) => name)).toEqual(["Avior", "Peacock", "Yildun"]);

    expect(catalogue[0]).toMatchObject({
      x: 630.525058145172,
      y: 200.745313222877,
      z: 1315.7850185298262,
      size: 3.295605368244452,
      width: 3.6251659050688976,
      height: 3.6251659050688976,
    });
    expect(catalogue.every((star) => star.x >= 0 && star.x < STAR_FIELD_NOMINAL_WIDTH - 30)).toBe(
      true,
    );
    expect(catalogue.every((star) => star.y >= 0 && star.y < STAR_FIELD_NOMINAL_HEIGHT)).toBe(true);
  });

  it("marks Spica as the initially settled start and Miaplacidus as the gated home", () => {
    const catalogue = createStarCatalogue();
    const starting = findStartingSystem(catalogue);
    const home = findHomeSystem(catalogue);

    expect(starting).toMatchObject({
      name: "Spica",
      specialRole: "starting",
      initiallySettled: true,
    });
    expect(home).toMatchObject({
      name: "Miaplacidus",
      specialRole: "home",
      initiallySettled: false,
      accessGate: "miaplacidus-milestone-4",
    });
    expect(findStarByName(catalogue, "  sPiCa ")?.id).toBe(starting?.id);
  });

  it("derives star discovery, search, selection, and the Miaplacidus access gate", () => {
    const catalogue = createStarCatalogue();
    const undiscovered = createStarMapModel(catalogue, "spica", 0);
    const spica = undiscovered.find((star) => star.name === "Spica")!;
    const sirius = undiscovered.find((star) => star.name === "Sirius")!;
    const home = undiscovered.find((star) => star.name === "Miaplacidus")!;

    expect(spica).toMatchObject({ current: true, studied: true, visible: true, selectable: true });
    expect(sirius).toMatchObject({
      current: false,
      studied: false,
      visible: false,
      selectable: false,
    });
    expect(home).toMatchObject({ studied: false, visible: true, selectable: false });
    expect(selectStarMapNode(undiscovered, sirius.id)).toBeUndefined();
    expect(searchStarCatalogue(catalogue, " ")).toHaveLength(0);
    expect(searchStarCatalogue(catalogue, "miap").map((star) => star.name)).toEqual([
      "Miaplacidus",
    ]);

    const expanded = createStarMapModel(catalogue, "Spica", 100);
    const studiedSirius = expanded.find((star) => star.name === "Sirius")!;
    expect(studiedSirius.studied).toBe(studiedSirius.distanceLy <= 100);
    expect(selectStarMapNode(expanded, studiedSirius.id)).toEqual(studiedSirius);

    const finalHome = createStarMapModel(catalogue, "Spica", 0, 4).find(
      (star) => star.name === "Miaplacidus",
    )!;
    expect(finalHome.selectable).toBe(true);
    expect(selectStarMapNode(undiscovered, home.id)).toBeUndefined();
  });

  it("keeps distances based on nominal 3D positions, independent of map projection", () => {
    const catalogue = createStarCatalogue();
    const [first, second] = catalogue;

    expect(distanceBetweenStars(first, first)).toBe(0);
    expect(distanceBetweenStars(first, second)).toBe(distanceBetweenStars(second, first));
    expect(distanceBetweenStars(first, second).toString()).toMatch(/^\d+\.\d{2}$/);
    expect(createStarCatalogue(81)[0].id).not.toBe(first.id);
  });

  it("rejects a negative or non-integer galaxy seed", () => {
    expect(() => createStarCatalogue(-1)).toThrow(RangeError);
    expect(() => createStarCatalogue(1.5)).toThrow(RangeError);
  });
});
