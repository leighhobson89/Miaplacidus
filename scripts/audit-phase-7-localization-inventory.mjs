import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const sourceRoot = path.resolve(projectRoot, "..", "cosmicForge", "cosmicForge");
const locales = ["en", "es", "pt", "de", "it", "fr"];
const localization = JSON.parse(fs.readFileSync(path.join(sourceRoot, "localization.json"), "utf8"));
const sourceKeys = Object.keys(localization.en);
const skipDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "test-results", "test-reports", "html-report", "playwright-report", "tests", "tools", "docs", "builds"]);

function walk(root, extensions) {
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && !skipDirectories.has(entry.name)) {
      found.push(...walk(path.join(root, entry.name), extensions));
    } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      found.push(path.join(root, entry.name));
    }
  }
  return found;
}

const sourceFiles = walk(sourceRoot, new Set([".js", ".html"]));
const sourceText = sourceFiles.map((file) => [file, fs.readFileSync(file, "utf8")]);
const targetFiles = walk(path.join(projectRoot, "src", "i18n"), new Set([".ts"]));
const targetLocaleSourceFiles = [
  ...targetFiles,
  path.join(projectRoot, "src", "app", "economyDisplay.ts"),
  path.join(projectRoot, "src", "content", "economyBuildingNames.ts"),
  path.join(projectRoot, "src", "content", "technologyNames.ts"),
  path.join(projectRoot, "src", "content", "technologyDescriptions.ts"),
  path.join(projectRoot, "src", "content", "technologySummaries.ts"),
  path.join(projectRoot, "src", "content", "megastructureEffects.ts"),
  path.join(projectRoot, "src", "content", "achievementNames.generated.ts"),
  path.join(projectRoot, "src", "content", "achievementDescriptions.generated.ts"),
  path.join(projectRoot, "src", "i18n", "achievementNotificationCopy.generated.ts"),
];
const targetText = targetLocaleSourceFiles.map((file) => [file, fs.readFileSync(file, "utf8")]);

function decodeString(raw) {
  let value = "";
  for (let index = 1; index < raw.length - 1; index += 1) {
    const character = raw[index];
    if (character !== "\\") {
      value += character;
      continue;
    }
    const escaped = raw[++index];
    if (escaped === undefined) break;
    const simple = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", "0": "\0" };
    if (escaped in simple) {
      value += simple[escaped];
    } else if (escaped === "x") {
      value += String.fromCodePoint(Number.parseInt(raw.slice(index + 1, index + 3), 16));
      index += 2;
    } else if (escaped === "u" && raw[index + 1] === "{") {
      const end = raw.indexOf("}", index + 2);
      value += String.fromCodePoint(Number.parseInt(raw.slice(index + 2, end), 16));
      index = end;
    } else if (escaped === "u") {
      value += String.fromCodePoint(Number.parseInt(raw.slice(index + 1, index + 5), 16));
      index += 4;
    } else if (escaped === "\n" || escaped === "\r") {
      if (escaped === "\r" && raw[index + 1] === "\n") index += 1;
    } else {
      value += escaped;
    }
  }
  return value;
}

function tokenize(text) {
  const tokens = [];
  for (let index = 0; index < text.length; ) {
    const character = text[index];
    if (/\s/u.test(character)) {
      index += 1;
      continue;
    }
    if (character === "/" && text[index + 1] === "/") {
      const end = text.indexOf("\n", index + 2);
      index = end < 0 ? text.length : end + 1;
      continue;
    }
    if (character === "/" && text[index + 1] === "*") {
      const end = text.indexOf("*/", index + 2);
      index = end < 0 ? text.length : end + 2;
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      const start = index++;
      let interpolated = false;
      while (index < text.length) {
        if (character === "`" && text[index] === "$" && text[index + 1] === "{") {
          interpolated = true;
        }
        if (text[index] === "\\") {
          index += 2;
        } else if (text[index++] === character) {
          break;
        }
      }
      const raw = text.slice(start, index);
      tokens.push({ type: interpolated ? "dynamic-string" : "string", value: decodeString(raw) });
      continue;
    }
    if (/[A-Za-z_$]/u.test(character)) {
      const start = index++;
      while (index < text.length && /[A-Za-z0-9_$]/u.test(text[index])) index += 1;
      tokens.push({ type: "identifier", value: text.slice(start, index) });
      continue;
    }
    tokens.push({ type: "punctuation", value: character });
    index += 1;
  }
  return tokens;
}

function parseLocaleObject(tokens, start) {
  let index = start;
  const parseValue = () => {
    const token = tokens[index];
    if (!token) return undefined;
    if (token.value === "{") return parseObject();
    if (token.value === "[") return parseArray();
    if (token.type === "string") {
      index += 1;
      return token.value;
    }
    const stack = [];
    while (index < tokens.length) {
      const current = tokens[index];
      if (stack.length === 0 && (current.value === "," || current.value === "}" || current.value === "]")) break;
      if (["(", "{", "["].includes(current.value)) stack.push(current.value);
      else if ([")", "}", "]"].includes(current.value)) stack.pop();
      index += 1;
    }
    return undefined;
  };
  const parseObject = () => {
    const object = {};
    index += 1;
    while (index < tokens.length && tokens[index].value !== "}") {
      if (tokens[index].value === ",") {
        index += 1;
        continue;
      }
      if (tokens[index].value === "...") {
        index += 1;
        parseValue();
        continue;
      }
      const key = tokens[index];
      if (!key || !["identifier", "string"].includes(key.type)) {
        parseValue();
        if (tokens[index]?.value === ",") index += 1;
        continue;
      }
      index += 1;
      if (tokens[index]?.value !== ":") {
        while (index < tokens.length && tokens[index].value !== "," && tokens[index].value !== "}") index += 1;
        continue;
      }
      index += 1;
      object[key.value] = parseValue();
      if (tokens[index]?.value === ",") index += 1;
    }
    if (tokens[index]?.value === "}") index += 1;
    return object;
  };
  const parseArray = () => {
    const array = [];
    index += 1;
    while (index < tokens.length && tokens[index].value !== "]") {
      if (tokens[index].value === ",") {
        array.push(undefined);
        index += 1;
      } else {
        array.push(parseValue());
        if (tokens[index]?.value === ",") index += 1;
      }
    }
    if (tokens[index]?.value === "]") index += 1;
    return array;
  };
  return parseObject();
}

function parseNamedObject(text, variableName) {
  const tokens = tokenize(text);
  const declaration = tokens.findIndex(
    (token, index) => token.value === "const" && tokens[index + 1]?.value === variableName,
  );
  if (declaration < 0) return {};
  let assignment = declaration + 2;
  while (assignment < tokens.length && !["=", ";"].includes(tokens[assignment].value)) assignment += 1;
  if (tokens[assignment]?.value !== "=" || tokens[assignment + 1]?.value !== "{") return {};
  return parseLocaleObject(tokens, assignment + 1);
}

function extractLocalePaths(text) {
  const tokens = tokenize(text);
  const valuesByLocale = Object.fromEntries(locales.map((locale) => [locale, new Map()]));
  const addFlattened = (locale, object) => {
    const flatten = (value, prefix) => {
      if (typeof value === "string") valuesByLocale[locale].set(prefix, value);
      else if (Array.isArray(value)) value.forEach((entry, itemIndex) => flatten(entry, `${prefix}[${itemIndex}]`));
      else if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key);
      }
    };
    flatten(object, "");
  };
  for (let index = 0; index < tokens.length - 2; index += 1) {
    const locale = tokens[index].value;
    if (!locales.includes(locale) || tokens[index + 1].value !== ":" || tokens[index + 2].value !== "{") continue;
    const object = parseLocaleObject(tokens, index + 2);
    addFlattened(locale, object);
    index += 2;
  }
  for (let index = 0; index < tokens.length - 2; index += 1) {
    const locale = tokens[index].value;
    if (!locales.includes(locale)) continue;
    let assignment = index + 1;
    if (tokens[assignment]?.value === ":") {
      assignment += 1;
      while (assignment < tokens.length && assignment < index + 40 && !["=", ";", "{"].includes(tokens[assignment].value)) assignment += 1;
    }
    if (tokens[assignment]?.value !== "=" || tokens[assignment + 1]?.value !== "{") continue;
    addFlattened(locale, parseLocaleObject(tokens, assignment + 1));
    index = assignment + 1;
  }
  for (let index = 0; index < tokens.length - 3; index += 1) {
    if (tokens[index].value !== "const" || tokens[index + 1].type !== "identifier") continue;
    const variable = tokens[index + 1].value;
    let assignment = index + 2;
    while (assignment < tokens.length && assignment < index + 40 && !["=", ";", "{"].includes(tokens[assignment].value)) assignment += 1;
    if (tokens[assignment]?.value !== "=" || tokens[assignment + 1]?.value !== "{") continue;
    const record = parseLocaleObject(tokens, assignment + 1);
    for (const locale of locales) {
      if (typeof record[locale] === "string") valuesByLocale[locale].set(variable, record[locale]);
    }
    for (const [entryId, entry] of Object.entries(record)) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      for (const locale of locales) {
        if (typeof entry[locale] === "string") valuesByLocale[locale].set(entryId, entry[locale]);
      }
    }
    index = assignment + 1;
  }
  return valuesByLocale;
}

const targetLocalePaths = targetText.map(([file, text]) => [
  file,
  extractLocalePaths(text),
]);
const megastructureEffectFile = path.join(projectRoot, "src", "content", "megastructureEffects.ts");
const megastructureEffectTokens = tokenize(fs.readFileSync(megastructureEffectFile, "utf8"));
const megastructureEffectDeclaration = megastructureEffectTokens.findIndex(
  (token, index) => token.value === "const" && megastructureEffectTokens[index + 1]?.value === "MEGASTRUCTURE_EFFECTS",
);
if (megastructureEffectDeclaration >= 0) {
  let assignment = megastructureEffectDeclaration + 2;
  while (
    assignment < megastructureEffectTokens.length &&
    assignment < megastructureEffectDeclaration + 80 &&
    !["=", ";"].includes(megastructureEffectTokens[assignment].value)
  ) assignment += 1;
  if (megastructureEffectTokens[assignment]?.value !== "=") assignment = -1;
  else assignment += 1;
  if (assignment >= 0 && megastructureEffectTokens[assignment]?.value === "{") {
    const record = parseLocaleObject(megastructureEffectTokens, assignment);
    const localePaths = Object.fromEntries(locales.map((locale) => [locale, new Map()]));
    for (const [structureId, stages] of Object.entries(record)) {
      if (!Array.isArray(stages)) continue;
      stages.forEach((stage, stageIndex) => {
        if (!stage || typeof stage !== "object") return;
        for (const locale of locales) {
          if (typeof stage[locale] === "string") {
            localePaths[locale].set(`MEGASTRUCTURE_EFFECTS.${structureId}[${stageIndex}]`, stage[locale]);
          }
        }
      });
    }
    const effectTargetIndex = targetLocalePaths.findIndex(([file]) => file === megastructureEffectFile);
    if (effectTargetIndex >= 0) targetLocalePaths[effectTargetIndex][1] = localePaths;
  }
}
const crosswalkPath = path.join(projectRoot, "docs", "plans", "phase-7-localization-crosswalk.md");
const crosswalkText = fs.readFileSync(crosswalkPath, "utf8");
const verifiedTechnologyTargets = new Map();
for (const line of crosswalkText.split(/\r?\n/u)) {
  const match = line.match(/^\|\s*`(techNotify[^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`notices\.([^`]+)`\s*\|/u);
  if (match) {
    verifiedTechnologyTargets.set(match[1], {
      target: `src/i18n/technologyNotificationMessages.ts#notices.${match[3]}`,
      route: "Tech Tree completion result; App.tsx sends the selected-locale notice to the global notification surface",
    });
  }
}
const optionDescriptionTechnologyIds = new Set([
  "knowledgeSharing",
  "fusionTheory",
  "hydrogenFusion",
  "heliumFusion",
  "carbonFusion",
  "neonFusion",
  "siliconFusion",
  "nanoTubeTechnology",
  "hydroCarbons",
  "stellarCartography",
  "quantumComputing",
  "aggregateMixing",
  "neutronCapture",
  "glassManufacture",
  "oxygenFusion",
]);
const philosophyTechnologyNameIds = new Set([
  "spaceStorageTankResearch",
  "efficientAssembly",
  "laserMining",
  "massCompoundAssembly",
  "energyDrones",
  "fleetHolograms",
  "hangarAutomation",
  "syntheticPlating",
  "antimatterEngineMinaturization",
  "laserIntensityResearch",
  "voidSeers",
  "stellarWhispers",
  "stellarInsightManifold",
  "asteroidDwellers",
  "ascendencyPhilosophy",
  "rapidExpansion",
  "spaceElevator",
  "launchPadMassProduction",
  "asteroidAttractors",
  "warpDrive",
]);
const philosophyRepeatableNameIds = new Set([
  "efficientAssembly", "laserMining", "massCompoundAssembly", "energyDrones",
  "hangarAutomation", "syntheticPlating", "antimatterEngineMinaturization",
  "laserIntensityResearch", "stellarWhispers", "stellarInsightManifold",
  "asteroidDwellers", "ascendencyPhilosophy", "spaceElevator",
  "launchPadMassProduction", "asteroidAttractors", "warpDrive",
]);
const verifiedPhilosophyTechnologyNameTargets = new Map();
for (const technologyId of philosophyTechnologyNameIds) {
  const sourceKey = `techName${technologyId[0].toLocaleUpperCase("en")}${technologyId.slice(1)}`;
  const targetPath = `${philosophyRepeatableNameIds.has(technologyId) ? "upgrades" : "abilities"}.${technologyId}.name`;
  const targetFile = "src/i18n/philosophyMessages.ts";
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedPhilosophyTechnologyNameTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route: `Research → Philosophy → ${technologyId} ${philosophyRepeatableNameIds.has(technologyId) ? "repeatable" : "ability"} name in PhilosophyPane.tsx`,
    });
  }
}
const philosophyPaneSourceText = fs.readFileSync(path.join(projectRoot, "src", "app", "PhilosophyPane.tsx"), "utf8");
const philosophyPathNameDefinitions = new Map([
  ["philosophyNameConstructor", "constructor"],
  ["philosophyNameSupremacist", "supremacist"],
  ["philosophyNameVoidborn", "voidborn"],
  ["philosophyNameExpansionist", "expansionist"],
]);
const verifiedPhilosophyPathNameTargets = new Map();
for (const [sourceKey, philosophyId] of philosophyPathNameDefinitions) {
  const targetPath = `paths.${philosophyId}.name`;
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    philosophyPaneSourceText.includes(`copy.paths[id].name`) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/philosophyMessages.ts", targetPath)
  ) {
    verifiedPhilosophyPathNameTargets.set(sourceKey, {
      target: `src/i18n/philosophyMessages.ts#${targetPath}`,
      route: `Research > Philosophy > ${philosophyId} choice-card name, selection action, and selected-path heading; PhilosophyPane.tsx resolves the same stable path identity by locale`,
    });
  }
}
const technologyNodeIds = [...(targetCatalogue("src/content/technologyNames.ts")?.en.keys() ?? [])];
const technologyTreeRendererText = fs.readFileSync(path.join(projectRoot, "src", "app", "EconomyPanes.tsx"), "utf8");
const megastructureRendererText = fs.readFileSync(path.join(projectRoot, "src", "app", "MegastructurePane.tsx"), "utf8");
const verifiedTechnologyNodeTargets = new Map();
for (const technologyId of technologyNodeIds) {
  const technologyStem = technologyId === "FTLTravelTheory"
    ? technologyId
    : technologyId[0].toUpperCase() + technologyId.slice(1);
  const sourceNameKey = `techName${technologyStem}`;
  const sourceDescriptionKey = `${optionDescriptionTechnologyIds.has(technologyId) ? "optionDescTech" : "tech"}${technologyStem}Content2`;
  const targetNamePath = technologyId;
  const targetDescriptionPath = technologyId;
  const targetNameFile = "src/content/technologyNames.ts";
  const targetDescriptionFile = "src/content/technologyDescriptions.ts";
  const isMegastructureTechnology = /^(dysonSphere|celestialProcessingCore|plasmaForge|galacticMemoryArchive)/u.test(technologyId);
  const route = isMegastructureTechnology
    ? `Galactic → Megastructures → ${technologyId} stage description in MegastructurePane.tsx (shown after the stage is revealed or researched)`
    : `Research → Tech Tree → ${technologyId} node in TechnologyPrerequisiteTree (EconomyPanes.tsx)`;
  for (const [sourceKey, targetFile, targetPath, copyKind] of [
    [sourceNameKey, targetNameFile, targetNamePath, "name"],
    [sourceDescriptionKey, targetDescriptionFile, targetDescriptionPath, "description"],
  ]) {
    const activeRendererHasRoute = copyKind === "name"
      ? isMegastructureTechnology
        ? megastructureRendererText.includes("TECHNOLOGY_NAMES[technologyId][locale]")
        : technologyTreeRendererText.includes("techName(locale, technology.id)")
      : isMegastructureTechnology
        ? megastructureRendererText.includes("TECHNOLOGY_DESCRIPTIONS[technologyId][locale]")
        : technologyTreeRendererText.includes("TECHNOLOGY_DESCRIPTIONS[technology.id][locale]");
    if (
      sourceKeys.includes(sourceKey) &&
      locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
      activeRendererHasRoute &&
      hasPopulatedTargetPath(targetFile, targetPath)
    ) {
      verifiedTechnologyNodeTargets.set(sourceKey, {
        target: `${targetFile}#${targetPath}[locale]`,
        route,
        copyKind,
      });
    }
  }
}
const verifiedTechnologySummaryTargets = new Map();
for (const technologyId of technologyNodeIds) {
  const technologyStem = technologyId === "FTLTravelTheory"
    ? technologyId
    : technologyId[0].toUpperCase() + technologyId.slice(1);
  const sourceKey = `${optionDescriptionTechnologyIds.has(technologyId) ? "optionDescTech" : "tech"}${technologyStem}Content1`;
  const targetFile = "src/content/technologySummaries.ts";
  const isMegastructureTechnology = /^(dysonSphere|celestialProcessingCore|plasmaForge|galacticMemoryArchive)/u.test(technologyId);
  const routeIsActive = isMegastructureTechnology
    ? megastructureRendererText.includes("technologySummary(locale, technologyId)")
    : technologyTreeRendererText.includes("technologySummary(locale, technology.id)");
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1]?.includes(sourceKey) &&
    routeIsActive &&
    hasPopulatedTargetPath(targetFile, technologyId)
  ) {
    verifiedTechnologySummaryTargets.set(sourceKey, {
      target: `${targetFile}#${technologyId}[locale]`,
      route: isMegastructureTechnology
        ? `Galactic > Megastructures > ${technologyId} stage summary shown when its stage is revealed in MegastructurePane.tsx`
        : `Research > Tech Tree > ${technologyId} compact node summary shown by the active TechnologyPrerequisiteTree renderer in EconomyPanes.tsx`,
    });
  }
}
const verifiedPhilosophyTechnologyDescriptionTargets = new Map();
for (const technologyId of philosophyTechnologyNameIds) {
  const sourceKey = `techPhilosophy${technologyId[0].toUpperCase()}${technologyId.slice(1)}Content1`;
  const targetPath = `${philosophyRepeatableNameIds.has(technologyId) ? "upgrades" : "abilities"}.${technologyId}.effect`;
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1]?.includes(sourceKey) &&
    philosophyPaneSourceText.includes("{ability.effect}") &&
    philosophyPaneSourceText.includes("{definition.effect}") &&
    hasPopulatedTargetPath("src/i18n/philosophyMessages.ts", targetPath)
  ) {
    verifiedPhilosophyTechnologyDescriptionTargets.set(sourceKey, {
      target: `src/i18n/philosophyMessages.ts#${targetPath}`,
      route: `Research > Philosophy > ${technologyId} localized ability or repeatable effect in PhilosophyPane.tsx`,
    });
  }
}
const philosophyHeaderHelpTargetPaths = ["headerHelp[0]", "headerHelp[1]", "headerHelp[2]"];
const verifiedPhilosophyHeaderHelpDefinition =
  sourceKeys.includes("infoTooltipPhilosophyHeader") &&
  sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1]?.includes("infoTooltipPhilosophyHeader") &&
  philosophyPaneSourceText.includes("copy.headerHelp.map") &&
  philosophyPaneSourceText.includes("content={headerTooltipContent}") &&
  philosophyHeaderHelpTargetPaths.every((targetPath) =>
    hasPopulatedTargetPath("src/i18n/philosophyMessages.ts", targetPath),
  )
    ? {
        target: `src/i18n/philosophyMessages.ts#${philosophyHeaderHelpTargetPaths.join(" + src/i18n/philosophyMessages.ts#")}`,
        route: "Research > Philosophy page header help; PhilosophyPane.tsx renders the three selected-locale paragraphs in its focusable info tooltip",
      }
    : undefined;
const megastructureStructureIds = {
  DysonSphere: "dysonSphere",
  CelestialProcessingCore: "celestialProcessingCore",
  PlasmaForge: "plasmaForge",
  GalacticMemoryArchive: "galacticMemoryArchive",
};
const verifiedMegastructureStructureNameTargets = new Map();
const verifiedMegastructureStageNameTargets = new Map();
const verifiedMegastructureEffectTargets = new Map();
const megastructureStructureNameRouteIsActive = megastructureRendererText.includes(
  "text.structureNames[record.megastructureId]",
);
const megastructureStageNameRouteIsActive = megastructureRendererText.includes(
  "TECHNOLOGY_NAMES[technologyId][locale]",
);
const megastructureEffectRouteIsActive = megastructureRendererText.includes(
  "MEGASTRUCTURE_EFFECTS[record.megastructureId][index]![locale]",
);
for (const [sourceSuffix, structureId] of Object.entries(megastructureStructureIds)) {
  const sourceKey = `megaStructureTTName${sourceSuffix}`;
  const targetFile = "src/i18n/megastructureMessages.ts";
  const targetPath = `structureNames.${structureId}`;
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    megastructureStructureNameRouteIsActive &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedMegastructureStructureNameTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route: `Galactic → Megastructures → ${structureId} track heading in MegastructurePane.tsx; four structures remain separate`,
    });
  }
  for (let stage = 1; stage <= 5; stage += 1) {
    const technologyId = `${structureId}${[
      "Understanding",
      "Capabilities",
      "Disconnect",
      "Power",
      "Connect",
    ][stage - 1]}`;
    const stageSourceKey = `megaStructureTTResearch${sourceSuffix}${stage}`;
    const stageTargetFile = "src/content/technologyNames.ts";
    if (
      sourceKeys.includes(stageSourceKey) &&
      locales.every((locale) => String(localization[locale][stageSourceKey] ?? "").trim().length > 0) &&
      megastructureStageNameRouteIsActive &&
      hasPopulatedTargetPath(stageTargetFile, technologyId)
    ) {
      verifiedMegastructureStageNameTargets.set(stageSourceKey, {
        target: `${stageTargetFile}#${technologyId}[locale]`,
        route: `Galactic → Megastructures → ${structureId} stage ${stage}; MegastructurePane.tsx renders TECHNOLOGY_NAMES[technologyId][locale]`,
      });
    }
    const effectSourceKey = `megaStructureTTEffect${sourceSuffix}${stage}`;
    const effectTargetFile = "src/content/megastructureEffects.ts";
    const effectTargetPath = `MEGASTRUCTURE_EFFECTS.${structureId}[${stage - 1}]`;
    if (
      sourceKeys.includes(effectSourceKey) &&
      locales.every((locale) => String(localization[locale][effectSourceKey] ?? "").trim().length > 0) &&
      megastructureEffectRouteIsActive &&
      hasPopulatedTargetPath(effectTargetFile, effectTargetPath)
    ) {
      verifiedMegastructureEffectTargets.set(effectSourceKey, {
        target: `${effectTargetFile}#${effectTargetPath}[locale]`,
        route: `Galactic → Megastructures → ${structureId} stage ${stage}; MegastructurePane.tsx renders the localized source-visible effect caption`,
      });
    }
  }
}
const miaplaediaSectionBySourceSuffix = {
  GetStarted: "getStarted",
  Story: "story",
  ConceptsEarly: "conceptsEarly",
  ConceptsMid: "conceptsMid",
  ConceptsLate: "conceptsLate",
  ConceptsEndGoal: "endGoal",
  Philosophies: "philosophies",
};
function firstLower(value) {
  return value.length ? value[0].toLocaleLowerCase("en") + value.slice(1) : value;
}
function targetCatalogue(targetFile) {
  return targetLocalePaths.find(([file]) => path.relative(projectRoot, file).replaceAll(path.sep, "/") === targetFile)?.[1];
}
function hasPopulatedTargetPath(targetFile, targetPath) {
  const catalogue = targetCatalogue(targetFile);
  return Boolean(catalogue) && locales.every((locale) => {
    const value = catalogue[locale].get(targetPath);
    return typeof value === "string" && value.trim().length > 0;
  });
}
const achievementDescriptionSourceKeys = parseNamedObject(
  fs.readFileSync(path.join(projectRoot, "src", "content", "achievementDescriptions.generated.ts"), "utf8"),
  "ACHIEVEMENT_DESCRIPTION_SOURCE_KEYS",
);
const verifiedAchievementDescriptionTargets = new Map();
const verifiedAchievementNotificationTargets = new Map();
for (const [achievementId, sourceKey] of Object.entries(achievementDescriptionSourceKeys)) {
  if (typeof sourceKey !== "string") continue;
  const descriptionTarget = "src/content/achievementDescriptions.generated.ts";
  const nameTarget = "src/content/achievementNames.generated.ts";
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(descriptionTarget, achievementId) &&
    hasPopulatedTargetPath(nameTarget, achievementId)
  ) {
    verifiedAchievementDescriptionTargets.set(sourceKey, {
      target: `${nameTarget}#${achievementId}[locale] + ${descriptionTarget}#${achievementId}[locale]`,
      route: `Settings → Achievements → ${achievementId} card title and accessible description tooltip; AchievementsPane.tsx resolves both through the stable achievement id and active locale`,
    });
  }

  const notificationSourceKey = `achievementNotification${sourceKey.slice("achievement".length)}`;
  const notificationTarget = "src/i18n/achievementNotificationCopy.generated.ts";
  if (
    sourceKeys.includes(notificationSourceKey) &&
    locales.every((locale) => String(localization[locale][notificationSourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(notificationTarget, achievementId)
  ) {
    verifiedAchievementNotificationTargets.set(notificationSourceKey, {
      target: `${notificationTarget}#${achievementId}[locale]`,
      route: `achievement.unlocked for ${achievementId}; achievementEventNotifications.ts resolves the event-time locale before showing the floating notification`,
    });
  }
}
const achievementMetadataSource = sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1] ?? "";
const achievementMetadataPane = fs.readFileSync(path.join(projectRoot, "src", "app", "AchievementsPane.tsx"), "utf8");
const achievementMetadataDefinitions = new Map([
  ["reward", "reward"],
  ["resetOnRebirth", "resetOnRebirth"],
  ["yes", "yes"],
  ["no", "no"],
  ["status", "status"],
  ["achieved", "achieved"],
  ["notAchieved", "notAchieved"],
  ["logged", "logged"],
].map(([sourceKey, targetPath]) => [sourceKey, {
  target: `src/i18n/achievementMessages.ts#${targetPath}`,
  route: sourceKey === "logged"
    ? "Cosmic Forge descriptions.js#have50HoursWithOnePioneer achievement tooltip logs lifetime active time; AchievementsPane.tsx renders the selected-locale logged label and lifetime-active-time value on that matching achievement card"
    : `Cosmic Forge descriptions.js achievement tooltips render ${sourceKey}; AchievementsPane.tsx renders the matching populated selected-locale ${targetPath} field on each active achievement card`,
}]));
const verifiedAchievementMetadataTargets = new Map();
for (const [sourceKey, definition] of achievementMetadataDefinitions) {
  const targetPath = definition.target.slice(definition.target.indexOf("#") + 1);
  const hasActiveAchievementField = achievementMetadataPane.includes(`achievementText(locale, "${targetPath}")`) ||
    ((sourceKey === "yes" || sourceKey === "no") &&
      achievementMetadataPane.includes('definition.resetOnRebirth ? "yes" : "no"')) ||
    ((sourceKey === "achieved" || sourceKey === "notAchieved") &&
      achievementMetadataPane.includes('earned ? "achieved" : "notAchieved"'));
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    achievementMetadataSource.includes(`localize('${sourceKey}', getLanguage())`) &&
    hasActiveAchievementField &&
    hasPopulatedTargetPath("src/i18n/achievementMessages.ts", targetPath)
  ) {
    verifiedAchievementMetadataTargets.set(sourceKey, definition);
  }
}
const sourceCompoundRecipeUi = sourceText.find(([file]) => path.basename(file) === "drawTab4Content.js")?.[1] ?? "";
const targetCompoundPane = fs.readFileSync(path.join(projectRoot, "src", "app", "EconomyPanes.tsx"), "utf8");
const compoundPaneStart = targetCompoundPane.indexOf("function CompoundGoodPane(");
const compoundPaneEnd = targetCompoundPane.indexOf("function CompoundAutobuyerDetails(", compoundPaneStart);
const targetCompoundPaneBody = compoundPaneStart >= 0 && compoundPaneEnd > compoundPaneStart
  ? targetCompoundPane.slice(compoundPaneStart, compoundPaneEnd)
  : "";
const verifiedSourceCompoundPresetLabelExclusions = new Map();
const sourceCompoundPresetLabelKeys = [
  ...["Iron", "Carbon", "Sodium", "Neon", "Hydrogen", "Oxygen", "Silicon"].map((good) => `resourceShort${good}`),
  "compoundCreateFillToCapacity",
  "compoundCreateMaxPossible",
  "compoundCreateUpTo75",
  "compoundCreateUpTo67",
  "compoundCreateUpTo50",
  "compoundCreateUpTo33",
];
for (const sourceKey of sourceCompoundPresetLabelKeys) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    sourceCompoundRecipeUi.includes("getCompoundCreateDropdownRecipeText") &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    targetCompoundPaneBody.includes('id={`compound-${id}-amount`}') &&
    !targetCompoundPaneBody.includes("compoundCreateSelectQuantity")
  ) {
    verifiedSourceCompoundPresetLabelExclusions.set(sourceKey, {
      route: sourceKey.startsWith("resourceShort")
        ? "Cosmic Forge drawTab4Content.js renders resourceShort labels inside Compound creation quantity-preset options; the active MIAPLACIDUS EconomyPanes.tsx#CompoundGoodPane renders a numeric Amount field and full localized recipe resource names, with no equivalent quantity-preset selector, so these abbreviations have no player-facing target string route"
        : "Cosmic Forge drawTab4Content.js renders Compound creation quantity-preset labels; the active MIAPLACIDUS EconomyPanes.tsx#CompoundGoodPane renders a numeric Amount field and recipe resource names, with no equivalent quantity-preset selector, so these labels have no player-facing target string route",
    });
  }
}
const warModeSourceUi = sourceText.find(([file]) => path.basename(file) === "ui.js")?.[1] ?? "";
const warModeTargetPane = fs.readFileSync(path.join(projectRoot, "src", "app", "StarshipPane.tsx"), "utf8");
const warModeDialogTargets = new Map();
for (const [sourceKey, targetPath, targetCondition] of [
  ["enterWarModeModalHeader", "enterWarModeModalHeader", 'warModeText(state.settings.locale, "enterWarModeModalHeader")'],
  ["enterwarModeModalBackOutText", "enterwarModeModalBackOutText", '"enterwarModeModalBackOutText"'],
  ["enterwarModeModalNoBackOutText", "enterwarModeModalNoBackOutText", '"enterwarModeModalNoBackOutText"'],
  ["battleAttackingBlind", "attackingBlind", 'warModeText(state.settings.locale, "attackingBlind")'],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    warModeSourceUi.includes(sourceKey) &&
    warModeTargetPane.includes(targetCondition) &&
    hasPopulatedTargetPath("src/i18n/warModeMessages.ts", targetPath)
  ) {
    warModeDialogTargets.set(sourceKey, {
      target: `src/i18n/warModeMessages.ts#${targetPath}`,
      route: `Cosmic Forge ui.js#showEnterWarModeModal ${sourceKey}; StarshipPane.tsx renders this selected-locale field in the scanner-present or blind-entry confirmation dialog before dispatching the existing war-entry command`,
    });
  }
}
const unsupportedWarModeOutcomeExclusions = new Map();
for (const sourceKey of [
  "enterWarModeInsultedText",
  "enterWarModeSurrenderText",
  "enterWarModeNotVassalizedText",
  "enterWarModeScaredText",
  "enterWarModeModalLaughAtProspect",
  "enterWarModeModalLaughAndEnterWar",
  "enterWarModeModalImproveToReceptive",
  "enterWarModeModalNeutral",
  "enterWarModeModalReserved",
  "enterWarModeModalPatience",
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    warModeSourceUi.includes(sourceKey)
  ) {
    unsupportedWarModeOutcomeExclusions.set(sourceKey, {
      route: `Cosmic Forge ui.js#showEnterWarModeModal ${sourceKey} is an outcome-specific dialogue whose source combat/diplomacy effect or result-modal timing is not reproduced by the active MIAPLACIDUS diplomacy state; the exact behavior differences are recorded in tests/e2e/starship/README.md`,
    });
  }
}
const verifiedOnboardingTargets = new Map();
for (const [sourceKey, targetPath, route, adapted] of [
  [
    "onboardingModalHeader",
    "title",
    "New-game optional tutorial offer title; App.tsx mounts ProgressionTutorial.tsx in the game shell",
    true,
  ],
  [
    "onboardingModalText",
    "offer + step.collectHydrogen.title + step.collectHydrogen.body",
    "The owner-removed one-time briefing is adapted into the optional offer and the first resumable tutorial step in ProgressionTutorial.tsx",
    true,
  ],
]) {
  const targetPaths = targetPath.split(" + ");
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    targetPaths.every((candidate) => hasPopulatedTargetPath("src/i18n/tutorialMessages.ts", candidate))
  ) {
    verifiedOnboardingTargets.set(sourceKey, {
      target: `src/i18n/tutorialMessages.ts#${targetPath}`,
      route,
      adapted,
    });
  }
}
const onboardingStepSourceDefinitions = [
  ["onboardingStepClickHydrogenOption", "step.collectHydrogen"],
  ["onboardingStepClickGainButton", "step.collectHydrogen"],
  ["onboardingStepKeepClickingGain", "step.collectHydrogen"],
  ["onboardingStepBuyHydrogenAutoBuyer", "step.buyHydrogenAutobuyer"],
  ["onboardingStepClickResearchTab", "step.buildScienceKit"],
  ["onboardingStepClickResearch", "step.buildScienceKit"],
  ["onboardingStepBuyThreeScienceKits", "step.buildScienceKit"],
  ["onboardingStepTurnOffScienceKit", "step.pauseScienceKit"],
  ["onboardingStepTogglesExplained", "step.explainResearchRate"],
  ["onboardingStepTurnOnScienceKit", "step.resumeScienceKit"],
  ["onboardingStepReturnToResourcesTab", "step.inspectHydrogenStorage"],
  ["onboardingStepStorageFillsUp", "step.inspectHydrogenStorage"],
  ["onboardingStepClickIncreaseStorage", "step.increaseHydrogenStorage"],
  ["onboardingStepStorageDoubled", "step.confirmHydrogenStorageUpgrade"],
  ["onboardingStepHelpAutoBuyerAlong", "step.helpAutobuyerAlong"],
  ["onboardingStepClickSellButton", "step.sellHydrogenAction"],
  ["onboardingStepCashShownHere", "step.explainCashStat"],
  ["onboardingStepReturnToResearchTab", "step.explainTechnologyOptions"],
  ["onboardingStepClickTechnology", "step.explainTechnologyOptions"],
  ["onboardingStepTechnologyExplained", "step.explainTechnologyOptions"],
  ["onboardingStepClickTechTree", "step.exploreTechTree"],
  ["onboardingStepTechTreeExplained", "step.exploreTechTree"],
  ["onboardingStepReturnToTechnology", "step.exploreTechTree"],
  ["onboardingStepResearchKnowledgeSharing", "step.researchKnowledgeSharing"],
  ["onboardingStepScienceClubHint", "step.inspectScienceClub"],
  ["onboardingStepLookAtSettingsTab", "step.visitVisualSettings"],
  ["onboardingStepChangeLookAndFeel", "step.visitVisualSettings"],
  ["onboardingStepVisualMenuExplained", "step.visitVisualSettings"],
  ["onboardingStepClickDropdown", "step.openThemeDropdown"],
  ["onboardingStepSelectDark", "step.chooseDarkTheme"],
  ["onboardingStepClickGameOptions", "step.visitAudioSettings"],
  ["onboardingStepClickAmbienceToggle", "step.visitAudioSettings"],
  ["onboardingStepAmbienceAndHelp", "step.readAudioSettings"],
  ["onboardingStepClickCosmicopedia", "step.visitMiaplaediaGetStarted"],
  ["onboardingStepGetStartedExplained", "step.visitMiaplaediaGetStarted"],
  ["onboardingStepStoryExplained", "step.visitMiaplaediaStory"],
  ["onboardingStepClickConceptsEarly", "step.visitMiaplaediaConceptsEarly"],
  ["onboardingStepClickConceptsMid", "step.visitMiaplaediaConceptsMid"],
  ["onboardingStepClickConceptsLate", "step.visitMiaplaediaConceptsLate"],
  ["onboardingStepFinished", "step.completeGuidedTour"],
  ["onboardingCompleteHeader", "step.completeGuidedTour"],
  ["onboardingCompleteText", "step.completeGuidedTour"],
  ["onboardingExitButton", "skip"],
].map(([sourceKey, path]) => [
  sourceKey,
  path === "skip" ? path : `${path}.title + ${path}.body`,
  `Cosmic Forge onboarding.js guided-step copy maps to the populated ${path} title/body shown by ProgressionTutorial.tsx; the authored all-locale tutorial spec walks the step and controls without being run in Phase 7`,
  true,
]);
for (const [sourceKey, targetPath, route, adapted] of onboardingStepSourceDefinitions) {
  const targetPaths = targetPath.split(" + ");
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    targetPaths.every((candidate) => hasPopulatedTargetPath("src/i18n/tutorialMessages.ts", candidate))
  ) {
    verifiedOnboardingTargets.set(sourceKey, {
      target: `src/i18n/tutorialMessages.ts#${targetPath}`,
      route,
      adapted,
    });
  }
}
const verifiedOpeningBriefingAdaptations = new Map([
  ["gameIntroHeader", {
    target: 'src/app/SaveStartScreen.tsx#h1#welcome-title ("MIAPLACIDUS")',
    route: "Startup welcome heading; the stable MIAPLACIDUS brand replaces the source Cosmic Forge briefing heading after the owner removed the one-screen briefing",
    disposition: "ADAPTED_STARTUP_BRAND_HEADING",
    evidence: "The source header is replaced by the stable product identity on the populated startup route in every selected locale; the no-briefing owner decision is recorded in docs/plans/open-decisions.md.",
  }],
  ["gameIntroText", {
    target: "",
    route: "The source one-screen briefing body after pioneer-name entry is intentionally removed by the owner decision in docs/plans/open-decisions.md; the remake starts directly in Hydrogen and has no target briefing route",
    disposition: "EXCLUDED_OWNER_DIRECTED_STARTUP_BRIEFING",
    evidence: "This source briefing body has no target value or route by explicit owner decision; six-locale startup coverage asserts the briefing dialog stays absent.",
  }],
]);
const saveStartSource = fs.readFileSync(path.join(projectRoot, "src", "app", "SaveStartScreen.tsx"), "utf8");
const verifiedStartupActionTargets = new Map();
const cosmicRipHelpPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "CosmicRipPane.tsx"), "utf8");
const cosmicRipSourceDescriptions = sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1] ?? "";
if (
  sourceKeys.includes("newGame") &&
  locales.every((locale) => String(localization[locale].newGame ?? "").trim().length > 0) &&
  hasPopulatedTargetPath("src/i18n/saveMessages.ts", "startNewGame")
) {
  verifiedStartupActionTargets.set("newGame", {
    target: "src/i18n/saveMessages.ts#startNewGame[locale]",
    route: "Startup SaveStartScreen.tsx new-game button; Cosmic Forge's generic New Game action is adapted to the populated selected-locale Start New Game label when no saved slot is selected",
  });
}
const verifiedStartupNameTargets = new Map();
if (
  sourceKeys.includes("gameSaveNameCollect") &&
  sourceText.some(([, text]) => text.includes("gameSaveNameCollect")) &&
  locales.every((locale) => String(localization[locale].gameSaveNameCollect ?? "").trim().length > 0) &&
  saveStartSource.includes('translate(locale, "app.pioneer")') &&
  hasPopulatedTargetPath("src/i18n/messages.ts", "app.pioneer")
) {
  verifiedStartupNameTargets.set("gameSaveNameCollect", {
    target: "src/i18n/messages.ts#app.pioneer",
    route: "Startup SaveStartScreen.tsx localized pioneer-name field label; the authored App Boot spec ties this to descriptions.js#gameSaveNameCollect across six locales",
  });
}
const verifiedPlayerLeaderIntroTargets = new Map();
const playerLeaderIntroHeaderKey = "modalPlayerLeaderIntroHeaderText";
const philosophyChoiceTargetFile = "src/i18n/philosophyMessages.ts";
if (
  sourceKeys.includes(playerLeaderIntroHeaderKey) &&
  locales.every((locale) => String(localization[locale][playerLeaderIntroHeaderKey] ?? "").trim().length > 0) &&
  hasPopulatedTargetPath(philosophyChoiceTargetFile, "choiceTitle")
) {
  verifiedPlayerLeaderIntroTargets.set(playerLeaderIntroHeaderKey, {
    target: `${philosophyChoiceTargetFile}#choiceTitle`,
    route: "Research → Philosophy choice dialog; PhilosophyPane.tsx renders the localized choice title before the four permanent-path cards",
  });
}
for (const [sourceKey, targetPath, route] of [
  ["modalPlayerLeaderPhilosophyHeaderText", "choiceTitle", "Space Mining > Telescope first completed Star Study > Philosophy choice dialog title in PhilosophyPane.tsx"],
  ["modalPlayerLeaderPhilosophyContentText", "choicePrompt", "Space Mining > Telescope first completed Star Study > Philosophy choice dialog prompt in PhilosophyPane.tsx; source narrative adapted to permanent-choice guidance"],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    philosophyPaneSourceText.includes(`{copy.${targetPath}}`) &&
    hasPopulatedTargetPath(philosophyChoiceTargetFile, targetPath)
  ) {
    verifiedPlayerLeaderIntroTargets.set(sourceKey, {
      target: `${philosophyChoiceTargetFile}#${targetPath}`,
      route,
    });
  }
}
for (const [index, [philosophyId, abilityId]] of [
  ["constructor", "spaceStorageTankResearch"],
  ["supremacist", "fleetHolograms"],
  ["voidborn", "voidSeers"],
  ["expansionist", "rapidExpansion"],
].entries()) {
  const sourceKey = `modalPlayerLeaderIntroContentText${index + 1}`;
  const targetPaths = [
    `paths.${philosophyId}.name`,
    `paths.${philosophyId}.summary`,
    `abilities.${abilityId}.name`,
    `abilities.${abilityId}.effect`,
  ];
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    targetPaths.every((targetPath) => hasPopulatedTargetPath(philosophyChoiceTargetFile, targetPath))
  ) {
    verifiedPlayerLeaderIntroTargets.set(sourceKey, {
      target: targetPaths.map((targetPath) => `${philosophyChoiceTargetFile}#${targetPath}`).join(" + "),
      route: `Space Mining → Telescope first completed Star Study → Philosophy choice → ${philosophyId} card; PhilosophyPane.tsx combines the selected-locale path name, summary, ability name, and effect before the permanent choice`,
    });
  }
}
const researchRowLabelDefinitions = new Map([
  ["tab3ScienceKitRowLabel", ["src/content/economyBuildingNames.ts", "scienceKit", "Research → Science Kit purchase card heading"]],
  ["tab3ScienceClubRowLabel", ["src/content/economyBuildingNames.ts", "scienceClub", "Research → Science Club purchase card heading"]],
  ["tab3ScienceLabRowLabel", ["src/content/economyBuildingNames.ts", "scienceLab", "Research → Science Lab purchase card heading"]],
  ["tab3ResearchAutoBuyerRowLabel", ["src/i18n/economyMessages.ts", "researchAutobuyer", "Research → Research AutoBuyer toggle label; the remake keeps it visible but disabled until Research Automation is unlocked"]],
]);
const verifiedResearchRowLabelTargets = new Map();
for (const [sourceKey, [targetFile, targetPath, route]] of researchRowLabelDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedResearchRowLabelTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}[locale]`,
      route,
      adapted: sourceKey === "tab3ResearchAutoBuyerRowLabel",
    });
  }
}
const casinoTooltipDefinitions = new Map([
  ["infoTooltipGalacticCasinoHeader", {
    targetPath: "headerHelp",
    route: "Galactic â†’ Galactic Casino header help; GalacticCasinoPane.tsx exposes casinoMessages.headerHelp through the focusable header tooltip",
    adapted: false,
  }],
  ["infoTooltipGalacticCasinoWheelOfFortune", {
    targetPath: "wheelHelp",
    route: "Galactic â†’ Galactic Casino Wheel prize selector; GalacticCasinoPane.tsx exposes the guidance as visible help associated with the selector because the source DOM has no Wheel info icon",
    adapted: true,
  }],
]);
const verifiedCasinoTooltipTargets = new Map();
for (const [sourceKey, definition] of casinoTooltipDefinitions) {
  const targetFile = "src/i18n/casinoMessages.ts";
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, definition.targetPath)
  ) {
    verifiedCasinoTooltipTargets.set(sourceKey, {
      target: `${targetFile}#${definition.targetPath}[locale]`,
      route: definition.route,
      adapted: definition.adapted,
    });
  }
}
const homecomingStoryDefinitions = new Map([
  ["storyHeaderMiaplacidus", ["pageTitles[0]", "Cosmic Forge homecoming story page 1 heading; MiaplacidusEndgameStory.ts reads the selected-locale page title", true]],
  ["storyContentMiaplacidus", ["pages[0]", "Cosmic Forge homecoming story page 1 body; MiaplacidusEndgameStory.ts reads the selected-locale page body", true]],
  ["storyHeaderReclamation", ["pageTitles[1]", "Cosmic Forge homecoming story page 2 heading; MiaplacidusEndgameStory.ts reads the selected-locale page title", true]],
  ["storyContentReclamation", ["pages[1]", "Cosmic Forge homecoming story page 2 body; MiaplacidusEndgameStory.ts reads the selected-locale page body", true]],
  ["storyHeaderHuntBegins", ["pageTitles[2]", "Cosmic Forge homecoming story page 3 heading; MiaplacidusEndgameStory.ts reads the selected-locale page title", true]],
  ["storyContentHuntBegins", ["pages[2]", "Cosmic Forge homecoming story page 3 body; MiaplacidusEndgameStory.ts reads the selected-locale page body", true]],
  ["storyHeaderOneLastThing", ["pageTitles[3]", "Cosmic Forge homecoming story page 4 heading; MiaplacidusEndgameStory.ts reads the selected-locale page title", true]],
  ["storyContentOneLastThing", ["pages[3]", "Cosmic Forge homecoming story page 4 body; MiaplacidusEndgameStory.ts reads the selected-locale page body", true]],
  ["confirmLabelContinue", ["continue", "Cosmic Forge homecoming story's first three confirmation actions; MiaplacidusEndgameStory.ts renders the localized Continue action", true]],
  ["confirmLabelLetsFinish", ["finish", "Cosmic Forge final homecoming story confirmation; MiaplacidusEndgameStory.ts renders the separate localized Finish action", true]],
]);
const verifiedHomecomingStoryTargets = new Map();
for (const [sourceKey, [targetPath, route, adapted]] of homecomingStoryDefinitions) {
  const targetFile = "src/i18n/miaplacidusStoryMessages.ts";
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedHomecomingStoryTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}[locale]`,
      route: `${route}; this post-homecoming story is separate from the Cosmic Rip closure cinematic`,
      adapted,
    });
  }
}
const starshipTargetSource = fs.readFileSync(path.join(projectRoot, "src", "i18n", "starshipMessages.ts"), "utf8");
const hasStarshipTargetPath = (targetPath) => targetPath === "fleetHangarHeaderHelp"
  ? [...starshipTargetSource.matchAll(/fleetHangarHeaderHelp:\s*\[[\s\S]*?\]\.join\(/gu)].length === locales.length
  : hasPopulatedTargetPath("src/i18n/starshipMessages.ts", targetPath);
const battleResultCopyDefinitions = new Map([
  ["modalBattleHeaderText", ["battleResultTitle", "Interstellar -> Colonise -> battle result heading for victory and defeat; StarshipPane.tsx renders the outcome in the active battle panel", true]],
  ["modalBattleWonText", ["battlevictory", "Interstellar -> Colonise -> battle victory result status in the active StarshipPane.tsx battle panel", true]],
  ["modalBattleLostText", ["battledefeat", "Interstellar -> Colonise -> battle defeat result status in the active StarshipPane.tsx battle panel", true]],
  ["modalBattleNoSentientLifeHeader", ["coloniseNoResistanceTitle", "Interstellar -> Colonise -> no-sentient-life arrival heading above the settlement guidance in StarshipPane.tsx", true]],
  ["modalBattleNoSentientLifeText", ["coloniseNoResistance", "Interstellar -> Colonise -> no-sentient-life arrival guidance before settlement in StarshipPane.tsx", true]],
]);
const verifiedBattleResultCopyTargets = new Map();
for (const [sourceKey, [targetPath, route, adapted = false]] of battleResultCopyDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasStarshipTargetPath(targetPath)
  ) {
    verifiedBattleResultCopyTargets.set(sourceKey, {
      target: `src/i18n/starshipMessages.ts#${targetPath}[locale]`,
      route,
      adapted,
    });
  }
}
function populatedTargetPaths(targetFile, paths) {
  const catalogue = targetCatalogue(targetFile);
  return paths.length > 0 && Boolean(catalogue) && locales.every((locale) =>
    paths.every((targetPath) => {
      const value = catalogue[locale].get(targetPath);
      return typeof value === "string" && value.trim().length > 0;
    }),
  );
}
const sourceDescriptions = sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1] ?? "";
function localizedKeysFromSourceArray(property) {
  const marker = new RegExp(`\\b${property}\\s*:\\s*\\[`, "u");
  const match = marker.exec(sourceDescriptions);
  if (!match) return [];
  const openingBracket = sourceDescriptions.indexOf("[", match.index);
  const tokens = tokenize(sourceDescriptions.slice(openingBracket));
  let depth = 0;
  let end = tokens.length;
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].value === "[") depth += 1;
    else if (tokens[index].value === "]") {
      depth -= 1;
      if (depth === 0) {
        end = index;
        break;
      }
    }
  }
  const keys = [];
  for (let index = 0; index < end - 2; index += 1) {
    if (
      tokens[index].value === "localize" &&
      tokens[index + 1].value === "(" &&
      tokens[index + 2].type === "string"
    ) {
      keys.push(tokens[index + 2].value);
    }
  }
  return [...new Set(keys)];
}
function targetArrayHasExpectedEntries(targetArray, expectedCount) {
  const catalogue = targetCatalogue("src/i18n/sourceNewsCopy.ts");
  return Boolean(catalogue) && locales.every((locale) => {
    const indices = [...catalogue[locale].keys()]
      .map((targetPath) => targetPath.match(new RegExp(`^${targetArray}\\[(\\d+)\\]$`, "u")))
      .filter(Boolean)
      .map((entry) => Number(entry[1]));
    return indices.length === expectedCount && indices.every((value, index) => value === index);
  });
}
const sourceNewsSections = [
  { sourceArray: "noPrize", prefix: "newsNoPrize", targetArray: "headlines", expectedCount: 200, idBase: 0, routeIndex: "entry.id" },
  { sourceArray: "wackyEffects", prefix: "newsWacky", targetArray: "wackyEffects", expectedCount: 8, idBase: 1000, routeIndex: "entry.id - 1000" },
  { sourceArray: "prize", prefix: "newsPrize", targetArray: "prizes", expectedCount: 14, idBase: 2000, routeIndex: "entry.id - 2000" },
  { sourceArray: "oneOff", prefix: "newsOneOff", targetArray: "oneOffs", expectedCount: 14, idBase: 3000, routeIndex: "entry.id - 3000" },
  { sourceArray: "manuscriptClues", prefix: "newsManuscript", targetArray: "manuscriptClues", expectedCount: 10, idBase: 4000, routeIndex: "entry.id - 4000" },
];
const verifiedSourceNewsTargets = new Map();
for (const section of sourceNewsSections) {
  const sourceArrayKeys = localizedKeysFromSourceArray(section.sourceArray).filter((key) => key.startsWith(section.prefix));
  const targetIsAligned =
    sourceArrayKeys.length === section.expectedCount &&
    sourceArrayKeys.every((key) =>
      sourceKeys.includes(key) && locales.every((locale) => String(localization[locale][key] ?? "").trim().length > 0),
    ) &&
    targetArrayHasExpectedEntries(section.targetArray, section.expectedCount);
  if (!targetIsAligned) continue;
  sourceArrayKeys.forEach((key, index) => {
    verifiedSourceNewsTargets.set(key, {
      target: `src/i18n/sourceNewsCopy.ts#${section.targetArray}[${index}]`,
      route: `Cosmic Forge ${section.sourceArray} order maps to news ticker ID ${section.idBase + index}; newsEntryText selects ${section.targetArray}[${section.routeIndex}] and NewsTickerBar.tsx / MetaJournalPane.tsx resolve it for the active locale`,
    });
  });
}
const statisticsRowCrosswalkPath = path.join(
  projectRoot,
  "docs",
  "archive",
  "audits",
  "p44-statistics-row-crosswalk-2026-10-11.md",
);
const statisticsRowCrosswalkText = fs.readFileSync(statisticsRowCrosswalkPath, "utf8");
const statisticsCatalogueByFunction = new Map([
  ["settingsStatisticLabel", "src/i18n/settingsMessages.ts"],
  ["settingsText", "src/i18n/settingsMessages.ts"],
  ["overviewStatisticLabel", "src/i18n/statisticsMessages.ts"],
  ["runStatisticLabel", "src/i18n/statisticsMessages.ts"],
  ["statisticsEventLabel", "src/i18n/statisticsMessages.ts"],
  ["energyStatisticLabel", "src/i18n/energyStatisticsMessages.ts"],
  ["interstellarStatisticLabel", "src/i18n/interstellarStatisticsMessages.ts"],
  ["economyGoodName", "src/app/economyDisplay.ts"],
]);
const verifiedStatisticsTargets = new Map();
for (const line of statisticsRowCrosswalkText.split(/\r?\n/u)) {
  const match = line.match(/^\|\s*`(stats[^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/u);
  if (!match) continue;
  const [, sourceKey, messageExpression, rowId] = match;
  const messageMatch = messageExpression.match(/^([A-Za-z_$][\w$]*)\("([^"]+)"\)$/u);
  if (!messageMatch || !sourceKeys.includes(sourceKey)) continue;
  const [, messageFunction, messageId] = messageMatch;
  const targetFile = statisticsCatalogueByFunction.get(messageFunction);
  if (!targetFile || !hasPopulatedTargetPath(targetFile, messageId)) continue;
  if (!locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0)) continue;
  verifiedStatisticsTargets.set(sourceKey, {
    target: `${targetFile}#${messageId}`,
    route: `Settings → Statistics; SettingsStatisticsPane.tsx renders data-statistic-id=${rowId} using ${messageFunction}(locale, "${messageId}")`,
  });
}
const topStatusBarSourceText = fs.readFileSync(path.join(projectRoot, "src", "app", "TopStatusBar.tsx"), "utf8");
const statusLabelDefinitions = new Map([
  ["statLabelCash", ["cash", "TopStatusBar.tsx#CashBalance renders the Cash status label"]],
  ["statLabelEnergy", ["energy", "TopStatusBar.tsx renders the Energy production status label"]],
  ["statLabelPowered", ["powered", "TopStatusBar.tsx renders the Powered grid status label"]],
  ["statLabelBattery", ["battery", "TopStatusBar.tsx renders Battery as the Power tooltip heading"]],
  ["statLabelAntimatter", ["antimatter", "TopStatusBar.tsx renders the Antimatter status label when available"]],
  ["statLabelAscendencyPoints", ["ascendencyPointsShortLabel", "TopStatusBar.tsx#AscendencyBalance renders the AP balance label"]],
]);
const verifiedStatusLabelTargets = new Map();
for (const [sourceKey, [targetPath, route]] of statusLabelDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    topStatusBarSourceText.includes(`translated(locale, "${targetPath}")`) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/topStatusMessages.ts", targetPath)
  ) {
    verifiedStatusLabelTargets.set(sourceKey, {
      target: `src/i18n/topStatusMessages.ts#${targetPath}`,
      route,
    });
  }
}
const megastructureResultStages = {
  DysonSphere: [
    "dysonSphereUnderstanding",
    "dysonSphereCapabilities",
    "dysonSphereDisconnect",
    "dysonSpherePower",
    "dysonSphereConnect",
  ],
  CelestialProcessingCore: [
    "celestialProcessingCoreUnderstanding",
    "celestialProcessingCoreCapabilities",
    "celestialProcessingCoreDisconnect",
    "celestialProcessingCorePower",
    "celestialProcessingCoreConnect",
  ],
  PlasmaForge: [
    "plasmaForgeUnderstanding",
    "plasmaForgeCapabilities",
    "plasmaForgeDisconnect",
    "plasmaForgePower",
    "plasmaForgeConnect",
  ],
  GalacticMemoryArchive: [
    "galacticMemoryArchiveUnderstanding",
    "galacticMemoryArchiveCapabilities",
    "galacticMemoryArchiveDisconnect",
    "galacticMemoryArchivePower",
    "galacticMemoryArchiveConnect",
  ],
};
const megastructureResultTargetFile = "src/i18n/megastructureResearchResultMessages.ts";
const megastructureResultCatalogue = targetCatalogue(megastructureResultTargetFile);
const megastructureResultDefinitions = new Map();
for (const [sourceTrack, technologyIds] of Object.entries(megastructureResultStages)) {
  technologyIds.forEach((technologyId, index) => {
    const sourceStage = index + 1;
    const sourcePrefix = `modalMegaStructureTech${sourceTrack}${sourceStage}`;
    const resultLinePaths = [...(megastructureResultCatalogue?.en.keys() ?? [])]
      .filter((targetPath) => {
        const match = targetPath.match(new RegExp(`^${technologyId}\\.lines\\[(\\d+)\\]\\.text$`, "u"));
        return Boolean(match);
      })
      .sort((left, right) => Number(left.match(/lines\[(\d+)\]/u)?.[1]) - Number(right.match(/lines\[(\d+)\]/u)?.[1]));
    megastructureResultDefinitions.set(`${sourcePrefix}Header`, {
      targetFile: megastructureResultTargetFile,
      targetPaths: [`${technologyId}.title`],
      route: `${sourceTrack} Stage ${sourceStage} research result; App.tsx resolves the selected-locale result dialog`,
    });
    megastructureResultDefinitions.set(`${sourcePrefix}Text`, {
      targetFile: megastructureResultTargetFile,
      targetPaths: [`${technologyId}.summary`, ...resultLinePaths],
      route: `${sourceTrack} Stage ${sourceStage} research result; App.tsx resolves the selected-locale result dialog summary and benefit lines`,
    });
  });
}
const verifiedMegastructureResultTargets = new Map();
for (const [sourceKey, definition] of megastructureResultDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    populatedTargetPaths(definition.targetFile, definition.targetPaths)
  ) {
    verifiedMegastructureResultTargets.set(sourceKey, {
      target: `${definition.targetFile}#${definition.targetPaths.join("+")}`,
      route: definition.route,
    });
  }
}
const autobuyerResourceIds = {
  resources: ["hydrogen", "helium", "carbon", "neon", "oxygen", "sodium", "silicon", "iron"],
  compounds: ["diesel", "glass", "steel", "concrete", "water", "titanium"],
};
const resourceDataObjectText = sourceText.find(([file]) => path.basename(file) === "resourceDataObject.js")?.[1] ?? "";
const resourceDataTokens = tokenize(resourceDataObjectText);
const resourceDataMarker = resourceDataTokens.findIndex((token, index) =>
  token.value === "resourceData" && resourceDataTokens[index + 1]?.value === "=" && resourceDataTokens[index + 2]?.value === "{",
);
const resourceDataObject = resourceDataMarker < 0
  ? undefined
  : parseLocaleObject(resourceDataTokens, resourceDataMarker + 2);
const verifiedAutobuyerNameTargets = new Map();
const verifiedAutobuyerRowLabelTargets = new Map();
const excludedSolarAutobuyerNameTargets = new Map();
const autobuyerHelpDefinitions = new Map();
for (const [sourceSection, goodIds] of Object.entries(autobuyerResourceIds)) {
  for (const goodId of goodIds) {
    const sourceGoodName = `${goodId[0].toLocaleUpperCase("en")}${goodId.slice(1)}`;
    const targetGroup = sourceSection === "resources" ? "Resources" : "Compounds";
    for (const tier of [1, 2, 3, 4]) {
      const tierId = `tier${tier}`;
      const sourceNameKey = resourceDataObject?.[sourceSection]?.[goodId]?.upgrades?.autoBuyer?.[tierId]?.nameUpgrade;
      const targetNamePath = `${goodId}[${tier - 1}]`;
      const drawTabFile = sourceSection === "resources" ? "drawTab1Content.js" : "drawTab4Content.js";
      const drawTabText = sourceText.find(([file]) => path.basename(file) === drawTabFile)?.[1] ?? "";
      const sourceNameRoutePresent = new RegExp(
        `localize\\(getResourceDataObject\\('${sourceSection}', \\['${goodId}', 'upgrades', 'autoBuyer', '${tierId}', 'nameUpgrade'\\]\\), getLanguage\\(\\)\\)`,
        "u",
      ).test(drawTabText);
      const nameTargetFile = "src/i18n/economyAutobuyerNameMessages.ts";
      if (
        typeof sourceNameKey === "string" &&
        sourceKeys.includes(sourceNameKey) &&
        sourceNameRoutePresent &&
        locales.every((locale) => String(localization[locale][sourceNameKey] ?? "").trim().length > 0) &&
        hasPopulatedTargetPath(nameTargetFile, targetNamePath)
      ) {
        verifiedAutobuyerNameTargets.set(sourceNameKey, {
          target: `${nameTargetFile}#${targetNamePath}`,
          route: `${targetGroup} → ${goodId} → Autobuyer Tier ${tier} label; EconomyPanes.tsx resolves economyAutobuyerName(locale, "${goodId}", ${tier})${goodId === "hydrogen" && tier === 1 ? " and App.tsx renders the special Hydrogen label" : ""}`,
        });
      }

      const sourceRowLabelKey = sourceSection === "resources"
        ? `tab1${sourceGoodName}AutoBuyer${tier}RowLabel`
        : `tab4${sourceGoodName}AutoBuyer${tier}RowLabel`;
      const sourceRowLabelRoutePresent = drawTabText.includes(`localize('${sourceRowLabelKey}', getLanguage())`);
      if (
        sourceKeys.includes(sourceRowLabelKey) &&
        sourceRowLabelRoutePresent &&
        locales.every((locale) => String(localization[locale][sourceRowLabelKey] ?? "").trim().length > 0) &&
        hasPopulatedTargetPath(nameTargetFile, targetNamePath) &&
        (goodId === "hydrogen" && tier === 1 || hasPopulatedTargetPath("src/i18n/economyMessages.ts", "buyTier"))
      ) {
        verifiedAutobuyerRowLabelTargets.set(sourceRowLabelKey, {
          target: goodId === "hydrogen" && tier === 1
            ? `${nameTargetFile}#${targetNamePath}`
            : `${nameTargetFile}#${targetNamePath} + src/i18n/economyMessages.ts#buyTier`,
          route: `${targetGroup} → ${goodId} → Autobuyer Tier ${tier} heading; EconomyPanes.tsx renders the selected-locale tier name${goodId === "hydrogen" && tier === 1 ? " in the special Hydrogen card heading" : ` followed by the localized Buy tier label and tier number`}`,
        });
      }

      const sourceHelpKey = `optionDesc${sourceGoodName}AutoBuyer${tier}Content1`;
      autobuyerHelpDefinitions.set(sourceHelpKey, {
        targetFile: "src/i18n/economyActionHelpMessages.ts",
        targetPath: sourceHelpKey,
        route: `${targetGroup} → ${goodId} → Autobuyer Tier ${tier} help; EconomyPanes.tsx resolves economyActionHelp(locale, "${goodId}", "autobuyer", { tier: ${tier} })`,
      });
    }
  }
}
const solarAutobuyerNames = resourceDataObject?.resources?.solar?.upgrades?.autoBuyer;
const drawTab2Text = sourceText.find(([file]) => path.basename(file) === "drawTab2Content.js")?.[1] ?? "";
for (const tier of [1, 2, 3, 4]) {
  const tierId = `tier${tier}`;
  const sourceKey = solarAutobuyerNames?.[tierId]?.nameUpgrade;
  const sourceUiRouteExists = new RegExp(
    `getResourceDataObject\\('resources', \\['solar', 'upgrades', 'autoBuyer', '${tierId}', 'nameUpgrade'\\]\\)`,
    "u",
  ).test(drawTab2Text);
  if (
    typeof sourceKey === "string" &&
    sourceKeys.includes(sourceKey) &&
    !sourceUiRouteExists &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0)
  ) {
    excludedSolarAutobuyerNameTargets.set(sourceKey, {
      route: `Source solar ${tierId} name is retained in resourceDataObject.js for legacy data only; drawTab2Content.js has no rendered Solar Autobuyer name route`,
    });
  }
}
autobuyerHelpDefinitions.set("optionDescResearchAutoBuyerContent1", {
  targetFile: "src/i18n/researchActionHelpMessages.ts",
  targetPath: "researchAutoBuyer",
  route: "Research → Research AutoBuyer help; EconomyPanes.tsx resolves researchActionHelp(locale, researchAutoBuyer)",
});
const verifiedAutobuyerHelpTargets = new Map();
for (const [sourceKey, definition] of autobuyerHelpDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(definition.targetFile, definition.targetPath)
  ) {
    verifiedAutobuyerHelpTargets.set(sourceKey, {
      target: `${definition.targetFile}#${definition.targetPath}`,
      route: definition.route,
    });
  }
}
const researchActionPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "EconomyPanes.tsx"), "utf8");
const researchActionHelpDefinitions = new Map([
  ["optionDescResearchScienceKitContent1", "scienceKit"],
  ["optionDescResearchScienceClubContent1", "scienceClub"],
  ["optionDescResearchScienceLabContent1", "scienceLab"],
]);
const verifiedResearchActionHelpTargets = new Map();
for (const [sourceKey, actionId] of researchActionHelpDefinitions) {
  const targetPath = actionId;
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    researchActionPaneSource.includes("researchActionHelp(locale, id)") &&
    researchActionPaneSource.includes(`id === "${actionId}"`) &&
    hasPopulatedTargetPath("src/i18n/researchActionHelpMessages.ts", targetPath)
  ) {
    verifiedResearchActionHelpTargets.set(sourceKey, {
      target: `src/i18n/researchActionHelpMessages.ts#${targetPath}`,
      route: `Research > ${actionId} action card description; EconomyPanes.tsx resolves researchActionHelp(locale, id) and appends the live Science Lab Power rate when applicable`,
    });
  }
}
const ascendencyPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "AscendencyPane.tsx"), "utf8");
const ascendencyPerkHelpDefinitions = new Map([
  ["buffLittleBagOfHydrogenContent1", ["littleBagOfHydrogen", 0]],
  ["buffNonExhaustiveResourcesContent1", ["nonExhaustiveResources", 1]],
  ["buffEfficientStorageContent1", ["efficientStorage", 2]],
  ["buffSmartAutoBuyersContent1", ["smartAutoBuyers", 3]],
  ["buffJumpstartResearchContent1", ["jumpstartResearch", 4]],
  ["buffOptimizedPowerGridsContent1", ["optimizedPowerGrids", 5]],
  ["buffNanoBrokersContent1", ["nanoBrokers", 6]],
  ["buffRoboticResearchAutomationContent1", ["roboticResearchAutomation", 7]],
  ["buffFasterAsteroidScanContent1", ["fasterAsteroidScan", 8]],
  ["buffDeeperStarStudyContent1", ["deeperStarStudy", 9]],
  ["buffAsteroidScannerBoostContent1", ["asteroidScannerBoost", 10]],
  ["buffRocketFuelOptimizationContent1", ["rocketFuelOptimization", 11]],
  ["buffEnhancedMiningContent1", ["enhancedMining", 12]],
  ["buffQuantumEnginesContent1", ["quantumEngines", 13]],
  ["buffAutoSpaceTelescopeContent1", ["autoSpaceTelescope", 14]],
  ["buffBulkPurchasingContent1", ["bulkPurchasing", 15]],
]);
const verifiedAscendencyPerkHelpTargets = new Map();
for (const [sourceKey, [perkId, index]] of ascendencyPerkHelpDefinitions) {
  const targetPath = `perkEffects[${index}]`;
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    ascendencyPaneSource.includes("metaPerkCopy(locale, perk.id)") &&
    ascendencyPaneSource.includes('data-perk-id={perk.id}') &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/metaMessages.ts", targetPath)
  ) {
    verifiedAscendencyPerkHelpTargets.set(sourceKey, {
      target: `src/i18n/metaMessages.ts#${targetPath}`,
      route: `Galactic > Ascendency Perks > ${perkId} selected-locale card effect; AscendencyPane.tsx maps the stable perk ID through metaPerkCopy(locale, perk.id)`,
    });
  }
}
const spaceMiningLabelDefinitions = new Map([
  ["antimatterSvgContent1", ["src/i18n/spaceMessages.ts", "antimatterBoostHelp", "Space Mining > Mining child > Antimatter rate InfoTooltip in SpaceMiningPane.tsx"]],
  ["spaceRocketAutoBuyerContent1", ["src/i18n/rocketMessages.ts", "rocketFuelHelp", "Space Mining > each Rocket child > fuel pump help with the selected-locale power value in SpaceMiningPane.tsx", true]],
  ["spaceRocketTravelContent1", ["src/i18n/rocketMessages.ts", "rocketTravelHelp", "Space Mining > each Rocket child > fuelled in-orbit travel help in SpaceMiningPane.tsx"]],
  ["spaceBuildTelescopeContent1", ["src/i18n/spaceMessages.ts", "telescopeBuildHelp", "Space Mining → Telescope child → Build Telescope InfoTooltip in SpaceMiningPane.tsx"]],
  ["spaceTelescopeSearchAsteroidContent1", ["src/i18n/spaceMessages.ts", "telescopeScanHelp", "Space Mining → Telescope child → Search Asteroid InfoTooltip in SpaceMiningPane.tsx; the source power value is adapted to a locale-formatted precise rate", true]],
  ["spaceTelescopeInvestigateStarContent1", ["src/i18n/spaceMessages.ts", "telescopeStudyHelp", "Space Mining → Telescope child → Investigate Star InfoTooltip in SpaceMiningPane.tsx; the source power value is adapted to a locale-formatted precise rate", true]],
  ["spaceTelescopePhilosophyBoostContent1", ["src/i18n/spaceMessages.ts", "telescopePillageHelp", "Space Mining → Telescope child → Philosophy Boost InfoTooltip in SpaceMiningPane.tsx; the source power value is adapted to a locale-formatted precise rate", true]],
  ["spaceBuildLaunchPadContent1", ["src/i18n/spaceMessages.ts", "launchPadBuildHelp", "Space Mining > Launch Pad construction row > Build Launch Pad InfoTooltip in SpaceMiningPane.tsx"]],
  ["rocketDescription", ["src/i18n/rocketMessages.ts", "rocketPageDescription", "Space Mining > Rocket child > selected-locale Rocket workflow introduction in SpaceMiningPane.tsx", true]],
  ["tab6SpaceTelescopeRowLabel", ["src/i18n/spaceMessages.ts", "telescopeTitle", "Space Mining → Telescope page label; presentationNavigation.ts resolves the child name and SpaceMiningPane.tsx uses the same title for the Telescope page", true]],
  ["tab6AutoSpaceTelescopeName", ["src/i18n/spaceMessages.ts", "autoTitle", "Space Mining → Telescope → Auto Telescope section heading; SpaceMiningPane.tsx renders the heading when Auto Space Telescope is unlocked"]],
  ["tab6AutoSpaceTelescopeRowLabel", ["src/i18n/spaceMessages.ts", "autoRowLabel", "Space Mining → Telescope → Auto Telescope mode label; SpaceMiningPane.tsx renders the select label when Auto Space Telescope is unlocked"]],
  ["tab6LaunchPadRowLabel", ["src/i18n/rocketMessages.ts", "launchPadTitle", "Space Mining → Launch Pad page label; presentationNavigation.ts resolves the distinct Launch Pad child name", true]],
  ["tab6FuelRowLabel", ["src/i18n/rocketMessages.ts", "pumpTitle", "Space Mining → Rocket child → fuel-pump row; SpaceMiningPane.tsx renders the localized pump heading", true]],
  ["tab6TravelToRowLabel", ["src/i18n/rocketMessages.ts", "destination", "Space Mining → Rocket child → orbit destination row; SpaceMiningPane.tsx renders the selected-locale label beside the selected asteroid", true]],
  ["tab6RocketDescriptionWithPower", ["src/i18n/rocketMessages.ts", "rocketPageDescription", "Space Mining → Rocket child page description; SpaceMiningPane.tsx renders localized guidance beneath each Rocket page heading", true]],
  ["textScanningAsteroids", ["src/i18n/spaceMessages.ts", "surveySearching", "Space Mining → Telescope child → active asteroid search status in SpaceMiningPane.tsx"]],
  ["textStudyingStars", ["src/i18n/spaceMessages.ts", "surveyStudying", "Space Mining → Telescope child → active Star Study status in SpaceMiningPane.tsx"]],
  ["textNoPower", ["src/i18n/spaceMessages.ts", "surveyPowerBlocked", "Space Mining → Telescope child → power-blocked survey status in SpaceMiningPane.tsx"]],
  ["textReadyForRefuel", ["src/i18n/rocketMessages.ts", "readyForRefuel", "Space Mining → Rocket child → refuel-ready status in SpaceMiningPane.tsx"]],
  ["textSelectDestinationShort", ["src/i18n/rocketMessages.ts", "selectDestination", "Space Mining → Rocket child → no-destination status in SpaceMiningPane.tsx"]],
  ["textTravellingShort", ["src/i18n/rocketMessages.ts", "outbound", "Space Mining → Rocket child → outbound travel status in SpaceMiningPane.tsx"]],
  ["textReturning", ["src/i18n/rocketMessages.ts", "returning", "Space Mining → Rocket child → return travel status in SpaceMiningPane.tsx"]],
  ["textReadyToTravelShort", ["src/i18n/rocketMessages.ts", "readyToTravel", "Space Mining → Rocket child → full-fuel travel-ready status in SpaceMiningPane.tsx"]],
]);
const verifiedSpaceMiningLabelTargets = new Map();
for (const [sourceKey, [targetFile, targetPath, route, adapted = false]] of spaceMiningLabelDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedSpaceMiningLabelTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
      adapted,
    });
  }
}
const rocketMinerNameDefinitions = new Map(
  [1, 2, 3, 4].map((index) => [
    `rocketMinerName${index}`,
    `Space Mining -> Launch Pad -> rocket assembly card ${index}; SpaceMiningPane.tsx interpolates the source-specific display name through rocketMessages.ts#rocketMinerLabel with the matching slot index`,
  ]),
);
const verifiedRocketMinerNameTargets = new Map();
for (const [sourceKey, route] of rocketMinerNameDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/rocketMessages.ts", "rocketMinerLabel")
  ) {
    verifiedRocketMinerNameTargets.set(sourceKey, {
      target: "src/i18n/rocketMessages.ts#rocketMinerLabel[locale]",
      route,
      adapted: true,
    });
  }
}
const economyActionMaterialIds = new Set(["hydrogen", "helium", "neon", "oxygen", "carbon", "silicon", "sodium", "iron"]);
const economyActionCompoundIds = new Set(["diesel", "glass", "steel", "concrete", "water", "titanium"]);
const economyActionHelpTargets = new Map();
for (const sourceKey of sourceKeys) {
  const match = sourceKey.match(/^optionDesc([A-Z][a-zA-Z]+)(Create|Sell|Storage)Content([12])$/u);
  if (!match) continue;
  const [, goodName, action, contentIndex] = match;
  const goodId = firstLower(goodName);
  const isMaterial = economyActionMaterialIds.has(goodId);
  const isCompound = economyActionCompoundIds.has(goodId);
  if (!isMaterial && !isCompound) continue;
  const route = isMaterial
    ? `Resources > ${goodName} child > ${action.toLowerCase()} help; EconomyPanes.tsx calls economyActionHelp(locale, "${goodId}", "${action.toLowerCase()}"${action === "Sell" && contentIndex === "2" ? ', { fused: true }' : ""})`
    : `Compounds > ${goodName} child > ${action.toLowerCase()} help; EconomyPanes.tsx calls economyActionHelp(locale, "${goodId}", "${action.toLowerCase()}")`;
  if (
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/economyActionHelpMessages.ts", sourceKey)
  ) {
    economyActionHelpTargets.set(sourceKey, {
      target: `src/i18n/economyActionHelpMessages.ts#${sourceKey}`,
      route,
    });
  }
}
const cosmicRipRowLabelDefinitions = new Map([
  ["tab8NearSpaceScannerArrayRowLabel", ["src/i18n/cosmicRipMessages.ts", "scannerArrayTitle", "Cosmic Rip option1 restore row and option2 child heading in CosmicRipPane.tsx"]],
  ["tab8CosmicRipStatusRowLabel", ["src/i18n/cosmicRipMessages.ts", "statusRowLabel", "Cosmic Rip option1 Situation status value label in CosmicRipPane.tsx"]],
  ["tab8NextObjectiveRowLabel", ["src/i18n/cosmicRipMessages.ts", "label", "Cosmic Rip option1 Situation next-objective row label from cosmicRipObjectiveText(locale) in CosmicRipPane.tsx"]],
  ["tab8CloseRipRowLabel", ["src/i18n/cosmicRipMessages.ts", "closeRip", "Cosmic Rip option1 closure action; the target places the source row label and action on one localized button in CosmicRipPane.tsx", true]],
  ["tab8SectorsMapRowLabel", ["src/i18n/cosmicRipMessages.ts", "sectorsMapTitle", "Cosmic Rip option2 Near Space Scanner Array sector-map heading in CosmicRipPane.tsx"]],
  ["tab8SensorBuoyRowLabel", ["src/i18n/cosmicRipMessages.ts", "upgradeNames.sensorBuoy", "Cosmic Rip option2 telemetry-upgrade name in CosmicRipPane.tsx"]],
  ["tab8RipResearchOrbiterRowLabel", ["src/i18n/cosmicRipMessages.ts", "upgradeNames.ripResearchOrbiter", "Cosmic Rip option2 telemetry-upgrade name in CosmicRipPane.tsx"]],
  ["tab8CosmicRipRowLabel", ["src/i18n/cosmicRipMessages.ts", "stabilityLabel", "Cosmic Rip option3 stability value label in CosmicRipPane.tsx"]],
  ["tab8CosmicRipSectorRowLabel", ["src/i18n/cosmicRipMessages.ts", "sectorFound", "Cosmic Rip option2 found-sector status below the located sector in CosmicRipPane.tsx", true]],
]);
const verifiedCosmicRipRowLabelTargets = new Map();
for (const [sourceKey, [targetFile, targetPath, route, adapted = false]] of cosmicRipRowLabelDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedCosmicRipRowLabelTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
      adapted,
    });
  }
}
const cosmicRipTechnologyStatusDefinitions = new Map([
  ["stabilizerArrayBuilt", ["technologyStatusMessages.stabilizerArray", "Cosmic Rip technology completion status for Stabilizer Array; CosmicRipPane.tsx renders the selected-locale completed card and Situation status"]],
  ["quantumContainmentFieldGenerated", ["technologyStatusMessages.quantumContainmentField", "Cosmic Rip technology completion status for Quantum Containment Field; CosmicRipPane.tsx renders the selected-locale completed card and Situation status"]],
  ["dimensionalAnchorMatrixBuilt", ["technologyStatusMessages.dimensionalAnchorMatrix", "Cosmic Rip technology completion status for Dimensional Anchor Matrix; CosmicRipPane.tsx renders the selected-locale completed card and Situation status"]],
  ["singularityStabilizerConstructed", ["technologyStatusMessages.singularityStabilizer", "Cosmic Rip technology completion status for Singularity Stabilizer; CosmicRipPane.tsx renders the selected-locale completed card and Situation status"]],
  ["realityWeaveRegulatorBuilt", ["technologyStatusMessages.realityWeaveRegulator", "Cosmic Rip technology completion status for Reality Weave Regulator; CosmicRipPane.tsx renders the selected-locale completed card"]],
  ["cosmicRipFullyStabilised", ["fullyStabilised", "Cosmic Rip final stabilized status in the Situation status row; CosmicRipPane.tsx resolves the selected locale"]],
]);
const cosmicRipObjectiveDefinitions = new Map([
  ["objectiveBuildStabilizerArray", ["objectives.stabilizerArray", "Cosmic Rip Situation next-objective text while Stabilizer Array is next"]],
  ["objectiveBuildQuantumContainmentField", ["objectives.quantumContainmentField", "Cosmic Rip Situation next-objective text while Quantum Containment Field is next"]],
  ["objectiveBuildDimensionalAnchorMatrix", ["objectives.dimensionalAnchorMatrix", "Cosmic Rip Situation next-objective text while Dimensional Anchor Matrix is next"]],
  ["objectiveBuildSingularityStabilizer", ["objectives.singularityStabilizer", "Cosmic Rip Situation next-objective text while Singularity Stabilizer is next"]],
  ["objectiveBuildRealityWeaveRegulator", ["objectives.realityWeaveRegulator", "Cosmic Rip Situation next-objective text while Reality Weave Regulator is next"]],
  ["objectiveCloseCosmicRip", ["objectives.close", "Cosmic Rip Situation next-objective text after all five technologies are researched"]],
  ["objectiveScanSectors", ["objectives.scan", "Cosmic Rip Situation next-objective text after scanner restoration and before locating the rip"]],
]);
const cosmicRipMessageTargets = new Map();
for (const [sourceKey, [targetPath, route]] of cosmicRipTechnologyStatusDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/cosmicRipMessages.ts", targetPath)
  ) {
    cosmicRipMessageTargets.set(sourceKey, {
      target: `src/i18n/cosmicRipMessages.ts#${targetPath}`,
      route,
      kind: "technology-status",
    });
  }
}
for (const [sourceKey, [targetPath, route]] of cosmicRipObjectiveDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/cosmicRipMessages.ts", targetPath)
  ) {
    cosmicRipMessageTargets.set(sourceKey, {
      target: `src/i18n/cosmicRipMessages.ts#${targetPath}`,
      route,
      kind: "objective",
    });
  }
}
const cosmicRipActionHelpDefinitions = new Map([
  ["optionDescCosmicRipDeployBuoyContent1", ["UPGRADE_DESCRIPTIONS.sensorBuoy", "Cosmic Rip > Near Space Scanner Array > Sensor Buoy InfoTooltip in CosmicRipPane.tsx"]],
  ["optionDescCosmicRipDeployOrbiterContent1", ["UPGRADE_DESCRIPTIONS.ripResearchOrbiter", "Cosmic Rip > Near Space Scanner Array > Rip Research Orbiter InfoTooltip in CosmicRipPane.tsx"]],
  ["optionDescCosmicRipStabilizerArrayContent1", ["TECHNOLOGY_DESCRIPTIONS.stabilizerArray", "Cosmic Rip > Cosmic Rip child > Stabilizer Array technology InfoTooltip in CosmicRipPane.tsx"]],
  ["optionDescCosmicRipQuantumContainmentContent1", ["TECHNOLOGY_DESCRIPTIONS.quantumContainmentField", "Cosmic Rip > Cosmic Rip child > Quantum Containment Field technology InfoTooltip in CosmicRipPane.tsx"]],
  ["optionDescCosmicRipDimensionalAnchorContent1", ["TECHNOLOGY_DESCRIPTIONS.dimensionalAnchorMatrix", "Cosmic Rip > Cosmic Rip child > Dimensional Anchor Matrix technology InfoTooltip in CosmicRipPane.tsx"]],
  ["optionDescCosmicRipSingularityStabilizerContent1", ["TECHNOLOGY_DESCRIPTIONS.singularityStabilizer", "Cosmic Rip > Cosmic Rip child > Singularity Stabilizer technology InfoTooltip in CosmicRipPane.tsx"]],
  ["optionDescCosmicRipRealityWeaveContent1", ["TECHNOLOGY_DESCRIPTIONS.realityWeaveRegulator", "Cosmic Rip > Cosmic Rip child > Reality Weave Regulator technology InfoTooltip in CosmicRipPane.tsx"]],
]);
const verifiedCosmicRipActionHelpTargets = new Map();
for (const [sourceKey, [targetPath, route]] of cosmicRipActionHelpDefinitions) {
  const [targetRecord, field] = targetPath.split(".");
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/cosmicRipMessages.ts", field)
  ) {
    verifiedCosmicRipActionHelpTargets.set(sourceKey, {
      target: `src/i18n/cosmicRipMessages.ts#${targetRecord}.${field}`,
      route,
    });
  }
}
if (
  sourceKeys.includes("optionDescCosmicRipStatusContent1") &&
  cosmicRipSourceDescriptions.includes("optionDescCosmicRipStatusContent1") &&
  cosmicRipHelpPaneSource.includes("content={cosmicRipStatusDescription(locale)}") &&
  hasPopulatedTargetPath("src/i18n/cosmicRipMessages.ts", "STATUS_DESCRIPTIONS")
) {
  verifiedCosmicRipActionHelpTargets.set("optionDescCosmicRipStatusContent1", {
    target: "src/i18n/cosmicRipMessages.ts#STATUS_DESCRIPTIONS[locale]",
    route: "Cosmic Rip > Cosmic Rip child > status-row InfoTooltip in CosmicRipPane.tsx, shown after the Rip is located",
  });
}
const cosmicRipPageHelpDefinitions = new Map([
  ["infoTooltipCosmicRipHeader", ["headerHelp", "Cosmic Rip > Cosmic Rip child > source header info tooltip; CosmicRipPane.tsx renders the selected-locale target help control"]],
  ["infoTooltipSituationHeader", ["situationHelp", "Cosmic Rip > Situation child > source header info tooltip; CosmicRipPane.tsx renders the selected-locale target help control"]],
  ["infoTooltipNearSpaceScannerArrayHeader", ["scannerArrayHelp", "Cosmic Rip > Near Space Scanner Array child > source header info tooltip; CosmicRipPane.tsx renders the selected-locale target help control"]],
]);
const verifiedCosmicRipPageHelpTargets = new Map();
for (const [sourceKey, [targetPath, route]] of cosmicRipPageHelpDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    cosmicRipSourceDescriptions.includes(sourceKey) &&
    cosmicRipHelpPaneSource.includes(`content={copy.${targetPath}}`) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/cosmicRipMessages.ts", targetPath)
  ) {
    verifiedCosmicRipPageHelpTargets.set(sourceKey, {
      target: `src/i18n/cosmicRipMessages.ts#${targetPath}`,
      route,
    });
  }
}
const cosmicRipResultDialogSource = fs.readFileSync(
  path.join(projectRoot, "src", "app", "cosmicRipEventNotifications.ts"),
  "utf8",
);
const appSource = fs.readFileSync(path.join(projectRoot, "src", "app", "App.tsx"), "utf8");
const spaceEventNotificationsSource = fs.readFileSync(
  path.join(projectRoot, "src", "app", "spaceEventNotifications.ts"),
  "utf8",
);
const cosmicRipResultDialogTargets = new Map();
const cosmicRipMilestoneDialogDefinitions = [
  ["modalNearSpaceScannerArrayRestored", "scannerRestored", "Near Space Scanner Array restored result"],
  ["modalCosmicRipLocated", "ripLocated", "Cosmic Rip located result"],
];
for (const [sourcePrefix, targetId, label] of cosmicRipMilestoneDialogDefinitions) {
  const targetFile = "src/i18n/cosmicRipMilestoneResultDialogMessages.ts";
  const routeIsActive = cosmicRipResultDialogSource.includes(
    `cosmicRipMilestoneResultDialogCopy(locale, "${targetId}")`,
  );
  const headerPaths = [`${targetId}.title`];
  const textPaths = [
    `${targetId}.firstBefore`,
    `${targetId}.highlighted`,
    `${targetId}.firstAfter`,
    `${targetId}.secondParagraph`,
  ];
  if (routeIsActive && populatedTargetPaths(targetFile, headerPaths)) {
    cosmicRipResultDialogTargets.set(`${sourcePrefix}Header`, {
      target: `${targetFile}#${headerPaths.join("+")}`,
      route: `Cosmic Rip ${label}; cosmicRipEventNotifications.ts resolves the locale-specific event dialog when the source milestone action completes`,
      kind: "milestone",
    });
  }
  if (routeIsActive && populatedTargetPaths(targetFile, textPaths)) {
    cosmicRipResultDialogTargets.set(`${sourcePrefix}Text`, {
      target: `${targetFile}#${textPaths.join("+")}`,
      route: `Cosmic Rip ${label}; cosmicRipEventNotifications.ts resolves the locale-specific structured body when the source milestone action completes`,
      kind: "milestone",
    });
  }
}
const cosmicRipClosureRoutesAreActive =
  cosmicRipResultDialogSource.includes("cosmicRipClosureResultDialog(locale)") &&
  cosmicRipResultDialogSource.includes('event.type === "cosmic-rip.closed"');
if (cosmicRipClosureRoutesAreActive && hasPopulatedTargetPath("src/i18n/cosmicRipMessages.ts", "closedTitle")) {
  cosmicRipResultDialogTargets.set("modalCosmicRipClosedHeader", {
    target: "src/i18n/cosmicRipMessages.ts#closedTitle",
    route: "Cosmic Rip closure result dialog title; cosmicRipEventNotifications.ts presents the source close result before the ending cinematic",
    kind: "closure",
  });
}
if (cosmicRipClosureRoutesAreActive && hasPopulatedTargetPath("src/i18n/cosmicRipMessages.ts", "closed")) {
  cosmicRipResultDialogTargets.set("modalCosmicRipClosedText", {
    target: "src/i18n/cosmicRipMessages.ts#closed",
    route: "Cosmic Rip closure result dialog body; cosmicRipEventNotifications.ts presents the source close result with the owner-directed MIAPLACIDUS identity",
    kind: "closure",
    adapted: true,
  });
}
const cosmicRipResearchResultFile = "src/i18n/cosmicRipResearchResultDialogMessages.ts";
const cosmicRipResearchResultRouteIsActive =
  appSource.includes("cosmicRipResearchResultDialog(snapshot.locale, technologyId)") &&
  appSource.includes("cosmicRipTechnologyResearchedNotice(snapshot.locale, technologyId)");
for (const [sourceSuffix, technologyId] of [
  ["StabilizerArray", "stabilizerArray"],
  ["QuantumContainmentField", "quantumContainmentField"],
  ["DimensionalAnchorMatrix", "dimensionalAnchorMatrix"],
  ["SingularityStabilizer", "singularityStabilizer"],
  ["RealityWeaveRegulator", "realityWeaveRegulator"],
]) {
  const sourcePrefix = `modalCosmicRipTech${sourceSuffix}`;
  const technologyPrefix = `technologies.${technologyId}`;
  const bodyPaths = [
    `${technologyPrefix}.researchedPrefix`,
    `${technologyPrefix}.name`,
    `${technologyPrefix}.explanation`,
    `${technologyPrefix}.percentage`,
    ...(technologyId === "realityWeaveRegulator" ? [`${technologyPrefix}.congratulations`] : []),
  ];
  if (cosmicRipResearchResultRouteIsActive && hasPopulatedTargetPath(cosmicRipResearchResultFile, "title")) {
    cosmicRipResultDialogTargets.set(`${sourcePrefix}Header`, {
      target: `${cosmicRipResearchResultFile}#title`,
      route: `Cosmic Rip ${technologyId} completion result title; App.tsx queues the selected-locale cosmicRipResearchResultDialog for each completed stage`,
      kind: "research",
    });
  }
  if (cosmicRipResearchResultRouteIsActive && populatedTargetPaths(cosmicRipResearchResultFile, bodyPaths)) {
    cosmicRipResultDialogTargets.set(`${sourcePrefix}Text`, {
      target: `${cosmicRipResearchResultFile}#${bodyPaths.join("+")}`,
      route: `Cosmic Rip ${technologyId} completion result body; App.tsx queues the selected-locale structured research result for the completed stage`,
      kind: "research",
    });
  }
}
const rebirthDrawTabSource = sourceText.find(([file]) => path.basename(file) === "drawTab7Content.js")?.[1] ?? "";
const rebirthDescriptionsSource = sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1] ?? "";
const rebirthPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "AscendencyPane.tsx"), "utf8");
const assetLiquidationSource = fs.readFileSync(path.join(projectRoot, "src", "app", "AssetLiquidationCard.tsx"), "utf8");
const rebirthConfirmationRoutesAreActive =
  rebirthDrawTabSource.includes("modalRebirthText.replace(") &&
  rebirthDrawTabSource.includes("header: modalRebirthHeader") &&
  rebirthDrawTabSource.includes("localize('modalRebirthCarryOverAp', getLanguage())") &&
  rebirthDrawTabSource.includes("localize('modalRebirthGainGp', getLanguage())") &&
  rebirthDrawTabSource.includes("confirmLabel: localize('modalRebirthConfirmLabel', getLanguage())") &&
  rebirthDescriptionsSource.includes("localize('modalRebirthHeader', getLanguage())") &&
  rebirthDescriptionsSource.includes("localize('modalRebirthText', getLanguage())") &&
  rebirthPaneSource.includes('rebirthText(locale, "title")') &&
  rebirthPaneSource.includes('rebirthText(locale, "prompt")') &&
  rebirthPaneSource.includes('metaText(locale, "rebirthBody")') &&
  rebirthPaneSource.includes('rebirthCarryText(locale, number(state, state.permanent.ascendencyPoints))') &&
  rebirthPaneSource.includes('state.permanent.cosmicRip.unlocked') &&
  rebirthPaneSource.includes('rebirthText(locale, "gp")') &&
  rebirthPaneSource.includes('rebirthText(locale, "confirm")');
const rebirthConfirmationTargets = new Map();
for (const [sourceKey, targetPath, sourceRegion] of [
  ["modalRebirthHeader", "title", "confirmation title"],
  ["modalRebirthText", "prompt", "confirmation prompt paragraphs"],
  ["modalRebirthCarryOverAp", "carry", "dynamic AP carryover line"],
  ["modalRebirthGainGp", "gp", "conditional Galactic Points carryover line"],
  ["modalRebirthConfirmLabel", "confirm", "confirmation action"],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    rebirthConfirmationRoutesAreActive &&
    hasPopulatedTargetPath("src/i18n/metaMessages.ts", targetPath)
  ) {
    rebirthConfirmationTargets.set(sourceKey, {
      target: `src/i18n/metaMessages.ts#REBIRTH_TEXT.${targetPath}`,
      route: `Galactic > Rebirth > confirmation dialog ${sourceRegion}; AscendencyPane.tsx renders the selected-locale REBIRTH_TEXT field`,
    });
  }
}
const rebirthRowTargets = new Map();
const rebirthRowRoutesAreActive =
  rebirthDrawTabSource.includes("labelText: localize('tab7RebirthRowLabel', getLanguage())") &&
  rebirthDrawTabSource.includes("descriptionText: localize('tab7RebirthRowDescription', getLanguage())") &&
  rebirthDrawTabSource.includes("labelText: localize('tab7LiquidateRowLabel', getLanguage())") &&
  rebirthPaneSource.includes('metaText(locale, "rebirths")') &&
  rebirthPaneSource.includes('metaText(locale, "rebirthBody")') &&
  rebirthPaneSource.includes("<AssetLiquidationCard state={state} store={store} />") &&
  assetLiquidationSource.includes('marketText(locale, "liquidation")');
for (const [sourceKey, targetPath, route] of [
  [
    "tab7RebirthRowLabel",
    "rebirths",
    "Galactic > Rebirth > Rebirth count card heading; the target adapts the source Rebirth row label to its card heading above the count and action",
  ],
  [
    "tab7RebirthRowDescription",
    "rebirthBody",
    "Galactic > Rebirth > confirmation details; adapts the source reset/retain-AP row description to the target's six-locale reset and retained-meta explanation, while rebirthOverview remains in the page tooltip",
  ],
  [
    "tab7LiquidateRowLabel",
    "liquidation",
    "Galactic > Rebirth > asset-liquidation card heading; AssetLiquidationCard.tsx uses the selected-locale marketText liquidation title",
  ],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    rebirthRowRoutesAreActive &&
    hasPopulatedTargetPath("src/i18n/metaMessages.ts", targetPath)
  ) {
    rebirthRowTargets.set(sourceKey, {
      target: targetPath === "liquidation"
        ? "src/i18n/metaMessages.ts#MARKET_COPY.liquidation"
        : `src/i18n/metaMessages.ts#PACKS.${targetPath}`,
      route,
    });
  }
}
const galacticMarketPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "GalacticMarketPane.tsx"), "utf8");
const galacticCasinoPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "GalacticCasinoPane.tsx"), "utf8");
const tab7ChildLabelDefinitions = new Map([
  ["tab7TradeRowLabel", ["src/i18n/metaMessages.ts", "tradeRow", galacticMarketPaneSource, "marketText", "Galactic > Market > trade selector label in GalacticMarketPane.tsx"]],
  ["tab7QuantityRowLabel", ["src/i18n/metaMessages.ts", "quantity", galacticMarketPaneSource, "marketText", "Galactic > Market > trade quantity input label in GalacticMarketPane.tsx"]],
  ["tab7ConfirmRowLabel", ["src/i18n/metaMessages.ts", "confirmRowLabel", galacticMarketPaneSource, "marketText", "Galactic > Market > trade confirmation summary label in GalacticMarketPane.tsx"]],
  ["tab7SellApRowLabel", ["src/i18n/metaMessages.ts", "sellAp", galacticMarketPaneSource, "marketText", "Galactic > Market > Sell AP card and selector label in GalacticMarketPane.tsx"]],
  ["tab7PurchaseCpRowLabel", ["src/i18n/casinoMessages.ts", "buyTitle", galacticCasinoPaneSource, "casinoText", "Galactic > Galactic Casino > CP purchase card heading in GalacticCasinoPane.tsx"]],
  ["tab7DoubleOrNothingRowLabel", ["src/i18n/casinoMessages.ts", "doubleOrNothing", galacticCasinoPaneSource, "casinoText", "Galactic > Galactic Casino > Double or Nothing game heading in GalacticCasinoPane.tsx"]],
  ["tab7WheelOfFortuneRowLabel", ["src/i18n/casinoMessages.ts", "wheel", galacticCasinoPaneSource, "casinoText", "Galactic > Galactic Casino > Wheel of Fortune game heading in GalacticCasinoPane.tsx"]],
  ["tab7VisitingVoidSeerRowLabel", ["src/i18n/casinoMessages.ts", "voidSeer", galacticCasinoPaneSource, "casinoText", "Galactic > Galactic Casino > Void Seer game heading in GalacticCasinoPane.tsx"]],
  ["tab7HigherOrLowerRowLabel", ["src/i18n/casinoMessages.ts", "higherLower", galacticCasinoPaneSource, "casinoText", "Galactic > Galactic Casino > Higher or Lower game heading in GalacticCasinoPane.tsx"]],
]);
const verifiedTab7ChildLabelTargets = new Map();
const sourceGalacticTab7Text = sourceText.find(([file]) => path.basename(file) === "drawTab7Content.js")?.[1] ?? "";
for (const [sourceKey, [targetFile, targetPath, renderer, accessor, route]] of tab7ChildLabelDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    sourceGalacticTab7Text.includes(sourceKey) &&
    renderer.includes(`${accessor}(locale, "${targetPath}")`) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedTab7ChildLabelTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
    });
  }
}
const casinoGameHelpDefinitions = new Map([
  ["galacticCasinoPurchaseCpContent1", ["purchase", "Galactic > Galactic Casino > CP purchase help; Cosmic Forge inserts descriptions.js copy into the purchase option row, while GalacticCasinoPane.tsx exposes the populated selected-locale value through its purchase InfoTooltip"]],
  ["galacticCasinoGame1Content1", ["doubleOrNothing", "Galactic > Galactic Casino > Double or Nothing source help tooltip; GalacticCasinoPane.tsx renders casinoSectionHelpText(locale, doubleOrNothing)"]],
  ["galacticCasinoGame2Content1", ["wheel", "Galactic > Galactic Casino > Wheel of Fortune source help tooltip; GalacticCasinoPane.tsx renders casinoSectionHelpText(locale, wheel) with the live entry price"]],
  ["galacticCasinoGame3Content1", ["higherLower", "Galactic > Galactic Casino > Higher or Lower source help tooltip; GalacticCasinoPane.tsx renders casinoSectionHelpText(locale, higherLower) with the live entry price"]],
  ["galacticCasinoGame4Content1", ["voidSeer", "Galactic > Galactic Casino > Void Seer source help tooltip; GalacticCasinoPane.tsx renders casinoSectionHelpText(locale, voidSeer)"]],
]);
const casinoVoidSeerPrizeLabelDefinitions = new Map([
  ["casinoVoidSeerPrizeLabel1", ["voidPrizeOType", "Galactic > Galactic Casino > Void Seer O-type clue tier; casinoVoidSeerPrizeName(locale, 1) renders its selected-locale name in the tier control"]],
  ["casinoVoidSeerPrizeLabel2", ["voidPrizeManuscript", "Galactic > Galactic Casino > Void Seer manuscript clue tier; casinoVoidSeerPrizeName(locale, 2) renders its selected-locale name in the tier control"]],
  ["casinoVoidSeerPrizeLabel3", ["voidPrizeAntimatter", "Galactic > Galactic Casino > Void Seer antimatter tier; casinoVoidSeerPrizeName(locale, 3) renders its selected-locale name in the tier control"]],
]);
const casinoPrizeDefinitions = new Map([
  ["casinoPrize100Cp", ["SPECIAL_100_CP_PRIZE", "Galactic > Galactic Casino > 100 CP Wheel prize option; casinoSpecialName(locale, special_100cp) returns the selected-locale label"]],
  ["casinoPrize100kResearch", ["prizeResearch", "Galactic > Galactic Casino > 100,000 Research Points Wheel prize option; casinoSpecialName formats the quantity for the selected locale and appends casinoMessages.prizeResearch", true]],
  ["casinoPrizeDoubleMaterial", ["doubleGood", "Galactic > Galactic Casino > doubled-material Wheel prize options; casinoSpecialName uses doubleGood and the active localized economic-good name for the five source-listed choices", true]],
  ["casinoPrizeRocketWarp", ["specialRocketWarp", "Galactic > Galactic Casino > Rocket Warp Wheel prize option; casinoSpecialName(locale, special_rocket_warp) returns the selected-locale label"]],
  ["casinoPrizeStarshipWarp", ["specialStarshipWarp", "Galactic > Galactic Casino > Starship Warp Wheel prize option; casinoSpecialName(locale, special_starship_warp) returns the selected-locale label"]],
  ["casinoPrizeTelescopeFinishAsteroidSearch", ["specialAsteroid", "Galactic > Galactic Casino > finish Asteroid Search Wheel prize option; casinoSpecialName exposes the selected-locale label when an asteroid-search timer is active"]],
  ["casinoPrizeTelescopeFinishStarStudy", ["specialStarStudy", "Galactic > Galactic Casino > finish Star Study Wheel prize option; casinoSpecialName exposes the selected-locale label when a star-study timer is active"]],
  ["casinoPrizeTelescopeFinishVoidPillage", ["specialVoidPillage", "Galactic > Galactic Casino > finish Void Pillage Wheel prize option; casinoSpecialName exposes the selected-locale label when a Void Pillage timer is active"]],
]);
const verifiedCasinoSourceCopyTargets = new Map();
const casinoNotificationDefinitions = new Map([
  ["casinoNotificationDoubleOrNothingWin", ["doubleOrNothingWinNotification", "Galactic > Galactic Casino > accepted Double or Nothing win toast; casinoEventNotifications.ts resolves the selected-locale result", false, "doubleOrNothingWinNotification"]],
  ["casinoNotificationDoubleOrNothingLose", ["doubleOrNothingLossNotification", "Galactic > Galactic Casino > accepted Double or Nothing loss toast; casinoEventNotifications.ts resolves the selected-locale result", false, "doubleOrNothingLossNotification"]],
  ["casinoNotificationEnterValidStake", ["reasonInvalidAmount", "Galactic > Galactic Casino > invalid Double or Nothing stake; the remake adapts the source toast to the selected-locale inline disabled-control reason", true, "casinoFailureText(locale,"]],
  ["casinoNotificationNotEnoughCpStake", ["reasonInsufficientCp", "Galactic > Galactic Casino > insufficient Double or Nothing stake; the remake adapts the source toast to an inline reason with formatted required and available CP", true, "casinoFailureText(locale,"]],
  ["casinoNotificationClaimPrizeBeforeSpin", ["spinClaimBefore + reasonWheelPrizePending", "Galactic > Galactic Casino > Wheel pending-prize guard; the target has a localized defensive notice and normally exposes the selected-locale inline disabled-control reason", true, "spinClaimBefore"]],
  ["casinoNotificationNotEnoughCpSpin", ["spinInsufficientCp + reasonInsufficientCp", "Galactic > Galactic Casino > Wheel insufficient-CP guard; the target has a localized defensive notice and normally exposes the selected-locale inline disabled-control reason", true, "spinInsufficientCp"]],
  ["casinoNotificationWheelSpecialPrizeWin", ["wheelSpecialReadyNotification", "Galactic > Galactic Casino > Wheel special-prize-ready result notice", true, "wheelSpecialReadyNotification"]],
  ["casinoNotificationWheelLose", ["wheelLossNotification", "Galactic > Galactic Casino > Wheel loss result notice", false, "wheelLossNotification"]],
  ["casinoNotificationWheelWonPrefix", ["wheelWinPrefix", "Galactic > Galactic Casino > Wheel resource/compound result notice; casinoEventNotifications.ts adds the locale-formatted quantity and selected-locale good name", true, "wheelWinPrefix"]],
  ["casinoNotificationWheelWonCashPrefix", ["wheelWinPrefix + cash", "Galactic > Galactic Casino > Wheel cash result notice; casinoEventNotifications.ts adds the formatted amount and selected-locale Cash label", true, "wheelWinPrefix"]],
  ["casinoNotificationWheelWonResearchPrefix", ["wheelWinPrefix + researchPoints", "Galactic > Galactic Casino > Wheel Research result notice; casinoEventNotifications.ts adds the formatted amount and selected-locale Research Points label", true, "wheelWinPrefix"]],
  ["casinoNotificationWheelTimeReducedPrefix", ["wheelTimeReducedMessage", "Galactic > Galactic Casino > Wheel timer-reduction result; target message template localizes the timer label and before/after seconds", true, "wheelTimeReducedMessage"]],
  ["casinoNotificationWheelTimeReducedMiddle", ["wheelTimeReducedMessage", "Galactic > Galactic Casino > Wheel timer-reduction result; target composes the source fragments into one localized template", true, "wheelTimeReducedMessage"]],
  ["casinoNotificationWheelTimeReducedTo", ["wheelTimeReducedMessage", "Galactic > Galactic Casino > Wheel timer-reduction result; target composes the source fragments into one localized template", true, "wheelTimeReducedMessage"]],
  ["casinoNotificationWheelWonCpPrefix", ["wheelWinPrefix + wheelCurrencyCp", "Galactic > Galactic Casino > Wheel CP result notice; casinoEventNotifications.ts adds the formatted amount and selected-locale CP unit", true, "wheelWinPrefix"]],
  ["casinoNotificationSpecialPrize100Cp", ["wheelClaim100CpNotification", "Galactic > Galactic Casino > claim the 100 CP special prize; the target formats the awarded amount for the selected locale", true, "wheelClaim100CpNotification"]],
  ["casinoNotificationSpecialPrize100kResearch", ["wheelClaimResearchNotification", "Galactic > Galactic Casino > claim the 100,000 Research Points special prize; the target formats the quantity for the selected locale", true, "wheelClaimResearchNotification"]],
  ["casinoNotificationSpecialPrizeDoubledPrefix", ["wheelClaimDoublePrefix", "Galactic > Galactic Casino > claim a doubled-good special prize; casinoEventNotifications.ts inserts the selected-locale good name", true, "wheelClaimDoublePrefix"]],
  ["casinoNotificationSpecialPrizeDoubledSuffix", ["wheelClaimDoubleSuffix", "Galactic > Galactic Casino > claim a doubled-good special prize; casinoEventNotifications.ts inserts the selected-locale good name", true, "wheelClaimDoubleSuffix"]],
  ["casinoNotificationSpecialPrizeStarshipWarpedPrefix", ["claimStarshipWarp", "Galactic > Galactic Casino > Starship Warp claim toast; casinoEventNotifications.ts inserts the destination star name", true, "claimStarshipWarp"]],
  ["casinoNotificationSpecialPrizeStarshipFinishedPrefix", ["hiloFullDeckNotification", "Galactic > Galactic Casino > Hilo Starship Journey finish result toast; casinoEventNotifications.ts formats the typed prize and destination into the selected-locale full-deck result", true, "hiloFullDeckNotification"]],
  ["casinoNotificationSpecialPrizeRocketWarpedPrefix", ["claimRocketWarp", "Galactic > Galactic Casino > Rocket Warp claim toast; casinoEventNotifications.ts inserts the rocket and selected-locale destination", true, "claimRocketWarp"]],
  ["casinoNotificationSpecialPrizeRocketWarpedMiddle", ["claimRocketWarp", "Galactic > Galactic Casino > Rocket Warp claim toast; casinoEventNotifications.ts composes the target rocket/destination template", true, "claimRocketWarp"]],
  ["casinoNotificationSpecialPrizeRocketFinishedPrefix", ["hiloFullDeckNotification", "Galactic > Galactic Casino > Hilo Rocket Journey finish result toast; casinoEventNotifications.ts formats the typed prize and destination into the selected-locale full-deck result", true, "hiloFullDeckNotification"]],
  ["casinoNotificationSpecialPrizeTelescopeStarStudy", ["wheelClaimStarStudyNotification", "Galactic > Galactic Casino > claim the finish Star Study special prize", true, "wheelClaimStarStudyNotification"]],
  ["casinoNotificationSpecialPrizeTelescopeAsteroidSearch", ["wheelClaimAsteroidSearchNotification", "Galactic > Galactic Casino > claim the finish Asteroid Search special prize", true, "wheelClaimAsteroidSearchNotification"]],
  ["casinoNotificationSpecialPrizeTelescopeVoidPillage", ["wheelClaimVoidPillageNotification", "Galactic > Galactic Casino > claim the finish Void Pillage special prize", true, "wheelClaimVoidPillageNotification"]],
  ["casinoNotificationSpecialPrizeRocketFinishedSuffix", ["hiloFullDeckNotification", "Galactic > Galactic Casino > Hilo Rocket Journey finish result notice; the target composes the complete selected-locale award in its typed result template", true, "hiloFullDeckNotification"]],
  ["casinoCurrencyCash", ["cash", "Galactic > Galactic Casino > Cash unit in selected-locale Wheel outcome notices", true, 'casinoText(locale, "cash")']],
  ["casinoCurrencyResearchPoints", ["researchPoints", "Galactic > Galactic Casino > Research Points unit in selected-locale Wheel outcome notices", true, 'casinoText(locale, "researchPoints")']],
  ["casinoCurrencyCp", ["wheelCurrencyCp", "Galactic > Galactic Casino > CP unit in selected-locale Wheel and claim notices", true, 'casinoText(locale, "wheelCurrencyCp")']],
  ["casinoClueOTypeSignals", ["O_TYPE_CLUES[0]", "Galactic > Galactic Casino > Void Seer O-type clue variant 1; casinoEventNotifications.ts chooses and localizes the selected clue before announcing its star", true, "casinoOTypeClue(locale,"]],
  ["casinoClueOTypeInstruments", ["O_TYPE_CLUES[1]", "Galactic > Galactic Casino > Void Seer O-type clue variant 2; casinoEventNotifications.ts chooses and localizes the selected clue before announcing its star", true, "casinoOTypeClue(locale,"]],
  ["casinoClueOTypeRadiation", ["O_TYPE_CLUES[2]", "Galactic > Galactic Casino > Void Seer O-type clue variant 3; casinoEventNotifications.ts chooses and localizes the selected clue before announcing its star", true, "casinoOTypeClue(locale,"]],
  ["casinoAwardCp", ["cpPrize", "Galactic > Galactic Casino > Hilo CP award detail; the target prize formatter adds the localized unit to the formatted quantity", true, "casinoPrizeText(locale,"]],
  ["casinoAwardCash", ["awardCash", "Galactic > Galactic Casino > Hilo cash award detail; casinoEventNotifications.ts inserts the locale-formatted amount", true, 'casinoHiloText(locale, "awardCash")']],
  ["casinoAwardResearch", ["awardResearch", "Galactic > Galactic Casino > Hilo Research award detail; casinoEventNotifications.ts inserts the locale-formatted amount", true, 'casinoHiloText(locale, "awardResearch")']],
  ["casinoAwardMaterialAmount", ["awardMaterialAmount", "Galactic > Galactic Casino > Hilo resource award detail; casinoEventNotifications.ts inserts the formatted quantity and selected-locale good name", true, 'casinoHiloText(locale, "awardMaterialAmount")']],
  ["casinoAwardMaterialDoubled", ["doubleMaterial", "Galactic > Galactic Casino > Hilo doubled-good prize detail; target prize formatter composes the populated locale template with the selected-locale good name", true, "casinoPrizeText(locale,"]],
  ["casinoAwardTimeWarp", ["awardTimeWarp", "Galactic > Galactic Casino > Hilo TimeWarp award detail; casinoEventNotifications.ts inserts locale-formatted multiplier and duration", true, 'casinoHiloText(locale, "awardTimeWarp")']],
  ["casinoAwardFinishedAsteroidSearch", ["awardFinishedAsteroidSearch", "Galactic > Galactic Casino > Hilo Asteroid Search finish detail; the target inserts the selected-locale asteroid name", true, 'casinoHiloText(locale, "awardFinishedAsteroidSearch")']],
  ["casinoAwardFinishedStarStudy", ["awardFinishedStarStudy", "Galactic > Galactic Casino > Hilo Star Study finish detail", true, 'casinoHiloText(locale, "awardFinishedStarStudy")']],
  ["casinoAwardFinishedVoidPillage", ["awardFinishedVoidPillage", "Galactic > Galactic Casino > Hilo Void Pillage finish detail", true, 'casinoHiloText(locale, "awardFinishedVoidPillage")']],
  ["casinoAwardFinishedStarshipJourney", ["awardFinishedStarshipJourney", "Galactic > Galactic Casino > Hilo Starship Journey finish detail; the target inserts the selected-locale star name", true, 'casinoHiloText(locale, "awardFinishedStarshipJourney")']],
  ["casinoAwardFinishedRocketJourney", ["awardFinishedRocketJourney", "Galactic > Galactic Casino > Hilo Rocket Journey finish detail; the target inserts the localized Rocket name", true, 'casinoHiloText(locale, "awardFinishedRocketJourney")']],
]);
const casinoUnreachableNotificationExclusions = new Map([
  ["casinoNotificationSpecialPrizeCpVariable", "The source uses this variable-CP toast only for an unavailable/invalid doubled-good fallback. The remake's checked-in Wheel selector and reducer expose only currently available special prizes, so the fallback has no normal player-visible claim route."],
  ["casinoNotificationWheelWonGeneric", "The source generic Wheel-win text is a fallback for an unrecognized result. The remake reducer emits only its typed loss, good, cash, Research, timer, or CP outcomes, so the generic result has no normal player-visible route."],
]);
const casinoEmptyNotificationFragments = new Set([
  "casinoNotificationSpecialPrizeStarshipWarpedSuffix",
  "casinoNotificationSpecialPrizeStarshipFinishedSuffix",
  "casinoNotificationSpecialPrizeRocketWarpedSuffix",
]);
const casinoFallbackSourceKeys = new Set([
  "casinoVoidSeerPrizeFallback1",
  "casinoVoidSeerPrizeFallback2",
  "casinoVoidSeerPrizeFallback3",
]);
const casinoPrizeCatalogSource = sourceText.find(([file]) => path.basename(file) === "constantsAndGlobalVars.js")?.[1] ?? "";
const casinoSourceCopyFile = "src/i18n/casinoMessages.ts";
const casinoSourceDescriptionText = sourceText.find(([file]) => path.basename(file) === "descriptions.js")?.[1] ?? "";
const casinoSourceTabText = sourceText.find(([file]) => path.basename(file) === "drawTab7Content.js")?.[1] ?? "";
const casinoSourceCasinoText = sourceText.find(([file]) => path.basename(file) === "casino.js")?.[1] ?? "";
const casinoEventNotificationsSource = fs.readFileSync(path.join(projectRoot, "src", "app", "casinoEventNotifications.ts"), "utf8");
const casinoNotificationTargetSource = `${casinoEventNotificationsSource}\n${galacticCasinoPaneSource}`;
const casinoFallbackExclusionsAreVerified =
  [...casinoFallbackSourceKeys].every((sourceKey) => casinoSourceTabText.includes(sourceKey)) &&
  [1, 2, 3].every((tier) => casinoPrizeCatalogSource.includes(`labelKey: 'casinoVoidSeerPrizeLabel${tier}'`));
for (const [sourceKey, [targetPath, route]] of casinoGameHelpDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    casinoSourceDescriptionText.includes(sourceKey) &&
    galacticCasinoPaneSource.includes(`casinoSectionHelpText(locale, "${targetPath}")`) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(casinoSourceCopyFile, targetPath)
  ) {
    verifiedCasinoSourceCopyTargets.set(sourceKey, {
      target: `${casinoSourceCopyFile}#CASINO_SECTION_HELP.${targetPath}`,
      route,
      adapted: false,
    });
  }
}
for (const [sourceKey, [targetPath, route]] of casinoVoidSeerPrizeLabelDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    casinoPrizeCatalogSource.includes(sourceKey) &&
    galacticCasinoPaneSource.includes("casinoVoidSeerPrizeName(locale, tier)") &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(casinoSourceCopyFile, targetPath)
  ) {
    verifiedCasinoSourceCopyTargets.set(sourceKey, {
      target: `${casinoSourceCopyFile}#${targetPath}`,
      route,
      adapted: true,
    });
  }
}
for (const [sourceKey, [targetPath, route, adapted = false]] of casinoPrizeDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    casinoSourceTabText.includes(sourceKey) &&
    galacticCasinoPaneSource.includes("casinoSpecialName(") &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(casinoSourceCopyFile, targetPath)
  ) {
    verifiedCasinoSourceCopyTargets.set(sourceKey, {
      target: `${casinoSourceCopyFile}#${targetPath}`,
      route,
      adapted,
    });
  }
}
const verifiedCasinoNotificationTargets = new Map();
for (const [sourceKey, [targetPathsText, route, adapted, routeMarker]] of casinoNotificationDefinitions) {
  const targetPaths = targetPathsText.split(" + ");
  if (
    sourceKeys.includes(sourceKey) &&
    (casinoSourceCasinoText.includes(sourceKey) || casinoSourceTabText.includes(sourceKey)) &&
    casinoNotificationTargetSource.includes(routeMarker) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    targetPaths.every((targetPath) => hasPopulatedTargetPath(casinoSourceCopyFile, targetPath))
  ) {
    verifiedCasinoNotificationTargets.set(sourceKey, {
      target: `${casinoSourceCopyFile}#${targetPathsText}`,
      route,
      adapted,
    });
  }
}
const verifiedCasinoNotificationExclusions = new Map();
const casinoWheelReducerSource = fs.readFileSync(path.join(projectRoot, "src", "engine", "galacticCasino.ts"), "utf8");
if (
  casinoSourceCasinoText.includes("casinoNotificationSpecialPrizeCpVariable") &&
  casinoWheelReducerSource.includes("availableWheelSpecialPrizes(state)")
) {
  verifiedCasinoNotificationExclusions.set(
    "casinoNotificationSpecialPrizeCpVariable",
    casinoUnreachableNotificationExclusions.get("casinoNotificationSpecialPrizeCpVariable"),
  );
}
if (
  casinoSourceCasinoText.includes("casinoNotificationWheelWonGeneric") &&
  casinoWheelReducerSource.includes("result = \"loss\"") &&
  casinoWheelReducerSource.includes("result = `time:${" )
) {
  verifiedCasinoNotificationExclusions.set(
    "casinoNotificationWheelWonGeneric",
    casinoUnreachableNotificationExclusions.get("casinoNotificationWheelWonGeneric"),
  );
}
const verifiedCasinoEmptyNotificationFragments = new Set(
  [...casinoEmptyNotificationFragments].filter((sourceKey) =>
    sourceKeys.includes(sourceKey) &&
    casinoSourceCasinoText.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length === 0),
  ),
);
const spaceProgressionDialogTargets = new Map();
const galacticUnlockDialogRouteIsActive =
  spaceEventNotificationsSource.includes("galacticTabUnlockDialog(locale)") &&
  spaceEventNotificationsSource.includes("enqueueProgressionDialog");
const oTypeArrivalDialogRouteIsActive =
  spaceEventNotificationsSource.includes("oTypeStarReachedDialog(locale,");
const oTypeRebirthDialogRouteIsActive =
  appSource.includes("oTypeStarTechAcquiredDialog(snapshot.locale,") &&
  appSource.includes("currentState.permanent.rebirthCount > previous.rebirthCount");
for (const [sourceKey, targetFile, targetPath, route, routeIsActive] of [
  [
    "modalGalacticTabUnlockHeader",
    "src/i18n/spaceProgressionDialogMessages.ts",
    "galacticTabUnlockHeader",
    "First Galactic unlock result dialog after the initial Starship arrival; spaceEventNotifications.ts enqueues it and emits the separate toast after confirmation",
    galacticUnlockDialogRouteIsActive,
  ],
  [
    "modalGalacticTabUnlockText",
    "src/i18n/spaceProgressionDialogMessages.ts",
    "galacticTabUnlockText",
    "First Galactic unlock result dialog body; the separate galacticTabUnlocked toast follows its confirmation",
    galacticUnlockDialogRouteIsActive,
  ],
  [
    "modalOStarReachedHeader",
    "src/i18n/spaceNotificationMessages.ts",
    "oTypeStarReachedHeader",
    "O-type Starship arrival result dialog title reuses the populated localized arrival narrative; its floating notice remains a separate presentation",
    oTypeArrivalDialogRouteIsActive,
  ],
  [
    "modalOStarReachedText",
    "src/i18n/spaceNotificationMessages.ts",
    "oTypeStarReachedText",
    "O-type Starship arrival result dialog body reuses the populated localized arrival narrative; its floating notice remains a separate presentation",
    oTypeArrivalDialogRouteIsActive,
  ],
  [
    "modalOTypeStarTechAcquiredHeader",
    "src/i18n/spaceProgressionDialogMessages.ts",
    "oTypeStarTechAcquiredHeader",
    "O-type technology acquisition result title queued after meta.rebirth.completed in App.tsx",
    oTypeRebirthDialogRouteIsActive,
  ],
  [
    "modalOTypeStarTechAcquiredText",
    "src/i18n/spaceProgressionDialogMessages.ts",
    "oTypeStarTechAcquiredText",
    "O-type technology acquisition result body with the settled star, assigned plant, and ×8 multiplier queued after meta.rebirth.completed in App.tsx",
    oTypeRebirthDialogRouteIsActive,
  ],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    routeIsActive &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    spaceProgressionDialogTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
    });
  }
}
const researchUnlockResultDialogTargets = new Map();
const researchUnlockDialogRouteIsActive =
  appSource.includes("researchUnlockResultDialogForTechnology(snapshot.locale, technologyId)") &&
  appSource.includes('researchUnlockResultDialog(currentLocaleRef.current, "compoundMachining")') &&
  appSource.includes("enqueueRandomEventResultDialog(unlockResult)");
for (const [sourceStem, dialogId, technologyId, routeDetail] of [
  ["modalCompoundsTabUnlock", "compounds", "compounds", "Compounds research completion"],
  ["modalScienceLabsTabUnlock", "scienceLaboratories", "scienceLaboratories", "Science Laboratories research completion"],
  ["modalQuantumComputingTabUnlock", "quantumComputing", "quantumComputing", "Quantum Computing research completion"],
  ["modalRocketCompositesTabUnlock", "rocketComposites", "rocketComposites", "Rocket Composites research completion"],
  ["modalCompoundMachiningTabUnlock", "compoundMachining", "compoundMachining", "Compound Machining completion and Level-II unlock"],
  ["modalSpaceMiningTabUnlock", "atmosphericTelescopes", "atmosphericTelescopes", "Atmospheric Telescopes research completion"],
  ["modalEnergyTabUnlock", "basicPowerGeneration", "basicPowerGeneration", "Basic Power Generation research completion"],
  ["modalInterstellarTabUnlock", "stellarCartography", "stellarCartography", "Stellar Cartography research completion"],
  ["modalKnowledgeSharingTabUnlock", "knowledgeSharing", "knowledgeSharing", "Knowledge Sharing research completion"],
]) {
  const targetFile = "src/i18n/researchUnlockResultDialogMessages.ts";
  const route = `Research > Technology completion result dialog > ${routeDetail}; App.tsx routes ${technologyId} through researchUnlockResultDialogForTechnology(snapshot.locale, technologyId)`;
  for (const [suffix, field] of [["Header", "title"], ["Text", "bodyHtml"]]) {
    const sourceKey = `${sourceStem}${suffix}`;
    const targetPath = `${dialogId}.${field}`;
    if (
      sourceKeys.includes(sourceKey) &&
      researchUnlockDialogRouteIsActive &&
      hasPopulatedTargetPath(targetFile, targetPath)
    ) {
      researchUnlockResultDialogTargets.set(sourceKey, {
        target: `${targetFile}#${targetPath}`,
        route: dialogId === "compoundMachining"
          ? `${route}; the same populated localized dialog also follows Compound Machining Level-II unlock`
          : route,
      });
    }
  }
}
const energyPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "EconomyPanes.tsx"), "utf8");
const autobuyerDisplayCopyTargets = new Map();
const autobuyerDisplayCopyDefinitions = new Map([
  ["buttonAddPerSecond", {
    targetPaths: ["buy", "buyTier", "quantity", "perSecondShort"],
    route: "Resources/Compounds > Autobuyer tier action; Cosmic Forge's localized Add {rate} {resource}/s action is adapted to the selected-locale Buy button plus its tier, quantity, and +rate/s summary in EconomyPanes.tsx",
    adapted: true,
  }],
  ["textQuantity", {
    targetPaths: ["quantity"],
    route: "Resources/Compounds > Autobuyer tier summary; EconomyPanes.tsx renders the populated economyMessages.quantity label beside the owned count",
    adapted: false,
  }],
  ["textAdd", {
    targetPaths: ["addEnergyCapacity", "addPowerPlantRate", "addMaxPowerPlantRate", "buy", "perSecondShort"],
    route: "Energy purchase actions use populated selected-locale full action labels; Compound Autobuyers adapt the Add prefix to the conventional + rate summary and separate Buy action",
    adapted: true,
  }],
  ["textPerSecond", {
    targetPaths: ["perSecond", "perSecondShort"],
    route: "Resources/Compounds > Autobuyer and production-rate summaries; EconomyPanes.tsx uses populated full and compact selected-locale rate units",
    adapted: true,
  }],
]);
for (const [sourceKey, definition] of autobuyerDisplayCopyDefinitions) {
  const routeIsActive = sourceKey === "buttonAddPerSecond"
    ? energyPaneSource.includes('t("buy")') && energyPaneSource.includes('t("buyTier")') && energyPaneSource.includes('t("perSecondShort")')
    : sourceKey === "textQuantity"
      ? energyPaneSource.includes('t("quantity")')
      : sourceKey === "textPerSecond"
        ? energyPaneSource.includes('t("perSecond")') && energyPaneSource.includes('t("perSecondShort")')
        : energyPaneSource.includes("addPowerPlantRate") && energyPaneSource.includes('t("perSecondShort")');
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    routeIsActive &&
    definition.targetPaths.every((targetPath) => hasPopulatedTargetPath("src/i18n/economyMessages.ts", targetPath))
  ) {
    autobuyerDisplayCopyTargets.set(sourceKey, {
      target: definition.targetPaths.map((targetPath) => `src/i18n/economyMessages.ts#${targetPath}`).join(" + "),
      route: definition.route,
      adapted: definition.adapted,
    });
  }
}
const energySourceRoutesAreActive =
  energyPaneSource.includes('activePane === "energy-batteries"') &&
  energyPaneSource.includes('activePane === "energy-power"');
const energyLabelTargets = new Map();
for (const [sourceKey, targetFile, targetPath, route] of [
  ...[1, 2, 3].map((tier) => [
    `tab2Battery${tier}RowLabel`,
    "src/content/economyBuildingNames.ts",
    `battery${tier}`,
    `Energy → Batteries → Battery ${tier} card heading; EconomyPanes.tsx uses techName(locale, id) and the populated ECONOMY_BUILDING_NAMES fallback`,
  ]),
  ...[1, 2, 3].map((tier) => [
    `tab2PowerPlant${tier}RowLabel`,
    "src/content/economyBuildingNames.ts",
    `powerPlant${tier}`,
    `Energy → Power → Power Plant ${tier} card heading; EconomyPanes.tsx uses techName(locale, id) and the populated ECONOMY_BUILDING_NAMES fallback`,
  ]),
  ...[1, 2, 3].map((tier) => [
    `energyPowerPlant${tier}Content1`,
    "src/i18n/economyMessages.ts",
    `powerPlant${tier}Help`,
    `Energy → Power → Power Plant ${tier} source description in its focusable InfoTooltip; EconomyPanes.tsx routes the selected-locale economyText value`,
  ]),
  ...[1, 2, 3].map((tier) => [
    `energyBattery${tier}Content1`,
    "src/i18n/economyMessages.ts",
    `battery${tier}Help`,
    `Energy → Batteries → Battery ${tier} source description in its focusable InfoTooltip; EconomyPanes.tsx routes the selected-locale economyText value`,
  ]),
  ["buttonAddCapacityMj", "src/i18n/economyMessages.ts", "addEnergyCapacity", "Energy → Batteries → capacity purchase action in EconomyPanes.tsx"],
  ["buttonAddRateKjPerSecond", "src/i18n/economyMessages.ts", "addPowerPlantRate", "Energy → Power → Power Plant 1 / Advanced Power Plant purchase action in EconomyPanes.tsx"],
  ["buttonAddMaxRateKjPerSecond", "src/i18n/economyMessages.ts", "addMaxPowerPlantRate", "Energy → Power → Solar Power Plant purchase action in EconomyPanes.tsx"],
  ["buttonActivate", "src/i18n/economyMessages.ts", "activatePowerPlant", "Energy → Power → owned plant toggle label in EconomyPanes.tsx"],
  ["buttonDeactivate", "src/i18n/economyMessages.ts", "deactivatePowerPlant", "Energy → Power → active plant toggle label in EconomyPanes.tsx"],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    energySourceRoutesAreActive &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    energyLabelTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
    });
  }
}
for (const [sourceKey, targetPath, route] of [
  ["buttonPowerOn", "activatePower", "Energy > Power > grid-wide master switch when all plants are off; EconomyPanes.tsx renders the selected-locale activatePower label"],
  ["buttonPowerOff", "deactivatePower", "Energy > Power > grid-wide master switch when any plant is active; EconomyPanes.tsx renders the selected-locale deactivatePower label"],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    energySourceRoutesAreActive &&
    energyPaneSource.includes('className="secondary-button energy-master-switch"') &&
    hasPopulatedTargetPath("src/i18n/economyMessages.ts", targetPath)
  ) {
    energyLabelTargets.set(sourceKey, {
      target: `src/i18n/economyMessages.ts#${targetPath}`,
      route,
    });
  }
}
const compoundRoutesAreActive =
  energyPaneSource.includes("function CompoundGoodPane") &&
  energyPaneSource.includes('t("create")') &&
  energyPaneSource.includes('t("sell")') &&
  energyPaneSource.includes("function GoodStorageCard");
const compoundActionTargets = new Map();
for (const [goodId, sourceName] of [
  ["diesel", "Diesel"],
  ["glass", "Glass"],
  ["steel", "Steel"],
  ["concrete", "Concrete"],
  ["water", "Water"],
  ["titanium", "Titanium"],
]) {
  for (const [sourceKey, targetPaths, routeKind] of [
    [`labelTextCreate${sourceName}`, [`src/i18n/economyMessages.ts#create`, `src/app/economyDisplay.ts#${goodId}`], "create"],
    [`tab4${sourceName}SellRowLabel`, [`src/i18n/economyMessages.ts#sell`, `src/app/economyDisplay.ts#${goodId}`], "sell"],
  ]) {
    if (
      sourceKeys.includes(sourceKey) &&
      compoundRoutesAreActive &&
      targetPaths.every((pathAndKey) => {
        const [targetFile, targetPath] = pathAndKey.split("#");
        return hasPopulatedTargetPath(targetFile, targetPath);
      })
    ) {
      compoundActionTargets.set(sourceKey, {
        target: targetPaths.join("+"),
        route: `Compounds → ${sourceName}; active child page uses the selected-locale ${routeKind} action and its localized good name in EconomyPanes.tsx`,
      });
    }
  }
}
for (const [sourceKey, targetFile, targetPath, route] of [
  ["buttonTextCreate", "src/i18n/economyMessages.ts", "create", "Compounds child creation button in EconomyPanes.tsx"],
  ["buttonSell", "src/i18n/economyMessages.ts", "sell", "Compounds child sale heading and action in EconomyPanes.tsx"],
  ["buttonIncreaseStorage", "src/i18n/economyMessages.ts", "increaseStorage", "Compounds child non-Water storage action in GoodStorageCard"],
  ["tab4IncreaseStorageRowLabel", "src/i18n/economyMessages.ts", "storage", "Compounds child storage-card heading and Increase Storage action in GoodStorageCard"],
  ["tab4WaterIncreaseStorageRowLabel", "src/i18n/economyMessages.ts", "enlargeReservoir", "Compounds → Water distinct reservoir-card heading and action in GoodStorageCard"],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    compoundRoutesAreActive &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    compoundActionTargets.set(sourceKey, {
      target: sourceKey === "tab4IncreaseStorageRowLabel"
        ? `${targetFile}#${targetPath}+${targetFile}#increaseStorage`
        : `${targetFile}#${targetPath}`,
      route,
    });
  }
}
const autoCreationSourceRowIsActive = sourceText.some(([file, text]) =>
  path.basename(file) === "drawTab4Content.js" && text.includes("textAuto"),
);
if (
  sourceKeys.includes("textAuto") &&
  autoCreationSourceRowIsActive &&
  compoundRoutesAreActive &&
  energyPaneSource.includes('t("automaticCreation")') &&
  hasPopulatedTargetPath("src/i18n/economyMessages.ts", "automaticCreation")
) {
  compoundActionTargets.set("textAuto", {
    target: "src/i18n/economyMessages.ts#automaticCreation",
    route: "Compounds > each compound Auto Create toggle; EconomyPanes.tsx renders the selected-locale automaticCreation label. This adapts the source shorthand Auto: to the target checkbox wording.",
    adapted: true,
  });
}
const navigationLabelDefinitions = [
  ["tabHeaderResources", "src/i18n/messages.ts", "tab.hydrogen", "Resources top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderCompounds", "src/i18n/messages.ts", "tab.compounds", "Compounds top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderResearch", "src/i18n/messages.ts", "tab.research", "Research top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderEnergy", "src/i18n/messages.ts", "tab.energy", "Energy top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderSpaceMining", "src/i18n/messages.ts", "tab.spaceMining", "Space Mining top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderInterstellar", "src/i18n/messages.ts", "tab.interstellar", "Interstellar top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderGalactic", "src/i18n/messages.ts", "tab.galaxy", "Galactic top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderCosmicRip", "src/i18n/messages.ts", "tab.cosmicRip", "Cosmic Rip top-level tab; App.tsx GAME_TABS renders its localized name"],
  ["tabHeaderSettings", "src/i18n/messages.ts", "tab.settings", "Settings top-level tab; source glyph becomes the owner-directed localized name-only label", true],
  ["headerMainSettings", "src/i18n/messages.ts", "tab.settings", "Settings source section heading; App.tsx renders the owner-directed localized Settings label"],
  ["categoryAchievementsAndStats", "src/i18n/settingsMessages.ts", "achievementsAndStatsSection", "Settings navigation group above source options 10, 14, and 8; PaneNavigation.tsx renders the selected-locale group heading"],
  ["categoryOptions", "src/i18n/settingsMessages.ts", "optionsSection", "Settings navigation group above source options 1, 3, and 2; PaneNavigation.tsx renders the selected-locale group heading"],
  ["headerMainEnergyStorage", "src/i18n/economyMessages.ts", "energyStorage", "Energy option1; presentationNavigation.ts routes to Batteries", true],
  ["headerMainPowerPlant", "src/i18n/economyMessages.ts", "energyPower", "Energy option2; owner-directed Power child consolidates source power-plant destinations", true],
  ["headerMainSolarPowerPlant", "src/i18n/economyMessages.ts", "energyPower", "Energy option3; owner-directed Power child consolidates source power-plant destinations", true],
  ["headerMainAdvancedPowerPlant", "src/i18n/economyMessages.ts", "energyPower", "Energy option4; owner-directed Power child consolidates source power-plant destinations", true],
  ["headerMainPower", "src/i18n/economyMessages.ts", "energyPower", "Energy Power source menu heading; presentationNavigation.ts exposes the consolidated Power child"],
  ["headerMainResearch", "src/i18n/economyMessages.ts", "research", "Research option1; presentationNavigation.ts exposes Research Upgrades"],
  ["headerMainTechnology", "src/i18n/economyMessages.ts", "technologyTree", "Research option2; owner-directed Tech Tree child consolidates Technology and Tech Tree", true],
  ["headerMainTechTree", "src/i18n/economyMessages.ts", "technologyTree", "Research option3; owner-directed Tech Tree child consolidates Technology and Tech Tree", true],
  ["headerMainPhilosophy", "src/i18n/philosophyMessages.ts", "title", "Research option4; presentationNavigation.ts keeps Philosophy as its own child"],
  ["headerMainStarMap", "src/i18n/starMapMessages.ts", "title", "Interstellar option1; presentationNavigation.ts routes to Star Map"],
  ["headerMainStarData", "src/i18n/starMapMessages.ts", "dataView", "Interstellar option2; presentationNavigation.ts routes to the separate Star Data child"],
  ["headerMainStarShip", "src/i18n/starshipMessages.ts", "title", "Interstellar option3; presentationNavigation.ts routes to Starship", true],
  ["headerMainFleetHangar", "src/i18n/starshipMessages.ts", "fleetHangar", "Interstellar option4; presentationNavigation.ts routes to Fleet Hangar"],
  ["headerMainColonise", "src/i18n/starshipMessages.ts", "coloniseTabLabel", "Interstellar option5; presentationNavigation.ts routes to Colonise"],
  ["headerMainMining", "src/i18n/spaceMessages.ts", "miningTitle", "Space Mining option8; presentationNavigation.ts routes to Asteroid Mining", true],
  ["headerMainSpaceTelescope", "src/i18n/spaceMessages.ts", "telescopeTitle", "Space Mining option6; presentationNavigation.ts routes to Space Telescope"],
  ["headerMainAsteroids", "src/i18n/spaceMessages.ts", "asteroidsTitle", "Space Mining option7; presentationNavigation.ts routes to Asteroids"],
  ["headerMainLaunchPad", "src/i18n/rocketMessages.ts", "launchPadTitle", "Space Mining option1; presentationNavigation.ts routes to Launch Pad"],
  ["headerMainRebirth", "src/i18n/metaMessages.ts", "rebirthTabLabel", "Galactic option1; presentationNavigation.ts keeps Rebirth as its own child"],
  ["headerMainGalacticMarket", "src/i18n/metaMessages.ts", "heading", "Galactic option2; presentationNavigation.ts keeps Market as its own child", true],
  ["headerMainGalacticCasino", "src/i18n/casinoMessages.ts", "title", "Galactic option6; presentationNavigation.ts routes to the separate Casino child after Market"],
  ["headerMainAscendencyPerks", "src/i18n/metaMessages.ts", "perksTitle", "Galactic option3; presentationNavigation.ts keeps Ascendency Perks as its own child"],
  ["headerMainMegastructures", "src/i18n/megastructureMessages.ts", "title", "Galactic option4; presentationNavigation.ts keeps Megastructures as its own child"],
  ["headerMainBlackHole", "src/i18n/blackHoleMessages.ts", "title", "Galactic option5; presentationNavigation.ts keeps Black Hole as its own child"],
  ["headerMainSituation", "src/i18n/cosmicRipMessages.ts", "situationTitle", "Cosmic Rip option1; presentationNavigation.ts routes to Situation"],
  ["headerMainNearSpaceScannerArray", "src/i18n/cosmicRipMessages.ts", "scannerArrayTitle", "Cosmic Rip option2; presentationNavigation.ts routes to the distinct Scanner Array child"],
  ["headerMainCosmicRipTab", "src/i18n/cosmicRipMessages.ts", "ripPaneTitle", "Cosmic Rip option3; presentationNavigation.ts routes to the Cosmic Rip child"],
  ["headerMainAchievements", "src/i18n/settingsMessages.ts", "achievements", "Settings option10; presentationNavigation.ts keeps Achievements as a distinct destination"],
  ["headerMainEvents", "src/i18n/settingsMessages.ts", "events", "Settings option14; presentationNavigation.ts keeps Events as a distinct destination", true],
  ["headerMainStatistics", "src/i18n/settingsMessages.ts", "statistics", "Settings option8; presentationNavigation.ts keeps Statistics as a distinct destination"],
  ["headerMainVisual", "src/i18n/settingsMessages.ts", "visual", "Settings option1; presentationNavigation.ts keeps Visual Settings as a distinct destination", true],
  ["headerMainGameOptions", "src/i18n/settingsMessages.ts", "gameOptions", "Settings option3; presentationNavigation.ts keeps Game Options as a distinct destination"],
  ["headerMainSavingLoading", "src/i18n/settingsMessages.ts", "savingSection", "Settings option2; presentationNavigation.ts keeps Saving / Loading as a distinct destination", true],
];
const verifiedNavigationLabelTargets = new Map();
for (const [sourceKey, targetFile, targetPath, route, adapted = false] of navigationLabelDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedNavigationLabelTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
      adapted,
    });
  }
}
const settingsCopyDefinitions = new Map([
  ["tab9ThemeRowLabel", ["src/i18n/settingsMessages.ts", "theme", "Settings → Visual → Theme label in SettingsPane.tsx"]],
  ["tab9ThemeRowDescription", ["src/i18n/settingsMessages.ts", "themeRowDescription", "Settings → Visual → Theme description in SettingsPane.tsx"]],
  ["tab9CurrencyRowLabel", ["src/i18n/settingsMessages.ts", "currency", "Settings → Visual → Currency label in SettingsPane.tsx"]],
  ["tab9CurrencyRowDescription", ["src/i18n/settingsMessages.ts", "currencyDescription", "Settings → Visual → Currency description in SettingsPane.tsx", true]],
  ["tab9NotationRowLabel", ["src/i18n/settingsMessages.ts", "notation", "Settings → Visual → Notation label in SettingsPane.tsx"]],
  ["tab9NotationRowDescription", ["src/i18n/settingsMessages.ts", "notationRowDescription", "Settings → Visual → Notation description in SettingsPane.tsx"]],
  ["tab9ToggleNotificationsRowLabel", ["src/i18n/settingsMessages.ts", "notifications", "Settings → Visual → Notifications label in SettingsPane.tsx"]],
  ["tab9ToggleNotificationsRowDescription", ["src/i18n/settingsMessages.ts", "notificationsRowDescription", "Settings → Visual → Notifications description in SettingsPane.tsx"]],
  ["tab9CustomPointerRowLabel", ["src/i18n/settingsMessages.ts", "customPointer", "Settings → Visual → Custom Pointer label in SettingsPane.tsx"]],
  ["tab9CustomPointerRowDescription", ["src/i18n/settingsMessages.ts", "customPointerDescription", "Settings → Visual → Custom Pointer description in SettingsPane.tsx", true]],
  ["tab9MouseTrailRowLabel", ["src/i18n/settingsMessages.ts", "pointerTrail", "Settings → Visual → Mouse Trail label in SettingsPane.tsx"]],
  ["tab9MouseTrailRowDescription", ["src/i18n/settingsMessages.ts", "pointerTrailDescription", "Settings → Visual → Mouse Trail description in SettingsPane.tsx"]],
  ["tab9WeatherEffectsRowLabel", ["src/i18n/settingsMessages.ts", "weatherEffects", "Settings → Visual → Weather Effects label in SettingsPane.tsx"]],
  ["tab9WeatherEffectsRowDescription", ["src/i18n/settingsMessages.ts", "weatherEffectsDescription", "Settings → Visual → Weather Effects description in SettingsPane.tsx"]],
  ["tab9ToggleFullScreenRowLabel", ["src/i18n/settingsMessages.ts", "fullscreen", "Settings → Game Options → Full Screen label in SettingsPane.tsx"]],
  ["tab9ToggleFullScreenRowDescription", ["src/i18n/settingsMessages.ts", "fullscreenDescription", "Settings → Game Options → Full Screen description in SettingsPane.tsx"]],
  ["settingsLanguageRowLabel", ["src/i18n/settingsMessages.ts", "language", "Settings → Game Options → Language label in SettingsPane.tsx"]],
  ["settingsLanguageRowDescription", ["src/i18n/settingsMessages.ts", "languageRowDescription", "Settings → Game Options → Language description in SettingsPane.tsx"]],
  ["tab9NewsTickerRowLabel", ["src/i18n/settingsMessages.ts", "newsTicker", "Settings → Game Options → News Ticker label in SettingsPane.tsx"]],
  ["tab9NewsTickerRowDescription", ["src/i18n/settingsMessages.ts", "newsTickerRowDescription", "Settings → Game Options → News Ticker description in SettingsPane.tsx"]],
  ["tab9BackgroundAudioRowLabel", ["src/i18n/settingsMessages.ts", "backgroundAudio", "Settings → Game Options → Background Ambience label in SettingsPane.tsx"]],
  ["tab9BackgroundAudioRowDescription", ["src/i18n/settingsMessages.ts", "backgroundAudioRowDescription", "Settings → Game Options → Background Ambience description in SettingsPane.tsx"]],
  ["tab9SfxRowLabel", ["src/i18n/settingsMessages.ts", "soundEffects", "Settings → Game Options → Sound Effects label in SettingsPane.tsx"]],
  ["tab9SfxRowDescription", ["src/i18n/settingsMessages.ts", "soundEffectsRowDescription", "Settings → Game Options → Sound Effects description in SettingsPane.tsx"]],
  ["tab9EventsActiveTitle", ["src/i18n/metaSignalMessages.ts", "activeTitle", "Settings → Events → Active Events heading in MetaJournalPane.tsx"]],
  ["tab9EventsHistoryTitle", ["src/i18n/metaSignalMessages.ts", "history", "Settings → Events → Event History heading in MetaJournalPane.tsx"]],
  ["tab9EventsColumnActiveUntil", ["src/i18n/metaSignalMessages.ts", "activeUntil", "Settings → Events → active-event expiry label in MetaJournalPane.tsx"]],
  ["tab9EventsColumnTotalDuration", ["src/i18n/metaSignalMessages.ts", "totalDuration", "Settings → Events → history duration label in MetaJournalPane.tsx"]],
  ["tab9EventsNoneActive", ["src/i18n/metaSignalMessages.ts", "noActiveEvents", "Settings → Events → empty active-events state in MetaJournalPane.tsx"]],
  ["tab9EventsNoneCompleted", ["src/i18n/metaSignalMessages.ts", "noCompletedEvents", "Settings → Events → empty history state in MetaJournalPane.tsx"]],
  ["settingsThemeContent1", ["src/i18n/settingsMessages.ts", "themeHelpDescription", "Settings → Visual → Theme information tooltip in SettingsPane.tsx"]],
  ["settingsCurrencySymbolContent1", ["src/i18n/settingsMessages.ts", "currencyHelpDescription", "Settings → Visual → Currency information tooltip in SettingsPane.tsx"]],
  ["settingsNotationContent1", ["src/i18n/settingsMessages.ts", "notationHelpDescription", "Settings → Visual → Notation information tooltip in SettingsPane.tsx"]],
  ["settingsToggleNotificationsContent1", ["src/i18n/settingsMessages.ts", "notificationsHelpDescription", "Settings → Visual → Notifications information tooltip in SettingsPane.tsx"]],
]);
for (const themeId of ["terminal", "dark", "supernova", "galaxy", "space", "misty", "light", "frosty", "summer"]) {
  const themeName = themeId[0].toLocaleUpperCase("en") + themeId.slice(1);
  settingsCopyDefinitions.set(`dropdownTheme${themeName}`, [
    "src/i18n/settingsMessages.ts",
    `themes.${themeId}`,
    `Settings → Visual → ${themeId} theme option in SettingsPane.tsx`,
  ]);
}
const currencyChoiceIds = new Map([
  ["dropdownCurrencyDollar", "usd"],
  ["dropdownCurrencyEuro", "eur"],
  ["dropdownCurrencyPound", "gbp"],
  ["dropdownCurrencyYen", "jpy"],
  ["dropdownCurrencyRupee", "inr"],
  ["dropdownCurrencyWon", "krw"],
  ["dropdownCurrencyFranc", "chf"],
  ["dropdownCurrencyBitcoin", "btc"],
]);
for (const [sourceKey, currencyId] of currencyChoiceIds) {
  settingsCopyDefinitions.set(sourceKey, [
    "src/content/currency.ts",
    currencyId,
    `Settings → Visual → Currency option; SettingsPane.tsx composes CURRENCY_SYMBOLS.${currencyId} and CURRENCY_CODES.${currencyId}`,
    true,
  ]);
}
const currencyTargetSource = fs.readFileSync(path.join(projectRoot, "src", "content", "currency.ts"), "utf8");
const currencySymbolsBlock = currencyTargetSource.match(/export const CURRENCY_SYMBOLS[^=]*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? "";
const currencyCodesBlock = currencyTargetSource.match(/export const CURRENCY_CODES[^=]*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? "";
const hasSettingsCopyTarget = (targetFile, targetPath) => targetFile === "src/content/currency.ts"
  ? new RegExp(`^\\s*${targetPath}:\\s*"[^"\\r\\n]+"`, "mu").test(currencySymbolsBlock) &&
    new RegExp(`^\\s*${targetPath}:\\s*"[^"\\r\\n]+"`, "mu").test(currencyCodesBlock)
  : hasPopulatedTargetPath(targetFile, targetPath);
const verifiedSettingsCopyTargets = new Map();
for (const [sourceKey, [targetFile, targetPath, route, adapted = false]] of settingsCopyDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasSettingsCopyTarget(targetFile, targetPath)
  ) {
    verifiedSettingsCopyTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
      adapted,
    });
  }
}
const saveSettingsCopyDefinitions = new Map([
  ["tab9AutoSaveRowLabel", [["autoSave"], "Settings → Saving / Loading → autosave control label in SettingsPane.tsx"]],
  ["dropdownAutoSave2Minutes", [["every5Minutes"], "Settings → Saving / Loading → autosave interval option; source 2-minute choice maps to the target 5-minute label", true]],
  ["dropdownAutoSave3Minutes", [["every15Minutes"], "Settings → Saving / Loading → autosave interval option; source 3-minute choice maps to the target 15-minute label", true]],
  ["dropdownAutoSave5Minutes", [["every30Minutes"], "Settings → Saving / Loading → autosave interval option; source 5-minute choice maps to the target 30-minute label", true]],
  ["dropdownAutoSave10Minutes", [["everyHour"], "Settings → Saving / Loading → autosave interval option; source 10-minute choice maps to the target 60-minute label", true]],
  ["notificationAutoSaveOff", [["autoSaveDisabledWarning"], "Settings → Saving / Loading → selected-locale autosave-off notice in SettingsPane.tsx", true]],
  ["tab9ExportSaveRowLabel", [["export"], "Settings → Saving / Loading → Save Manager export heading in SaveManager.tsx"]],
  ["placeholderExportSaveArea", [["export"], "Settings → Saving / Loading → accessible name for the populated portable-code export field in SaveManager.tsx", true]],
  ["buttonExport", [["copy"], "Settings → Saving / Loading → clipboard export action in SaveManager.tsx", true]],
  ["buttonManualSave", [["download"], "Settings → Saving / Loading → file download action in SaveManager.tsx", true]],
  ["tab9ImportSaveRowLabel", [["import"], "Settings → Saving / Loading → Save Manager import heading in SaveManager.tsx"]],
  ["placeholderImportSaveArea", [["importText"], "Settings → Saving / Loading → accessible name for the import textarea in SaveManager.tsx", true]],
  ["buttonManualLoad", [["file"], "Settings → Saving / Loading → local save file picker label in SaveManager.tsx", true]],
  ["buttonImport", [["preview", "importNew", "replace"], "Settings → Saving / Loading → target preview step followed by the explicit import-new or replace choice in SaveManager.tsx", true]],
  ["notificationGameLoadedSuccessfully", [["loaded"], "Settings → Saving / Loading → selected-locale successful load notice in SaveManager.tsx"]],
  ["notificationDataCopiedToClipboard", [["clipboardCopied"], "Settings → Saving / Loading → clipboard success notice from SaveManager.tsx"]],
  ["notificationErrorCopyingData", [["clipboardCopyError"], "Settings → Saving / Loading → clipboard failure notice from SaveManager.tsx"]],
  ["notificationErrorLoadingSaveString", [["errInvalidSaveString"], "Settings → Saving / Loading → selected-locale invalid portable-save notice from SaveManager.tsx", true]],
  ["tab9HardResetRowLabel", [["delete"], "Settings -> Saving / Loading -> active named pioneer slot delete action; source reset targets only getSaveName() and target deletes that local slot", true]],
  ["tab9HardResetRowDescription", [["deletePrompt"], "Settings -> Saving / Loading -> inline active-slot deletion warning; source reset is adapted to local per-slot deletion", true]],
  ["hardResetWarningHeader", [["confirmDelete"], "Settings -> Saving / Loading -> destructive-confirm legend and button; the source hard-reset title is adapted to the per-pioneer local deletion action", true]],
  ["hardResetWarningText", [["deletePrompt"], "Settings -> Saving / Loading -> active-slot deletion warning; source all-progress warning is adapted to the target's per-pioneer scope and export-first safeguard", true]],
]);
const verifiedSaveSettingsCopyTargets = new Map();
for (const [sourceKey, [targetPaths, route, adapted = false]] of saveSettingsCopyDefinitions) {
  const targetFile = "src/i18n/saveMessages.ts";
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    populatedTargetPaths(targetFile, targetPaths)
  ) {
    verifiedSaveSettingsCopyTargets.set(sourceKey, {
      target: `${targetFile}#${targetPaths.join("+")}`,
      route,
      adapted,
    });
  }
}
const settingsEventColumnDefinitions = new Map([
  ["tab9EventsColumnEvent", ["src/i18n/metaSignalMessages.ts#eventNames[RandomEventId]; src/app/MetaJournalPane.tsx#active-history-event-title", "Settings -> Events -> active/history cards display each selected-locale event name as the card title; no generic Event table heading is rendered", "randomEventName(locale"]],
  ["tab9EventsColumnEffect", ["src/i18n/randomEventDescriptionMessages.ts#eventDesc*; src/app/randomEventDescription.ts#active-history-effect-description", "Settings -> Events -> active/history cards display each selected-locale event-specific effect description beneath its title; no generic Effect table heading is rendered", "randomEventActiveEffectDescription"]],
]);
const verifiedSettingsEventColumnTargets = new Map();
const metaJournalTargetSource = fs.readFileSync(path.join(projectRoot, "src", "app", "MetaJournalPane.tsx"), "utf8");
const eventDescriptionTargetSource = fs.readFileSync(path.join(projectRoot, "src", "app", "randomEventDescription.ts"), "utf8");
for (const [sourceKey, [target, route, callsite]] of settingsEventColumnDefinitions) {
  const routeExists = callsite === "randomEventName(locale"
    ? metaJournalTargetSource.includes(callsite) &&
      metaJournalTargetSource.includes("randomEventName(locale, entry.id)")
    : metaJournalTargetSource.includes(callsite) &&
      metaJournalTargetSource.includes("randomEventHistoryDescription") &&
      eventDescriptionTargetSource.includes("randomEventDescriptionTemplate");
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    routeExists
  ) {
    verifiedSettingsEventColumnTargets.set(sourceKey, { target, route });
  }
}
const interstellarCopyDefinitions = new Map([
  ["diplomacyOptionsContent1", ["diplomacyOptionsHelp", "Interstellar -> Colonise child -> diplomacy-options help tooltip in StarshipPane.tsx"]],
  ["receptionStatusContent1", ["receptionStatusHelp", "Interstellar -> Colonise scan report -> reception-status help tooltip in StarshipPane.tsx"]],
  ["spaceFleetEnvoyBuildContent1", ["envoyDescription", "Interstellar -> Fleet Hangar child -> Envoy description in StarshipPane.tsx; adapted to the target diplomacy-channel action", true]],
  ["spaceFleetScoutBuildContent1", ["fleetScoutDescription", "Interstellar -> Fleet Hangar child -> Scout description in StarshipPane.tsx"]],
  ["spaceFleetMarauderBuildContent1", ["fleetMarauderDescription", "Interstellar -> Fleet Hangar child -> Marauder description in StarshipPane.tsx"]],
  ["spaceFleetLandStalkerBuildContent1", ["fleetLandStalkerDescription", "Interstellar -> Fleet Hangar child -> Land Stalker description in StarshipPane.tsx"]],
  ["spaceFleetNavalStraferBuildContent1", ["fleetNavalStraferDescription", "Interstellar -> Fleet Hangar child -> Naval Strafer description in StarshipPane.tsx"]],
  ["launchStarShipWarningHeader", ["pointOfNoReturnTitle", "Interstellar > Starship > confirmed Travel action warning dialog title; StarshipPane.tsx routes it to starshipMessages.pointOfNoReturnTitle", true]],
  ["launchStarShipWarningText", ["pointOfNoReturn", "Interstellar > Starship > confirmed Travel action irreversible-run warning; StarshipPane.tsx routes it to starshipMessages.pointOfNoReturn", true]],
  ["tab5TravellingToRowLabel", ["travellingTo", "Interstellar → Starship child → destination heading in StarshipPane.tsx"]],
  ["tab5PerformSystemScanRowLabel", ["performSystemScan", "Interstellar → Starship child → system-scan section heading in StarshipPane.tsx"]],
  ["buttonScanSystem", ["scanSystem", "Interstellar → Starship child → system scan action in StarshipPane.tsx"]],
  ["tab5ScanSystemDescription", ["scanActionHelp", "Interstellar → Starship child → system-scan action help tooltip in StarshipPane.tsx", true]],
  ["infoTooltipFleetHangarHeader", ["fleetHangarHelpLabel", "Interstellar → Fleet Hangar child → page-help accessible label in StarshipPane.tsx"]],
  ["tab5FleetHangarDescription", ["fleetHangarDescription", "Interstellar → Fleet Hangar child → selected-locale page description and computed fleet strength in StarshipPane.tsx", true]],
  ["tab5ColoniseDescription", ["coloniseDescription", "Interstellar → Colonise child → selected-locale description with system and fleet-power placeholders in StarshipPane.tsx", true]],
  ["tab5RelationsRowLabel", ["diplomacyTitle", "Interstellar → Colonise child → diplomacy section heading in StarshipPane.tsx", true]],
]);
const verifiedInterstellarCopyTargets = new Map();
for (const [sourceKey, [targetPath, route, adapted = false]] of interstellarCopyDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasStarshipTargetPath(targetPath)
  ) {
    verifiedInterstellarCopyTargets.set(sourceKey, {
      target: `src/i18n/starshipMessages.ts#${targetPath}`,
      route,
      adapted,
    });
  }
}
for (const [sourceKey, targetPath, route] of [
  ["spaceStarShipStellarScannerContent1", "scanActionHelp", "Interstellar > Starship > Stellar Scanner system-scan row help; StarshipPane.tsx renders the selected-locale scan-action InfoTooltip, shared with the separately keyed tab5ScanSystemDescription"],
  ["spaceStarShipDestinationReminderContent1", "noDestination", "Interstellar > Starship > no-destination reminder in the travel summary; StarshipPane.tsx renders the selected-locale instruction while no destination is selected"],
]) {
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasStarshipTargetPath(targetPath)
  ) {
    verifiedInterstellarCopyTargets.set(sourceKey, {
      target: `src/i18n/starshipMessages.ts#${targetPath}`,
      route,
      adapted: true,
    });
  }
}
const interstellarScanReportLabelDefinitions = new Map([
  ["tab5StarNameRowLabel", ["src/i18n/starMapMessages.ts", "sortName", "Interstellar -> Colonise scan report -> system-name field label; StarshipPane.tsx resolves the selected-locale Star Map name label"]],
  ["tab5CivilizationRowLabel", ["src/i18n/starshipMessages.ts", "raceName", "Interstellar -> Colonise scan report -> scanned race-name field label; the target keeps race name separate from civilization level", true]],
  ["labelType", ["src/i18n/starshipMessages.ts", "civilization", "Interstellar -> Colonise scan report -> civilization-level field label; StarshipPane.tsx renders the localized scan token", true]],
  ["tab5PopulationRowLabel", ["src/i18n/starshipMessages.ts", "population", "Interstellar -> Colonise scan report -> population-estimate field label"]],
  ["labelTraits", ["src/i18n/starshipMessages.ts", "lifeformTraits", "Interstellar -> Colonise scan report -> lifeform-traits field label", true]],
  ["tab5ThreatLevelRowLabel", ["src/i18n/starshipMessages.ts", "threat", "Interstellar -> Colonise scan report -> threat-level field label"]],
  ["labelThreat", ["src/i18n/starshipMessages.ts", "threat", "Interstellar -> Colonise scan report -> nested source threat reading is presented as the target Threat field", true]],
  ["labelDefense", ["src/i18n/starshipMessages.ts", "defense", "Interstellar -> Colonise scan report -> defense-rating field label"]],
  ["tab5EnemyFleetsRowLabel", ["src/i18n/starshipMessages.ts", "enemyFleets", "Interstellar -> Colonise scan report -> enemy-fleet counts field label with air/land/sea order"]],
  ["labelFleetAir", ["src/i18n/starshipMessages.ts", "enemyFleets", "Interstellar -> Colonise scan report -> target enemy-fleet heading carries the source air category in its localized air/land/sea label", true]],
  ["labelFleetLand", ["src/i18n/starshipMessages.ts", "enemyFleets", "Interstellar -> Colonise scan report -> target enemy-fleet heading carries the source land category in its localized air/land/sea label", true]],
  ["labelFleetSea", ["src/i18n/starshipMessages.ts", "enemyFleets", "Interstellar -> Colonise scan report -> target enemy-fleet heading carries the source sea category in its localized air/land/sea label", true]],
  ["tab5AnomaliesRowLabel", ["src/i18n/starshipMessages.ts", "anomalies", "Interstellar -> Colonise scan report -> anomalies field label"]],
  ["tab5AttitudeRowLabel", ["src/i18n/starshipMessages.ts", "attitude", "Interstellar -> Colonise scan report -> contact attitude field label"]],
  ["tab5IntelligenceRowLabel", ["src/i18n/starshipMessages.ts", "civilization+lifeformTraits+defense", "Interstellar -> Colonise scan report -> source grouped intelligence readings are split into civilization, traits, and defense fields; the target has no standalone Intelligence heading", true]],
  ["tab5ScanResultsAnalyse", ["src/i18n/starshipMessages.ts", "scanReport", "Interstellar -> Colonise scan report -> structured report heading replaces the source fitted-scanner analysis prompt", true]],
  ["tab5ScanResultsNoScanner", ["src/i18n/starshipMessages.ts", "scanLimited", "Interstellar -> Starship and Colonise -> limited scan notice when the Stellar Scanner is not installed", true]],
  ["tab5BattleDescription", ["src/i18n/starshipMessages.ts", "coloniseBattleDescription", "Interstellar -> Colonise -> war-mode battle description before fleet engagement", true]],
  ["tab5BuildFleetsToEngage", ["src/i18n/starshipMessages.ts", "coloniseBuildFleets", "Interstellar -> Colonise -> patience-expired zero-attack-power branch prompts the player to build fleets; current deterministic fixtures do not reach it", true]],
  ["tab5SettleNoResistance", ["src/i18n/starshipMessages.ts", "coloniseNoResistance", "Interstellar -> Colonise -> immediate settlement result when the scanned destination has no resistance", true]],
  ["labelLife", ["src/i18n/starshipMessages.ts", "lifeDetected+noLifeDetected", "Interstellar -> Colonise scan status -> target expresses the life/no-life result as localized status copy without a separate Life label", true]],
  ["labelWeather", ["src/i18n/starMapMessages.ts", "weather", "Interstellar -> Colonise scan report -> localized weather field label"]]
]);
const verifiedInterstellarScanReportLabelTargets = new Map();
for (const [sourceKey, [targetFile, targetPaths, route, adapted = false]] of interstellarScanReportLabelDefinitions) {
  const paths = targetPaths.split("+");
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    paths.every((targetPath) => hasPopulatedTargetPath(targetFile, targetPath))
  ) {
    verifiedInterstellarScanReportLabelTargets.set(sourceKey, {
      target: targetFile + "#" + targetPaths,
      route,
      adapted,
    });
  }
}
const interstellarTooltipDefinitions = new Map([
  ["infoTooltipStarLegendName", ["src/i18n/starMapMessages.ts", "starDataNameHelp", "Interstellar -> Star Data -> Name column header; StarMapPane.tsx exposes the selected-locale sort explanation through the focusable tooltip"]],
  ["infoTooltipStarLegendWeather", ["src/i18n/starMapMessages.ts", "starDataWeatherHelp", "Interstellar -> Star Data -> Weather column header; StarMapPane.tsx exposes the selected-locale weather explanation through the focusable tooltip"]],
  ["infoTooltipStarMapModes", ["src/i18n/starMapMessages.ts", "mapModesHelp", "Interstellar -> Star Map -> map mode selector; StarMapPane.tsx exposes the selected-locale mode guidance through the focusable tooltip"]],
  ["infoTooltipStarShipScanAP", ["src/i18n/starshipMessages.ts", "scanApHelp", "Interstellar -> Colonise -> Starship scan report AP field; StarshipPane.tsx exposes the selected-locale report help through the focusable tooltip"]],
  ["infoTooltipStarShipScanPrecipitation", ["src/i18n/starshipMessages.ts", "scanWeatherHelp", "Interstellar -> Colonise -> Starship scan report weather/precipitation field; StarshipPane.tsx exposes the selected-locale report help through the focusable tooltip"]],
  ["infoTooltipStarShipScanType", ["src/i18n/starshipMessages.ts", "scanCivilizationHelp", "Interstellar -> Colonise -> Starship scan report civilization/type field; StarshipPane.tsx exposes the selected-locale report help through the focusable tooltip"]],
  ["infoTooltipStarShipScanDefense", ["src/i18n/starshipMessages.ts", "scanDefenseHelp", "Interstellar -> Colonise -> Starship scan report defense field; StarshipPane.tsx exposes the selected-locale report help through the focusable tooltip"]],
  ["infoTooltipStarShipScanEnemyFleets", ["src/i18n/starshipMessages.ts", "scanEnemyFleetsHelp", "Interstellar -> Colonise -> Starship scan report enemy-fleets field; StarshipPane.tsx exposes the selected-locale report help through the focusable tooltip"]],
  ["infoTooltipStarShipScanThreatLevel", ["src/i18n/starshipMessages.ts", "scanThreatHelp", "Interstellar -> Colonise -> Starship scan report threat-level field; StarshipPane.tsx exposes the selected-locale report help through the focusable tooltip"]],
]);
const verifiedInterstellarTooltipTargets = new Map();
for (const [sourceKey, [targetFile, targetPath, route]] of interstellarTooltipDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    (targetFile === "src/i18n/starshipMessages.ts"
      ? hasStarshipTargetPath(targetPath)
      : hasPopulatedTargetPath(targetFile, targetPath))
  ) {
    verifiedInterstellarTooltipTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}[locale]`,
      route,
      adapted: true,
    });
  }
}
const additionalPageCopyDefinitions = new Map([
  ["blackHoleValueHint", ["src/i18n/blackHoleMessages.ts", "researchHelp", "Galactic → Black Hole child → research InfoTooltip in BlackHolePane.tsx"]],
]);
const blackHoleDiscoveryCopyDefinitions = new Map([
  ["modalBlackHoleDiscoveredHeader", ["title", "Galactic > Black Hole discovery result dialog title; blackHoleEventNotifications.ts routes the discovery event to the selected-locale dialog"]],
  ["modalBlackHoleDiscoveredText", ["summary + lines[0].text + lines[1].text", "Galactic > Black Hole discovery result dialog summary and both body lines; blackHoleEventNotifications.ts routes the discovery event to the selected-locale dialog"]],
  ["notificationThisShouldBeInteresting", ["confirmLabel", "Galactic > Black Hole discovery result dialog confirmation action; the selected-locale dialog retains the source confirmation step"]],
]);
const blackHolePaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "BlackHolePane.tsx"), "utf8");
const blackHoleEventSource = fs.readFileSync(path.join(projectRoot, "src", "app", "blackHoleEventNotifications.ts"), "utf8");
const blackHoleControlCopyDefinitions = new Map([
  ["blackHoleInteractionResearchPointsLabel", ["researchPoints", "Galactic > Black Hole > current Research Points balance; BlackHolePane.tsx displays the selected-locale label with the live balance", true]],
  ["buttonResearchBlackHole", ["researchAction", "Galactic > Black Hole > research action; BlackHolePane.tsx renders the selected-locale control label", false]],
  ["buttonResearchBlackHoleWithPrice", ["researchAction + researchPoints", "Galactic > Black Hole > pre-research action; BlackHolePane.tsx combines the localized action and Research Points label with the live formatted price", true]],
  ["buttonBlackHolePower", ["upgradeNames.power", "Galactic > Black Hole > Power upgrade card heading; BlackHolePane.tsx renders the selected-locale power upgrade name", false]],
  ["buttonBlackHoleDuration", ["upgradeNames.duration", "Galactic > Black Hole > Duration upgrade card heading; BlackHolePane.tsx renders the selected-locale duration upgrade name", false]],
  ["buttonBlackHoleRecharge", ["upgradeNames.recharge", "Galactic > Black Hole > Recharge upgrade card heading; BlackHolePane.tsx renders the selected-locale recharge upgrade name", false]],
  ["buttonBlackHoleCharge", ["chargeAction", "Galactic > Black Hole > charge action button; BlackHolePane.tsx renders the selected-locale action", false]],
  ["buttonBlackHoleChargeActive", ["chargingAction", "Galactic > Black Hole > disabled charging action; BlackHolePane.tsx renders the selected-locale status label", false]],
  ["buttonBlackHoleCharging", ["chargingAction", "Galactic > Black Hole > disabled charging action; BlackHolePane.tsx renders the selected-locale status label", false]],
  ["buttonBlackHoleActivate", ["activate", "Galactic > Black Hole > activation action button; BlackHolePane.tsx renders the selected-locale action", false]],
  ["buttonBlackHolePowerUpgrade", ["upgradeNames.power + researchPoints", "Galactic > Black Hole > Power upgrade card; the remake shows its localized heading plus current/next values and price", true]],
  ["buttonBlackHoleDurationAlwaysActive", ["upgradeMaxed.duration", "Galactic > Black Hole > maxed Duration card; BlackHolePane.tsx renders its selected-locale always-active state", false]],
  ["buttonBlackHoleDurationUpgrade", ["upgradeNames.duration + researchPoints", "Galactic > Black Hole > Duration upgrade card; the remake shows its localized heading plus current/next values and price", true]],
  ["buttonBlackHoleRechargeMaxed", ["upgradeMaxed.recharge", "Galactic > Black Hole > maxed Recharge card; BlackHolePane.tsx renders its selected-locale minimum-charge state", true]],
  ["buttonBlackHoleRechargeUpgrade", ["upgradeNames.recharge + researchPoints", "Galactic > Black Hole > Recharge upgrade card; the remake shows its localized heading plus current/next values and price", true]],
  ["buttonBlackHoleRechargeFinalUpgrade", ["rechargeFinalUpgrade + researchPoints", "Galactic > Black Hole > final Recharge upgrade card; the remake shows its localized always-active destination plus price", true]],
  ["textBlackHoleCharging", ["charging", "Galactic > Black Hole > inactive charge progress status; BlackHolePane.tsx renders the selected-locale charging state", false]],
  ["textBlackHoleChargingWithTime", ["charging", "Galactic > Black Hole > active charge countdown; BlackHolePane.tsx combines the selected-locale status label with its formatted remaining time", true]],
  ["textBlackHoleCharged", ["ready", "Galactic > Black Hole > charge-ready state; BlackHolePane.tsx renders the selected-locale status", false]],
  ["textBlackHoleActivated", ["warping", "Galactic > Black Hole > inactive time-warp status; BlackHolePane.tsx renders the selected-locale state", false]],
  ["textBlackHoleActivatedWithPower", ["warping + power", "Galactic > Black Hole > active time-warp status; the remake shows localized status and multiplier separately with a formatted countdown", true]],
  ["textBlackHoleAlwaysActiveWithPower", ["alwaysOn + power", "Galactic > Black Hole > continuous time-warp status; the remake shows localized status and Power multiplier separately", true]],
  ["textTimeWarpMultiplier", ["power", "Galactic > Black Hole > live time-warp multiplier; BlackHolePane.tsx displays it in the Power statistic", true]],
  ["blackHoleChargeProgressContent1", ["charging", "Galactic > Black Hole > charge progress; the source help row is replaced by its charging state, which BlackHolePane.tsx renders with the localized progress label", true]],
  ["blackHoleTimeWarpProgressContent1", ["warping", "Galactic > Black Hole > time-warp progress; the source help row is replaced by its active-warp state, which BlackHolePane.tsx renders with the localized progress label", true]],
  ["blackHoleInteractionContent1", ["interactionHelp", "Galactic > Black Hole > interaction research and upgrade section introduction; BlackHolePane.tsx renders the selected-locale explanation beside the active controls", true]],
  ["blackHoleStatsContent1", ["statsHelp", "Galactic > Black Hole > charge and Power statistics section introduction; BlackHolePane.tsx renders the selected-locale explanation above the stats", true]],
  ["blackHoleActivationContent1", ["activate", "Galactic > Black Hole > activation action; BlackHolePane.tsx renders the selected-locale activation button", true]],
  ["notificationBlackHoleCharged", ["chargedNotification", "Galactic > Black Hole > charge-completed floating notice; blackHoleEventNotifications.ts selects the locale at event time", false]],
]);
const verifiedBlackHoleControlCopyTargets = new Map();
for (const [sourceKey, [targetPathsText, route, adapted]] of blackHoleControlCopyDefinitions) {
  const targetPaths = targetPathsText.split(" + ");
  const sourceKeyIsReferenced = sourceText.some(([, text]) => text.includes(sourceKey));
  const routeExists = sourceKey === "notificationBlackHoleCharged"
    ? blackHoleEventSource.includes("messages.chargedNotification")
    : blackHolePaneSource.includes("blackHoleText(locale)");
  if (
    sourceKeys.includes(sourceKey) &&
    sourceKeyIsReferenced &&
    routeExists &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    populatedTargetPaths("src/i18n/blackHoleMessages.ts", targetPaths)
  ) {
    verifiedBlackHoleControlCopyTargets.set(sourceKey, {
      target: targetPaths.map((targetPath) => `src/i18n/blackHoleMessages.ts#${targetPath}`).join(" + "),
      route,
      adapted,
    });
  }
}
const spaceMiningSourcePane = fs.readFileSync(path.join(projectRoot, "src", "app", "SpaceMiningPane.tsx"), "utf8");
const sourceTooltipCopyDefinitions = new Map([
  ["infoTooltipMiningHeader", [
    "src/i18n/spaceMessages.ts#miningHeaderHelp + src/i18n/spaceMessages.ts#miningLayoutHelp + src/i18n/spaceMessages.ts#miningHelp",
    "Space Mining > Mining child > selected-locale header InfoTooltip; SpaceMiningPane.tsx renders the three adapted sections together",
  ]],
  ["infoTooltipLaunchPadHeader", [
    "src/i18n/rocketMessages.ts#launchPadHeaderHelp + src/i18n/rocketMessages.ts#launchPadHelp",
    "Space Mining > Launch Pad child > selected-locale header InfoTooltip; SpaceMiningPane.tsx renders the overview and workflow instructions together",
  ]],
  ["infoTooltipAsteroidsHeader", [
    "src/i18n/spaceMessages.ts#asteroidsHeaderHelp + src/i18n/spaceMessages.ts#asteroidsTableHelp + src/i18n/spaceMessages.ts#asteroidDistanceHelp + src/i18n/spaceMessages.ts#asteroidComplexityHelp + src/i18n/spaceMessages.ts#asteroidAntimatterHelp + src/i18n/spaceMessages.ts#asteroidsHelp",
    "Space Mining > Asteroids child > selected-locale header InfoTooltip; SpaceMiningPane.tsx renders the table, distance, complexity, and Antimatter guidance together; remake travel and unavailable Destroyed status are documented adaptations",
  ]],
  ["infoTooltipRebirthLiquidation", [
    "src/i18n/metaMessages.ts#liquidationHelp",
    "Galactic > Rebirth > asset liquidation card calculation help; AssetLiquidationCard.tsx renders the selected-locale formula guidance. Cosmic Forge declares this key but has no source DOM callsite, so this target is a documented adaptation",
  ]],
]);
const verifiedSourceTooltipCopyTargets = new Map();
for (const [sourceKey, [targetPathsText, route]] of sourceTooltipCopyDefinitions) {
  const targetDefinitions = targetPathsText.split(" + ").map((target) => {
    const separator = target.indexOf("#");
    return [target.slice(0, separator), target.slice(separator + 1)];
  });
  const routeIsActive = sourceKey === "infoTooltipRebirthLiquidation"
    ? assetLiquidationSource.includes('marketText(locale, "liquidationHelp")')
    : targetDefinitions.every(([targetFile, targetPath]) =>
      targetFile === "src/i18n/rocketMessages.ts"
        ? spaceMiningSourcePane.includes(`rocketText(locale, "${targetPath}")`)
        : spaceMiningSourcePane.includes(`spaceText(locale, "${targetPath}")`),
    );
  if (
    sourceKeys.includes(sourceKey) &&
    routeIsActive &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    targetDefinitions.every(([targetFile, targetPath]) => hasPopulatedTargetPath(targetFile, targetPath))
  ) {
    verifiedSourceTooltipCopyTargets.set(sourceKey, {
      target: targetDefinitions.map(([targetFile, targetPath]) => `${targetFile}#${targetPath}`).join(" + "),
      route,
    });
  }
}
const allocationPaneSource = fs.readFileSync(path.join(projectRoot, "src", "app", "EconomyPanes.tsx"), "utf8");
const allocationTooltipDefinitions = new Map([
  ["tooltipSliderHeading", "sliderHeading"],
  ["tooltipSliderIntro", "introduction"],
  ["tooltipSliderLegendStorage", "storage"],
  ["tooltipSliderLegendCash", "cash"],
  ["tooltipSliderLegendCompounds", "compounds"],
  ["tooltipSliderCashHandle", "cashHandle"],
  ["tooltipSliderCashOff", "cashOff"],
  ["tooltipSliderCompoundHandle", "compoundHandle"],
  ["tooltipSliderFallsBack", "compoundFallback"],
  ["tooltipSliderStorageFull", "storageFull"],
  ["allocationHandleCash", "cashHandleLabel"],
  ["allocationHandleCompound", "compoundHandleLabel"],
  ["tooltipSliderCompoundOff", "compoundOff"],
  ["tooltipSliderCompoundThrottled", "compoundThrottled"],
  ["tooltipSliderBreakdownHint", "breakdownHint"],
]);
const verifiedAllocationTooltipTargets = new Map();
for (const [sourceKey, targetPath] of allocationTooltipDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    allocationPaneSource.includes("allocationTooltipMessages(locale,") &&
    allocationPaneSource.includes(`allocationTooltip.${targetPath}`) &&
    hasPopulatedTargetPath("src/i18n/allocationTooltipMessages.ts", targetPath)
  ) {
    verifiedAllocationTooltipTargets.set(sourceKey, {
      target: `src/i18n/allocationTooltipMessages.ts#${targetPath}`,
      route: `Resources > ${sourceKey === "tooltipAllocationHeading" ? "production allocation overview" : "allocation slider"} InfoTooltip; EconomyPanes.tsx renders the selected-locale allocationTooltipMessages(locale, values) copy`,
    });
  }
}
const resourceAllocationBreakdownSource = fs.readFileSync(
  path.join(projectRoot, "src", "app", "ResourceAllocationBreakdownTooltip.tsx"),
  "utf8",
);
const resourceAllocationBreakdownDefinitions = new Map([
  ["tooltipAllocationHeading", ["heading", "Resource rate breakdown and Compound rate tooltip heading"]],
  ["tooltipAllocationAllocatable", ["allocatable", "Resource production-rate breakdown allocatable row"]],
  ["tooltipAllocationToCash", ["soldForCash", "Resource production-rate breakdown automatic-sale row"]],
  ["tooltipAllocationToStorage", ["storage", "Resource breakdown and Compound net-rate storage row"]],
  ["tooltipAllocationCeiling", ["compoundCeiling", "Resource production-rate breakdown compound-use ceiling"]],
  ["tooltipResourcesDivertedToCreate", ["divertedToCreate", "Resource production-rate breakdown per-compound ingredient draw"]],
  ["tooltipAutoSellIncome", ["autoSellIncome", "Resource production-rate breakdown automatic-sale income"]],
  ["infoTooltipAutoCreateAllocation", ["autoCreationLabel", "Compound net-rate tooltip shows its localized auto-creation row"]],
  ["tooltipAllocationThrottledBy", ["throttledBy", "Compound net-rate tooltip names the limiting resource when auto-creation is throttled"]],
]);
const verifiedResourceAllocationBreakdownTargets = new Map();
for (const [sourceKey, [targetPath, route]] of resourceAllocationBreakdownDefinitions) {
  const routeIsActive = sourceKey === "infoTooltipAutoCreateAllocation" || sourceKey === "tooltipAllocationThrottledBy"
    ? allocationPaneSource.includes(`copy.${targetPath}`)
    : resourceAllocationBreakdownSource.includes(`copy.${targetPath}`);
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([, text]) => text.includes(sourceKey)) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    routeIsActive &&
    hasPopulatedTargetPath("src/i18n/resourceAllocationBreakdownMessages.ts", targetPath)
  ) {
    verifiedResourceAllocationBreakdownTargets.set(sourceKey, {
      target: `src/i18n/resourceAllocationBreakdownMessages.ts#${targetPath}`,
      route,
    });
  }
}
const verifiedAdditionalPageCopyTargets = new Map();
for (const [sourceKey, [targetFile, targetPath, route]] of additionalPageCopyDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedAdditionalPageCopyTargets.set(sourceKey, {
      target: `${targetFile}#${targetPath}`,
      route,
    });
  }
}
for (const [sourceKey, [targetPathsText, route]] of blackHoleDiscoveryCopyDefinitions) {
  const targetPaths = targetPathsText.split(" + ");
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    targetPaths.every((targetPath) => hasPopulatedTargetPath("src/i18n/blackHoleMessages.ts", targetPath))
  ) {
    verifiedAdditionalPageCopyTargets.set(sourceKey, {
      target: targetPaths.map((targetPath) => `src/i18n/blackHoleMessages.ts#${targetPath}`).join(" + "),
      route,
    });
  }
}
const galacticMarketHelpDefinitions = new Map([
  ["galacticMarketOutgoingTitle", ["outgoingTitle", "Galactic â†’ Market child â†’ outgoing-bias section heading in the market bias InfoTooltip"]],
  ["galacticMarketOutgoingText", ["outgoingBody", "Galactic â†’ Market child â†’ outgoing-bias explanation in the market bias InfoTooltip"]],
  ["galacticMarketIncomingTitle", ["incomingTitle", "Galactic â†’ Market child â†’ incoming-bias section heading in the market bias InfoTooltip"]],
  ["galacticMarketIncomingText", ["incomingBody", "Galactic â†’ Market child â†’ incoming-bias explanation in the market bias InfoTooltip"]],
  ["galacticMarketComparisonTitle", ["outlookTitle", "Galactic â†’ Market child â†’ market-outlook InfoTooltip label"]],
  ["galacticMarketComparisonHigherOutgoing", ["higherOutgoing", "Galactic â†’ Market child â†’ market-outlook text when outgoing bias is stronger"]],
  ["galacticMarketComparisonHigherIncoming", ["higherIncoming", "Galactic â†’ Market child â†’ market-outlook text when incoming bias is stronger"]],
  ["galacticMarketComparisonBalanced", ["balanced", "Galactic â†’ Market child â†’ market-outlook text when both biases are equal"]],
  ["galacticMarketItemSelectContent1", ["trade.text", "Galactic â†’ Market child â†’ trade-help InfoTooltip in GalacticMarketPane.tsx"]],
  ["galacticMarketSellApForCashContent1", ["sellAp.text", "Galactic â†’ Market child â†’ AP-sale-help InfoTooltip in GalacticMarketPane.tsx"]],
  ["galacticMarketLiquidateForApContent1", ["liquidation.text", "Galactic â†’ Rebirth child â†’ liquidation InfoTooltip before the once-per-run action in AssetLiquidationCard.tsx"]],
  ["galacticMarketLiquidateForApContent2", ["liquidation.alreadyUsedText", "Galactic â†’ Rebirth child â†’ liquidation InfoTooltip after its once-per-run action in AssetLiquidationCard.tsx"]],
]);
const verifiedGalacticMarketHelpTargets = new Map();
for (const [sourceKey, [targetPath, route]] of galacticMarketHelpDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/marketMessages.ts", targetPath)
  ) {
    verifiedGalacticMarketHelpTargets.set(sourceKey, {
      target: `src/i18n/marketMessages.ts#${targetPath}`,
      route,
    });
  }
}
const verifiedRebirthSourceHelpTargets = new Map();
const rebirthSourceHelpRouteIsActive =
  rebirthDrawTabSource.includes("labelId: 'rebirthRow'") &&
  rebirthDescriptionsSource.includes("rebirthContent1") &&
  rebirthPaneSource.includes('content={metaText(locale, "rebirthSourceHelp")}');
if (
  sourceKeys.includes("rebirthContent1") &&
  locales.every((locale) => String(localization[locale].rebirthContent1 ?? "").trim().length > 0) &&
  rebirthSourceHelpRouteIsActive &&
  hasPopulatedTargetPath("src/i18n/metaMessages.ts", "rebirthSourceHelp")
) {
  verifiedRebirthSourceHelpTargets.set("rebirthContent1", {
    target: "src/i18n/metaMessages.ts#rebirthSourceHelp",
    route: "Galactic > Rebirth > always-available Rebirth action help; Cosmic Forge renders rebirthContent1 in the rebirthRow description and AscendencyPane.tsx exposes the selected-locale target field beside the Rebirth action",
  });
}
const megastructureHelpDefinitions = new Map([
  ["textForceFieldStrength", "forceFieldStrength"],
  ["textForceFieldDown", "forceFieldDown"],
  ["textKeepWeakeningForceField", "forceFieldKeepWeakening"],
  ["textCanMoveToMiaplacidus", "forceFieldCanMove"],
]);
const verifiedMegastructureHelpTargets = new Map();
for (const [sourceKey, targetPath] of megastructureHelpDefinitions) {
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/megastructureMessages.ts", targetPath)
  ) {
    verifiedMegastructureHelpTargets.set(sourceKey, {
      target: `src/i18n/megastructureMessages.ts#${targetPath}`,
      route: `Galactic → Megastructures child → Force Field help tooltip, ${targetPath === "forceFieldCanMove" ? "level-4" : "below-level-4"} state in MegastructurePane.tsx`,
    });
  }
}
const waterReservoirAction = sourceKeys.includes("buttonEnlargeReservoir") &&
  locales.every((locale) => String(localization[locale].buttonEnlargeReservoir ?? "").trim().length > 0) &&
  hasPopulatedTargetPath("src/i18n/economyMessages.ts", "enlargeReservoir")
  ? {
      target: "src/i18n/economyMessages.ts#enlargeReservoir",
      route: "Compounds → Water → storage purchase action in EconomyPanes.tsx; the heading and action keep source buttonEnlargeReservoir copy distinct from other goods",
    }
  : undefined;
const resourceActionDefinitions = new Map([
  ["buttonGainOne", {
    target: "src/i18n/economyMessages.ts#collect + src/i18n/messages.ts#hydrogen.collect",
    route: "Resources → collection action; EconomyPanes.tsx uses economyMessages.collect on ordinary Materials and App.tsx uses messages.hydrogen.collect on Hydrogen",
    disposition: "ADAPTED_RESOURCE_ACTION_LABEL",
    evidence: "The source collection action is adapted to the populated six-locale Collect label on ordinary Materials and Hydrogen's dedicated Collect 1 Hydrogen action; the authored Resource locale spec is not run for Phase 7.",
  }],
  ["buttonFuse", {
    target: "src/i18n/economyMessages.ts#fuse",
    route: "Resources → six fusion-enabled Material pages; ResourceFusionDetails in EconomyPanes.tsx renders the localized fusion heading and action",
    disposition: "MAPPED_RESOURCE_ACTION_LABEL",
    evidence: "The source Fuse action matches the populated six-locale target label on all six fusion-enabled Material pages; the authored Resource locale spec is not run for Phase 7.",
  }],
  ["dropdownOptionAllStock", {
    target: "src/i18n/economyMessages.ts#allStock",
    route: "Resources → non-Hydrogen sale quantity selector; EconomyPanes.tsx renders the localized All stock option",
    disposition: "MAPPED_RESOURCE_ACTION_LABEL",
    evidence: "The source All Stock option matches the populated six-locale target option on non-Hydrogen Resource sale selectors; the Hydrogen selector uses its separate fixed-quantity choices, and Compound selectors retain their own options. The authored Resource locale spec is not run for Phase 7.",
  }],
  ["dropdownOption75Stock", {
    target: "src/i18n/economyMessages.ts#threeQuartersStock",
    route: "Resources → non-Hydrogen sale quantity selector; EconomyPanes.tsx renders the localized three-quarter-stock option",
    disposition: "MAPPED_RESOURCE_ACTION_LABEL",
    evidence: "The source 75% Stock option matches the populated six-locale target option on non-Hydrogen Resource sale selectors; the Hydrogen selector uses its separate fixed-quantity choices, and Compound selectors retain their own options. The authored Resource locale spec is not run for Phase 7.",
  }],
  ["dropdownOption67Stock", {
    target: "src/i18n/economyMessages.ts#twoThirdsStock",
    route: "Resources → non-Hydrogen sale quantity selector; EconomyPanes.tsx renders the localized two-thirds-stock option",
    disposition: "MAPPED_RESOURCE_ACTION_LABEL",
    evidence: "The source 67% Stock option matches the populated six-locale target option on non-Hydrogen Resource sale selectors; the Hydrogen selector uses its separate fixed-quantity choices, and Compound selectors retain their own options. The authored Resource locale spec is not run for Phase 7.",
  }],
  ["dropdownOption50Stock", {
    target: "src/i18n/economyMessages.ts#halfStock",
    route: "Resources → non-Hydrogen sale quantity selector; EconomyPanes.tsx renders the localized half-stock option",
    disposition: "MAPPED_RESOURCE_ACTION_LABEL",
    evidence: "The source 50% Stock option matches the populated six-locale target option on non-Hydrogen Resource sale selectors; the Hydrogen selector uses its separate fixed-quantity choices, and Compound selectors retain their own options. The authored Resource locale spec is not run for Phase 7.",
  }],
  ["dropdownOption33Stock", {
    target: "src/i18n/economyMessages.ts#oneThirdStock",
    route: "Resources → non-Hydrogen sale quantity selector; EconomyPanes.tsx renders the localized one-third-stock option",
    disposition: "MAPPED_RESOURCE_ACTION_LABEL",
    evidence: "The source 33% Stock option matches the populated six-locale target option on non-Hydrogen Resource sale selectors; the Hydrogen selector uses its separate fixed-quantity choices, and Compound selectors retain their own options. The authored Resource locale spec is not run for Phase 7.",
  }],
]);
const verifiedResourceActionTargets = new Map();
for (const [sourceKey, definition] of resourceActionDefinitions) {
  const [target, ...additionalTargets] = definition.target.split(" + ");
  const populated = [target, ...additionalTargets].every((pathAndKey) => {
    const [targetFile, targetPath] = pathAndKey.split("#");
    return hasPopulatedTargetPath(targetFile, targetPath);
  });
  if (
    sourceKeys.includes(sourceKey) &&
    sourceText.some(([file, text]) => path.basename(file) === "drawTab1Content.js" && text.includes(sourceKey)) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    populated
  ) {
    verifiedResourceActionTargets.set(sourceKey, definition);
  }
}
const economyPaneSourceText = fs.readFileSync(path.join(projectRoot, "src", "app", "EconomyPanes.tsx"), "utf8");
const navigationSourceText = fs.readFileSync(path.join(projectRoot, "src", "app", "presentationNavigation.ts"), "utf8");
const resourceAndCompoundPageCopyDefinitions = new Map([
  ["tab1IncreaseStorageRowLabel", ["increaseStorage", "Resources/Compounds > each material child page > storage purchase action in EconomyPanes.tsx"]],
  ["buttonSellAll", ["sellAll", "Resources/Compounds > page overview > bulk sell action in EconomyPanes.tsx#EconomyBulkActions"]],
  ["buttonIncreaseAllStorage", ["increaseAllStorage", "Resources/Compounds > page overview > bulk storage purchase action in EconomyPanes.tsx#EconomyBulkActions"]],
  ["categoryGases", ["gases", "Resources > Gases child group heading in presentationNavigation.ts#resourcePaneGroups"]],
  ["categoryLiquids", ["liquids", "Compounds > Liquids child group heading in presentationNavigation.ts#compoundPaneGroups"]],
  ["categorySolids", ["solids", "Resources and Compounds > Solids child group headings in presentationNavigation.ts#resourcePaneGroups and #compoundPaneGroups"]],
]);
const verifiedResourceAndCompoundPageCopyTargets = new Map();
for (const [sourceKey, [targetPath, route]] of resourceAndCompoundPageCopyDefinitions) {
  const sourceFilesContainKey = sourceText.some(([, text]) => text.includes(sourceKey));
  const rendererHasRoute = sourceKey === "categoryGases"
    ? navigationSourceText.includes('labelKey: "gases"') && navigationSourceText.includes("economyLabel(locale, group.labelKey)")
    : sourceKey === "categoryLiquids"
      ? navigationSourceText.includes('labelKey: "liquids"') && navigationSourceText.includes("economyLabel(locale, group.labelKey)")
      : sourceKey === "categorySolids"
        ? navigationSourceText.includes('labelKey: "solids"') && navigationSourceText.includes("economyLabel(locale, group.labelKey)")
        : sourceKey === "tab1IncreaseStorageRowLabel"
          ? economyPaneSourceText.includes('t("increaseStorage")')
          : sourceKey === "buttonSellAll"
            ? economyPaneSourceText.includes('t("sellAll")') && economyPaneSourceText.includes("dispatchEconomySellAll")
            : economyPaneSourceText.includes('t("increaseAllStorage")') && economyPaneSourceText.includes("dispatchEconomyStorageIncreaseAll");
  if (
    sourceKeys.includes(sourceKey) &&
    sourceFilesContainKey &&
    rendererHasRoute &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath("src/i18n/economyMessages.ts", targetPath)
  ) {
    verifiedResourceAndCompoundPageCopyTargets.set(sourceKey, {
      target: `src/i18n/economyMessages.ts#${targetPath}`,
      route,
      adapted: false,
    });
  }
}
for (const [sourcePrefix, entries] of Object.entries({
  resource: ["hydrogen", "helium", "neon", "oxygen", "carbon", "silicon", "sodium", "iron"],
  compound: ["diesel", "glass", "steel", "concrete", "water", "titanium"],
})) {
  for (const goodId of entries) {
    const sourceKey = `${sourcePrefix}${goodId[0].toLocaleUpperCase("en")}${goodId.slice(1)}`;
    if (
      sourceKeys.includes(sourceKey) &&
      locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
      hasPopulatedTargetPath("src/app/economyDisplay.ts", goodId)
    ) {
      verifiedNavigationLabelTargets.set(sourceKey, {
        target: `src/app/economyDisplay.ts#${goodId}`,
        route: `${sourcePrefix === "resource" ? "Resources" : "Compounds"} child option for ${goodId}; presentationNavigation.ts renders economyGoodName(locale, "${goodId}") in the corresponding child rail`,
        adapted: false,
      });
    }
  }
}
const presentationNavigationSource = fs.readFileSync(path.join(projectRoot, "src", "app", "presentationNavigation.ts"), "utf8");
for (const goodId of [
  "hydrogen", "helium", "carbon", "neon", "oxygen", "sodium", "silicon", "iron",
  "diesel", "glass", "steel", "concrete", "water", "titanium",
]) {
  const sourceKey = `headerMain${goodId[0].toLocaleUpperCase("en")}${goodId.slice(1)}`;
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    presentationNavigationSource.includes("label: economyGoodName(locale, id)") &&
    hasPopulatedTargetPath("src/app/economyDisplay.ts", goodId)
  ) {
    verifiedNavigationLabelTargets.set(sourceKey, {
      target: `src/app/economyDisplay.ts#${goodId}`,
      route: `${goodId === "diesel" || goodId === "glass" || goodId === "steel" || goodId === "concrete" || goodId === "water" || goodId === "titanium" ? "Compounds" : "Resources"} child page option; presentationNavigation.ts renders the selected-locale economyGoodName(locale, "${goodId}") label in the matching child rail`,
      adapted: false,
    });
  }
}
const resourceRowLabelDefinitions = new Map();
for (const [sourceName, goodId] of Object.entries({
  Hydrogen: "hydrogen",
  Helium: "helium",
  Neon: "neon",
  Oxygen: "oxygen",
  Carbon: "carbon",
  Silicon: "silicon",
  Sodium: "sodium",
  Iron: "iron",
})) {
  resourceRowLabelDefinitions.set(`tab1${sourceName}SellRowLabel`, {
    targetFile: sourceName === "Hydrogen" ? "src/i18n/messages.ts" : "src/i18n/economyMessages.ts",
    targetPaths: sourceName === "Hydrogen" ? ["hydrogen.sell"] : ["sell"],
    nameTargetFile: sourceName === "Hydrogen" ? "src/i18n/messages.ts" : "src/app/economyDisplay.ts",
    nameTargetPath: sourceName === "Hydrogen" ? "hydrogen.title" : goodId,
    route: sourceName === "Hydrogen"
      ? "Resources â†’ Hydrogen special page; App.tsx renders messages.ts#hydrogen.sell on the sale button and #hydrogen.title as its heading"
      : `Resources â†’ ${sourceName} â†’ sale action; EconomyPanes.tsx renders the selected-locale Sell action beside economyGoodName(locale, "${goodId}")`,
  });
  resourceRowLabelDefinitions.set(`tab1${sourceName}AllocateRowLabel`, {
    targetFile: "src/i18n/economyMessages.ts",
    targetPaths: ["allocation"],
    nameTargetFile: "src/app/economyDisplay.ts",
    nameTargetPath: goodId,
    route: `Resources â†’ ${sourceName} â†’ production allocation details; EconomyPanes.tsx renders the selected-locale allocation heading beside economyGoodName(locale, "${goodId}")`,
  });
}
const verifiedResourceRowLabelTargets = new Map();
for (const [sourceKey, definition] of resourceRowLabelDefinitions) {
  const targetPathsPresent = hasPopulatedTargetPath(definition.targetFile, definition.targetPaths[0]);
  const localizedNamePresent = targetCatalogue(definition.nameTargetFile) && locales.every((locale) => {
    const value = targetCatalogue(definition.nameTargetFile)[locale].get(definition.nameTargetPath);
    return typeof value === "string" && value.trim().length > 0;
  });
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    targetPathsPresent &&
    localizedNamePresent
  ) {
    verifiedResourceRowLabelTargets.set(sourceKey, {
      target: `${definition.targetFile}#${definition.targetPaths[0]} + ${definition.nameTargetFile}#${definition.nameTargetPath}`,
      route: definition.route,
    });
  }
}
if (
  locales.every((locale) => String(localization[locale].hereLinkWord ?? "").trim().length > 0) &&
  hasPopulatedTargetPath("src/i18n/sourceNewsCopy.ts", "here") &&
  hasPopulatedTargetPath("src/i18n/metaSignalMessages.ts", "here")
) {
  verifiedSourceNewsTargets.set("hereLinkWord", {
    target: "src/i18n/sourceNewsCopy.ts#here + src/i18n/metaSignalMessages.ts#here",
    route: "Prize and one-off templates interpolate sourceNewsCopy(locale).here; generic ticker/journal fallback copy uses metaSignalText(locale, \"here\")",
  });
}
const headerDescriptionTargets = new Map([
  ["headerDescResources", ["src/i18n/economyMessages.ts#resourcesOverviewHelp", "Resources section overview; App.tsx resolves the Resources tab overview tooltip"]],
  ["headerDescCompounds", ["src/i18n/economyMessages.ts#compoundsOverviewHelp", "Compounds section overview; App.tsx resolves the Compounds tab overview tooltip"]],
  ["headerDescResearch", ["src/i18n/economyMessages.ts#researchOverviewHelp", "Research section overview; App.tsx resolves the Research tab overview tooltip"]],
  ["headerDescEnergy", ["src/i18n/economyMessages.ts#energyOverviewHelp", "Energy section overview; App.tsx resolves the Energy tab overview tooltip"]],
  ["headerDescEnergyStorage", ["src/i18n/economyMessages.ts#batteryStorageHelp", "Energy â†’ Batteries child page; EconomyPanes.tsx renders the selected-locale storage explanation above the battery cards", true]],
  ["headerDescAdvancedPowerPlant", ["src/i18n/economyMessages.ts#advancedPowerPlantHelp", "Energy â†’ Power child page; EconomyPanes.tsx renders the selected-locale advanced-plant purchase help", true]],
  ["headerDescTechnology", ["src/i18n/economyMessages.ts#technologyTreePanHelp", "Research â†’ Tech Tree child page; the owner-consolidated help combines the source Technology and Tech Tree descriptions, then adds the remake's pan controls", true]],
  ["headerDescTechTree", ["src/i18n/economyMessages.ts#technologyTreePanHelp", "Research â†’ Tech Tree child page; the owner-consolidated help combines the source Technology and Tech Tree descriptions, then adds the remake's pan controls", true]],
  ["headerDescSpaceMining", ["src/i18n/economyMessages.ts#spaceMiningOverviewHelp", "Space Mining section overview; App.tsx resolves the Space Mining tab overview tooltip"]],
  ["headerDescInterstellar", ["src/i18n/economyMessages.ts#interstellarOverviewHelp", "Interstellar section overview; App.tsx resolves the Interstellar tab overview tooltip"]],
  ["headerDescGalactic", ["src/i18n/economyMessages.ts#galacticOverviewHelp", "Galactic section overview; App.tsx resolves the Galactic tab overview tooltip"]],
  ["headerDescCosmicRip", ["src/i18n/cosmicRipMessages.ts#introduction", "Cosmic Rip section introduction; CosmicRipPane.tsx renders the selected-locale overview paragraph with the remake player identity", true]],
  ["headerDescSettings", ["src/i18n/economyMessages.ts#settingsOverviewHelp", "Settings section overview; App.tsx resolves the Settings tab overview tooltip"]],
  ["headerDescHydrogen", ["src/i18n/economyMessages.ts#hydrogenOverviewHelp", "Hydrogen resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescHelium", ["src/i18n/economyMessages.ts#heliumOverviewHelp", "Helium resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescCarbon", ["src/i18n/economyMessages.ts#carbonOverviewHelp", "Carbon resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescNeon", ["src/i18n/economyMessages.ts#neonOverviewHelp", "Neon resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescOxygen", ["src/i18n/economyMessages.ts#oxygenOverviewHelp", "Oxygen resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescSodium", ["src/i18n/economyMessages.ts#sodiumOverviewHelp", "Sodium resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescSilicon", ["src/i18n/economyMessages.ts#siliconOverviewHelp", "Silicon resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescIron", ["src/i18n/economyMessages.ts#ironOverviewHelp", "Iron resource overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescDiesel", ["src/i18n/economyMessages.ts#dieselOverviewHelp", "Diesel compound overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescGlass", ["src/i18n/economyMessages.ts#glassOverviewHelp", "Glass compound overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescSteel", ["src/i18n/economyMessages.ts#steelOverviewHelp", "Steel compound overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescWater", ["src/i18n/economyMessages.ts#waterOverviewHelp", "Water compound overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescConcrete", ["src/i18n/economyMessages.ts#concreteOverviewHelp", "Concrete compound overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescTitanium", ["src/i18n/economyMessages.ts#titaniumOverviewHelp", "Titanium compound overview; EconomyPanes.tsx resolves the selected-good overview help"]],
  ["headerDescResearchUpgrades", ["src/i18n/economyMessages.ts#scienceBuildingsHelp", "Research Upgrades science-building section; EconomyPanes.tsx renders the section introduction"]],
  ["headerDescPowerPlant", ["src/i18n/economyMessages.ts#powerPlantSupplyHelp", "Energy power-plant supply section; EconomyPanes.tsx renders the section help"]],
  ["headerDescSolarPowerPlant", ["src/i18n/economyMessages.ts#solarPowerPlantRenewable", "Energy solar-plant section; EconomyPanes.tsx renders the section help"]],
  ["headerDescPhilosophy", ["src/i18n/philosophyMessages.ts#headerDescription", "Philosophy page and path-choice cards; PhilosophyPane.tsx renders the selected-locale header description"]],
  ["headerDescStarMap", ["src/i18n/starMapMessages.ts#mapHeaderHelp", "Interstellar Star Map child page; StarMapPane.tsx resolves the map header tooltip"]],
  ["headerDescStarData", ["src/i18n/starMapMessages.ts#dataHeaderHelp", "Interstellar Star Data child page; StarMapPane.tsx resolves the data header tooltip"]],
  ["headerDescStarShip", ["src/i18n/starshipMessages.ts#starshipHeaderHelp", "Interstellar Starship child page; StarshipPane.tsx resolves the header tooltip"]],
  ["headerDescFleetHangar", ["src/i18n/starshipMessages.ts#fleetHangarHeaderHelp", "Interstellar Fleet Hangar child page; StarshipPane.tsx resolves the help tooltip", true]],
  ["headerDescColonise", ["src/i18n/starshipMessages.ts#coloniseHeaderHelp", "Interstellar Colonise child page; StarshipPane.tsx resolves the dynamic help tooltip", true]],
  ["headerDescMining", ["src/i18n/spaceMessages.ts#miningHeaderHelp", "Space Mining asteroid mining page; SpaceMiningPane.tsx resolves the header tooltip"]],
  ["headerDescSpaceTelescope", ["src/i18n/spaceMessages.ts#telescopeHeaderHelp", "Space Mining telescope page; SpaceMiningPane.tsx resolves the header tooltip"]],
  ["headerDescAsteroids", ["src/i18n/spaceMessages.ts#asteroidsHeaderHelp", "Space Mining Asteroids page; SpaceMiningPane.tsx resolves the header tooltip"]],
  ["headerDescLaunchPad", ["src/i18n/rocketMessages.ts#launchPadHeaderHelp", "Space Mining Launch Pad page; SpaceMiningPane.tsx resolves the header tooltip"]],
  ["headerDescRebirth", ["src/i18n/metaMessages.ts#rebirthOverview", "Galactic Rebirth child page; AscendencyPane.tsx resolves the overview help"]],
  ["headerDescRebirthMega", ["src/i18n/metaMessages.ts#rebirthOverview + src/i18n/metaMessages.ts#rebirthMegastructureWarning", "Galactic â†’ Rebirth child; AscendencyPane.tsx renders the selected-locale rebirth guidance and megastructure disconnect warning", true]],
  ["headerDescAscendencyPerks", ["src/i18n/metaMessages.ts#perksOverview", "Galactic â†’ Ascendency Perks child; AscendencyPane.tsx renders the selected-locale overview help while AP is shown in its balance card", true]],
  ["headerDescGalacticMarket", ["src/i18n/metaMessages.ts#description", "Galactic Market child page; GalacticMarketPane.tsx renders the page description"]],
  ["headerDescGalacticCasino", ["src/i18n/casinoMessages.ts#CASINO_HEADER_DESCRIPTION", "Galactic Casino child page; GalacticCasinoPane.tsx renders casinoHeaderDescription(locale) in the dedicated Casino page header"]],
  ["headerDescMegastructures", ["src/i18n/megastructureMessages.ts#headerHelp", "Galactic Megastructures child page; MegastructurePane.tsx resolves the header tooltip"]],
  ["headerDescBlackHole", ["src/i18n/blackHoleMessages.ts#headerHelp", "Galactic Black Hole child page; BlackHolePane.tsx resolves the header tooltip"]],
  ["headerDescSituation", ["src/i18n/cosmicRipMessages.ts#situationIntroduction", "Cosmic Rip > Situation child introduction; CosmicRipPane.tsx renders the selected-locale introduction and displays the live GP balance separately in its wallet", true]],
  ["headerDescNearSpaceScannerArray", ["src/i18n/cosmicRipMessages.ts#scannerArrayIntroduction", "Cosmic Rip > Near Space Scanner Array child introduction; CosmicRipPane.tsx renders the selected-locale text while the wallet displays the live GP balance", true]],
  ["headerDescCosmicRipTab", ["src/i18n/cosmicRipMessages.ts#ripIntroduction", "Cosmic Rip > Cosmic Rip child introduction; CosmicRipPane.tsx renders the selected-locale text while the wallet displays the live GP balance", true]],
  ["headerDescVisual", ["src/i18n/settingsMessages.ts#visualDescription", "Settings Visual Settings child page; SettingsPane.tsx renders the section introduction"]],
  ["headerDescGameOptions", ["src/i18n/settingsMessages.ts#gameOptionsDescription", "Settings Game Options child page; SettingsPane.tsx renders the section introduction"]],
  ["headerDescSavingLoading", ["src/i18n/settingsMessages.ts#savingSectionDescription", "Settings Saving / Loading child page; SettingsPane.tsx renders the section introduction"]],
  ["headerDescStatistics", ["src/i18n/statisticsMessages.ts#description", "Settings Statistics child page; SettingsStatisticsPane.tsx renders the page introduction"]],
  ["headerDescAchievements", ["src/i18n/achievementMessages.ts#overview", "Achievements page header tooltip; AchievementsPane.tsx resolves the overview help"]],
  ["headerDescEvents", ["src/i18n/economyMessages.ts#eventsOverviewHelp", "Settings Events & Journal child page; MetaJournalPane.tsx resolves the header tooltip"]],
]);
const verifiedHeaderDescriptionTargets = new Map();
for (const [sourceKey, [target, route, adapted = false]] of headerDescriptionTargets) {
  const targetDefinitions = target.split(" + ").map((part) => {
    const separator = part.indexOf("#");
    return [part.slice(0, separator), part.slice(separator + 1)];
  });
  const allTargetPathsPresent = targetDefinitions.every(([targetFile, targetPath]) =>
    targetFile === "src/i18n/starshipMessages.ts"
      ? hasStarshipTargetPath(targetPath)
      : hasPopulatedTargetPath(targetFile, targetPath),
  );
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    allTargetPathsPresent
  ) {
    verifiedHeaderDescriptionTargets.set(sourceKey, {
      target,
      route,
      adapted,
    });
  }
}
const sourceNotificationDefinitions = new Map([
  ["notificationStorageFull", {
    target: "src/i18n/economyMessages.ts#storageFullNotice",
    route: "Resources or Compounds > storage-full state; economyActionNotifications.ts#createStorageFullNoticeHandler emits the selected-locale notice with the active good name and Increase Storage action",
    disposition: "MAPPED_ECONOMY_NOTIFICATION",
  }],
  ["notificationIncreasedAllStorage", {
    target: "src/i18n/economyMessages.ts#storageIncreasedAllNotice",
    route: "Resources or Compounds > category Increase All Storage action; EconomyPanes.tsx calls dispatchEconomyStorageIncreaseAll and economyActionNotifications.ts formats accepted increases with selected-locale good names",
    disposition: "MAPPED_ECONOMY_NOTIFICATION",
  }],
  ["textLocatedInSector", {
    target: "src/i18n/cosmicRipMessages.ts#locatedInSector",
    route: "Cosmic Rip > Situation found-sector status; CosmicRipPane.tsx renders cosmicRipText(locale).locatedInSector with the found sector ID",
    disposition: "MAPPED_COSMIC_RIP_STATUS_COPY",
  }],
  ["notificationMegaStructureOptionAvailable", {
    target: "src/i18n/messages.ts#nav.new",
    route: "Galactic > Megastructures discovery; App.tsx records page attention and PaneNavigation.tsx renders the persistent selected-locale New cue until the child page is visited",
    disposition: "ADAPTED_GALACTIC_DISCOVERY_CUE",
  }],
]);
sourceNotificationDefinitions.set("notificationBlackHoleDiscovered", {
  target: "src/i18n/blackHoleMessages.ts#discoveredNotification",
  route: "Galactic > Black Hole discovery; blackHoleEventNotifications.ts emits the selected-locale three-second floating toast alongside the separate discovery result dialog",
  disposition: "MAPPED_GALACTIC_CHILD_COPY",
});
sourceNotificationDefinitions.set("notificationGalacticTabUnlocked", {
  target: "src/i18n/spaceNotificationMessages.ts#galacticTabUnlocked",
  route: "First Galactic unlock; spaceEventNotifications.ts emits the selected-locale floating toast after the separate unlock result dialog is confirmed",
  disposition: "MAPPED_SPACE_PROGRESSION_NOTIFICATION",
});
const verifiedSourceNotificationTargets = new Map();
for (const [sourceKey, definition] of sourceNotificationDefinitions) {
  const separator = definition.target.indexOf("#");
  const targetFile = definition.target.slice(0, separator);
  const targetPath = definition.target.slice(separator + 1);
  if (
    sourceKeys.includes(sourceKey) &&
    locales.every((locale) => String(localization[locale][sourceKey] ?? "").trim().length > 0) &&
    hasPopulatedTargetPath(targetFile, targetPath)
  ) {
    verifiedSourceNotificationTargets.set(sourceKey, definition);
  }
}
const dynamicNameFamily = /^(starShipModule|fleetShip|buffName|eventName)/;
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
const rows = [
  [
    "source_key",
    "nonempty_source_locales",
    "production_reference_files",
    "source_reference_mode",
    "common_exact_value_candidate_catalogues",
    "common_exact_value_candidate_target_paths",
    "same_property_path_candidate_catalogues",
    "same_property_path_candidate_target_paths",
    "verified_crosswalk_target",
    "verified_active_route",
    "disposition",
    "evidence",
  ].join(","),
];
let exactCandidateKeys = 0;
let samePropertyPathCandidateKeys = 0;
let mappedDynamic = 0;
let mappedAchievementDescriptions = 0;
let mappedAchievementNotifications = 0;
let mappedAchievementMetadataLabels = 0;
let excludedSourceCompoundPresetLabels = 0;
let mappedWarModeEntryCopy = 0;
let excludedWarModeOutcomeCopy = 0;
let adaptedOnboardingMessages = 0;
let adaptedStartupBriefingHeadings = 0;
let excludedStartupBriefingBodies = 0;
let adaptedStartupNamePrompts = 0;
let adaptedStartupNewGameActions = 0;
let mappedCasinoTooltips = 0;
let adaptedCasinoTooltips = 0;
let mappedCasinoSourceCopy = 0;
let adaptedCasinoSourceCopy = 0;
let excludedUnreachableCasinoFallbacks = 0;
let adaptedHomecomingStoryCopy = 0;
let mappedResearchRowLabels = 0;
let mappedResearchActionHelp = 0;
let adaptedAscendencyPerkHelp = 0;
let mappedPhilosophyPathNames = 0;
let adaptedResearchAutoBuyerLabels = 0;
let mappedTechnology = 0;
let mappedTechnologyNodeNames = 0;
let mappedTechnologyNodeDescriptions = 0;
let adaptedTechnologySummaries = 0;
let adaptedPhilosophyTechnologyDescriptions = 0;
let adaptedPhilosophyHeaderHelp = 0;
let mappedRandomEvent = 0;
let adaptedRandomEventFallbacks = 0;
let excludedRandomEventDiagnostics = 0;
let mappedMiaplaedia = 0;
let mappedMiaplaediaLibraryLabel = 0;
let mappedSourceNews = 0;
let mappedPhilosophyNotices = 0;
let mappedPhilosophyTechnologyNames = 0;
let mappedHeaderDescriptions = 0;
let adaptedHeaderDescriptions = 0;
let mappedStatistics = 0;
let mappedStatusLabels = 0;
let adaptedSourceTooltipCopy = 0;
let adaptedAllocationTooltipCopy = 0;
let adaptedResourceAllocationBreakdownCopy = 0;
let mappedMegastructureResults = 0;
let mappedMegastructureStructureNames = 0;
let mappedMegastructureStageNames = 0;
let mappedMegastructureEffects = 0;
let mappedAutobuyerNames = 0;
let adaptedAutobuyerRowLabels = 0;
let mappedAutobuyerDisplayCopy = 0;
let adaptedAutobuyerDisplayCopy = 0;
let excludedSolarAutobuyerNames = 0;
let mappedAutobuyerHelp = 0;
let mappedEconomyActionHelp = 0;
let mappedCosmicRipRowLabels = 0;
let adaptedCosmicRipRowLabels = 0;
let mappedCosmicRipTechnologyStatuses = 0;
let mappedCosmicRipObjectives = 0;
let mappedCosmicRipActionHelp = 0;
let mappedCosmicRipResultDialogs = 0;
let adaptedCosmicRipResultDialogs = 0;
let mappedCosmicRipResearchResultDialogs = 0;
let mappedSpaceProgressionDialogs = 0;
let adaptedResearchUnlockResultDialogs = 0;
let mappedRebirthConfirmationCopy = 0;
let adaptedRebirthPageCopy = 0;
let mappedEnergyLabels = 0;
let mappedCompoundActionCopy = 0;
let adaptedCompoundActionCopy = 0;
let mappedSpaceMiningLabels = 0;
let adaptedSpaceMiningLabels = 0;
let adaptedRocketMinerNames = 0;
let mappedResourceRowLabels = 0;
let mappedNavigationLabels = 0;
let adaptedNavigationLabels = 0;
let mappedSettingsPreferenceCopy = 0;
let adaptedSettingsPreferenceCopy = 0;
let mappedSettingsSaveCopy = 0;
let adaptedSettingsSaveCopy = 0;
let adaptedSettingsEventColumns = 0;
let mappedInterstellarCopy = 0;
let adaptedInterstellarCopy = 0;
let adaptedInterstellarTooltips = 0;
let adaptedBattleResultCopy = 0;
let adaptedPlayerLeaderIntroCopy = 0;
let mappedGalacticCopy = 0;
let mappedBlackHoleControlCopy = 0;
let adaptedBlackHoleControlCopy = 0;
let mappedGalacticMarketHelp = 0;
let adaptedRebirthPageHelp = 0;
let mappedMegastructureHelp = 0;
let mappedResourceActions = 0;
let mappedSourceNotifications = 0;
let adaptedCosmicRipPageHelp = 0;
let mappedCasinoNotificationCopy = 0;
let adaptedCasinoNotificationCopy = 0;
let excludedUnreachableCasinoNotifications = 0;
let excludedEmptyCasinoNotificationFragments = 0;
let excludedOnboardingNeedles = 0;
let excludedInternalDebugger = 0;
let excludedUnrenderedBlackHoleFeedDescription = 0;
let excludedOwnerContact = 0;
let excludedOwnerExit = 0;
let excludedOwnerCloudSave = 0;
let excludedOwnerFeedbackCloudSave = 0;
let excludedUnroutedSourceKeys = 0;
const ownerDirectedFeedbackKeys = new Set([
  "modalFeedbackHeaderText",
  "modalFeedbackContentTextGood",
  "modalFeedbackContentTextBad",
  "modalFeedbackThanksHeaderText",
  "modalFeedbackContentThanks",
]);
let emptyKeys = 0;
let unresolved = 0;
for (const key of sourceKeys) {
  const values = locales.map((locale) => String(localization[locale][key] ?? ""));
  const nonempty = locales.filter((_, index) => values[index].trim().length > 0);
  const references = sourceText
    .filter(([, text]) => text.includes(key))
    .map(([file]) => path.relative(sourceRoot, file).replaceAll(path.sep, "/"));
  const exactCandidates = [];
  const exactTargetPaths = [];
  const samePropertyPathCandidateCatalogues = [];
  const samePropertyPathCandidateTargetPaths = [];
  if (nonempty.length === locales.length) {
    for (const [file, text] of targetText) {
      if (values.every((value) => text.includes(value))) {
        exactCandidates.push(path.relative(projectRoot, file).replaceAll(path.sep, "/"));
      }
    }
    for (const [file, localePaths] of targetLocalePaths) {
      if (locales.every((locale) => {
        const value = localePaths[locale].get(key);
        return typeof value === "string" && value.trim().length > 0;
      })) {
        samePropertyPathCandidateCatalogues.push(path.relative(projectRoot, file).replaceAll(path.sep, "/"));
        samePropertyPathCandidateTargetPaths.push(
          `${path.relative(projectRoot, file).replaceAll(path.sep, "/")}#${key}`,
        );
      }
      const matchingPaths = [...localePaths.en.entries()]
        .filter(([targetPath, value]) => value === values[0] && locales.every((locale, localeIndex) => localePaths[locale].get(targetPath) === values[localeIndex]))
        .map(([targetPath]) => targetPath);
      if (matchingPaths.length) {
        exactTargetPaths.push(
          ...matchingPaths.map((targetPath) => `${path.relative(projectRoot, file).replaceAll(path.sep, "/")}#${targetPath}`),
        );
      }
    }
  }
  if (exactCandidates.length) exactCandidateKeys += 1;
  if (samePropertyPathCandidateCatalogues.length) samePropertyPathCandidateKeys += 1;
  const isEmptyEverywhere = nonempty.length === 0;
  let disposition = "UNREVIEWED";
  let evidence = "Source key still requires a target-key and active-route disposition.";
  let verifiedTarget = "";
  let verifiedRoute = "";
  const verifiedResearchRowLabelTarget = verifiedResearchRowLabelTargets.get(key);
  const verifiedCasinoTooltipTarget = verifiedCasinoTooltipTargets.get(key);
  const verifiedCasinoSourceCopyTarget = verifiedCasinoSourceCopyTargets.get(key);
  const verifiedCasinoNotificationTarget = verifiedCasinoNotificationTargets.get(key);
  const verifiedHomecomingStoryTarget = verifiedHomecomingStoryTargets.get(key);
  const verifiedInterstellarTooltipTarget = verifiedInterstellarTooltipTargets.get(key);
  const verifiedCosmicRipPageHelpTarget = verifiedCosmicRipPageHelpTargets.get(key);
  const verifiedBattleResultCopyTarget = verifiedBattleResultCopyTargets.get(key);
  const verifiedPlayerLeaderIntroTarget = verifiedPlayerLeaderIntroTargets.get(key);
  const verifiedOpeningBriefingAdaptation = verifiedOpeningBriefingAdaptations.get(key);
  const verifiedStartupNameTarget = verifiedStartupNameTargets.get(key);
  const verifiedStartupActionTarget = verifiedStartupActionTargets.get(key);
  const verifiedOnboardingTarget = verifiedOnboardingTargets.get(key);
  const verifiedAchievementDescriptionTarget = verifiedAchievementDescriptionTargets.get(key);
  const verifiedAchievementNotificationTarget = verifiedAchievementNotificationTargets.get(key);
  const verifiedAchievementMetadataTarget = verifiedAchievementMetadataTargets.get(key);
  const verifiedSourceCompoundPresetLabelExclusion = verifiedSourceCompoundPresetLabelExclusions.get(key);
  const warModeDialogTarget = warModeDialogTargets.get(key);
  const unsupportedWarModeOutcomeExclusion = unsupportedWarModeOutcomeExclusions.get(key);
  const verifiedAutobuyerNameTarget = verifiedAutobuyerNameTargets.get(key);
  const verifiedAutobuyerDisplayCopyTarget = autobuyerDisplayCopyTargets.get(key);
  const verifiedAutobuyerRowLabelTarget = verifiedAutobuyerRowLabelTargets.get(key);
  const excludedSolarAutobuyerNameTarget = excludedSolarAutobuyerNameTargets.get(key);
  const verifiedTechnologyTarget = verifiedTechnologyTargets.get(key);
  const verifiedTechnologyNodeTarget = verifiedTechnologyNodeTargets.get(key);
  const verifiedTechnologySummaryTarget = verifiedTechnologySummaryTargets.get(key);
  const verifiedPhilosophyTechnologyDescriptionTarget = verifiedPhilosophyTechnologyDescriptionTargets.get(key);
  const verifiedPhilosophyPathNameTarget = verifiedPhilosophyPathNameTargets.get(key);
  const verifiedPhilosophyHeaderHelpTarget = key === "infoTooltipPhilosophyHeader" ? verifiedPhilosophyHeaderHelpDefinition : undefined;
  let verifiedRandomEventTarget;
  let verifiedMiaplaediaTarget;
  const verifiedSourceNewsTarget = verifiedSourceNewsTargets.get(key);
  let verifiedPhilosophyTarget;
  const verifiedPhilosophyTechnologyNameTarget = verifiedPhilosophyTechnologyNameTargets.get(key);
  const verifiedStatisticsTarget = verifiedStatisticsTargets.get(key);
  const verifiedStatusLabelTarget = verifiedStatusLabelTargets.get(key);
  const verifiedMegastructureResultTarget = verifiedMegastructureResultTargets.get(key);
  const verifiedMegastructureStructureNameTarget = verifiedMegastructureStructureNameTargets.get(key);
  const verifiedMegastructureStageNameTarget = verifiedMegastructureStageNameTargets.get(key);
  const verifiedMegastructureEffectTarget = verifiedMegastructureEffectTargets.get(key);
  const verifiedAutobuyerHelpTarget = verifiedAutobuyerHelpTargets.get(key);
  const verifiedResearchActionHelpTarget = verifiedResearchActionHelpTargets.get(key);
  const verifiedAscendencyPerkHelpTarget = verifiedAscendencyPerkHelpTargets.get(key);
  const verifiedEconomyActionHelpTarget = economyActionHelpTargets.get(key);
  const verifiedCosmicRipRowLabelTarget = verifiedCosmicRipRowLabelTargets.get(key);
  const verifiedCosmicRipMessageTarget = cosmicRipMessageTargets.get(key);
  const verifiedCosmicRipActionHelpTarget = verifiedCosmicRipActionHelpTargets.get(key);
  const verifiedCosmicRipResultDialogTarget = cosmicRipResultDialogTargets.get(key);
  const verifiedSpaceProgressionDialogTarget = spaceProgressionDialogTargets.get(key);
  const verifiedResearchUnlockResultDialogTarget = researchUnlockResultDialogTargets.get(key);
  const verifiedRebirthConfirmationTarget = rebirthConfirmationTargets.get(key);
  const verifiedRebirthRowTarget = rebirthRowTargets.get(key);
  const verifiedTab7ChildLabelTarget = verifiedTab7ChildLabelTargets.get(key);
  const verifiedEnergyLabelTarget = energyLabelTargets.get(key);
  const verifiedCompoundActionTarget = compoundActionTargets.get(key);
  const verifiedSpaceMiningLabelTarget = verifiedSpaceMiningLabelTargets.get(key);
  const verifiedRocketMinerNameTarget = verifiedRocketMinerNameTargets.get(key);
  const verifiedResourceRowLabelTarget = verifiedResourceRowLabelTargets.get(key);
  const verifiedNavigationLabelTarget = verifiedNavigationLabelTargets.get(key);
  const verifiedSettingsCopyTarget = verifiedSettingsCopyTargets.get(key);
  const verifiedSaveSettingsCopyTarget = verifiedSaveSettingsCopyTargets.get(key);
  const verifiedSettingsEventColumnTarget = verifiedSettingsEventColumnTargets.get(key);
  const verifiedInterstellarCopyTarget = verifiedInterstellarCopyTargets.get(key);
  const verifiedInterstellarScanReportLabelTarget = verifiedInterstellarScanReportLabelTargets.get(key);
  const verifiedAdditionalPageCopyTarget = verifiedAdditionalPageCopyTargets.get(key);
  const verifiedBlackHoleControlCopyTarget = verifiedBlackHoleControlCopyTargets.get(key);
  const verifiedSourceTooltipCopyTarget = verifiedSourceTooltipCopyTargets.get(key);
  const verifiedAllocationTooltipTarget = verifiedAllocationTooltipTargets.get(key);
  const verifiedResourceAllocationBreakdownTarget = verifiedResourceAllocationBreakdownTargets.get(key);
  const verifiedGalacticMarketHelpTarget = verifiedGalacticMarketHelpTargets.get(key);
  const verifiedRebirthSourceHelpTarget = verifiedRebirthSourceHelpTargets.get(key);
  const verifiedMegastructureHelpTarget = verifiedMegastructureHelpTargets.get(key);
  const verifiedResourceActionTarget = verifiedResourceActionTargets.get(key);
  const verifiedResourceAndCompoundPageCopyTarget = verifiedResourceAndCompoundPageCopyTargets.get(key);
  const headerDescriptionDefinition = verifiedHeaderDescriptionTargets.get(key);
  let verifiedHeaderDescriptionTarget;
  if (
    headerDescriptionDefinition &&
    (exactTargetPaths.includes(headerDescriptionDefinition.target) ||
      headerDescriptionDefinition.adapted ||
      key === "headerDescCosmicRip" ||
      key === "headerDescGalacticCasino" ||
      key === "headerDescFleetHangar" ||
      key === "headerDescColonise")
  ) {
    verifiedHeaderDescriptionTarget = {
      ...headerDescriptionDefinition,
      exact: !headerDescriptionDefinition.adapted && exactTargetPaths.includes(headerDescriptionDefinition.target),
    };
  }
  let ownerDirectedExclusion;
  let ownerDirectedExitExclusion;
  let ownerDirectedCloudExclusion;
  const isRandomEventDiagnostic = key.startsWith("randomEventTrigger") || key === "eventDescUnknownAction";
  const modalMatch = key.match(/^modalEvent(.+?)(Ended)?(Header|Text)$/u);
  if (modalMatch) {
    const targetFile = modalMatch[2]
      ? "src/i18n/randomEventEndDialogMessages.ts"
      : "src/i18n/randomEventStartDialogMessages.ts";
    const eventId = firstLower(modalMatch[1]);
    const definition = targetCatalogue(targetFile);
    const targetPaths = modalMatch[3] === "Header"
      ? [`${eventId}.title`]
      : modalMatch[2]
        ? [`${eventId}.summary`, `${eventId}.result`, ...(definition?.en.has(`${eventId}.namedResult`) ? [`${eventId}.namedResult`] : [])]
        : [`${eventId}.summary`, ...[...(definition?.en.keys() ?? [])].filter((candidate) => candidate.startsWith(`${eventId}.lines[`) && candidate.endsWith(".text"))];
    if (populatedTargetPaths(targetFile, targetPaths)) {
      verifiedRandomEventTarget = {
        target: `${targetFile}#${targetPaths.join("+")}`,
        route: modalMatch[2]
          ? "Random Event expiry result; randomEventEndNotifications.ts resolves the selected-locale end dialog"
          : "Random Event trigger result; randomEventTriggeredNotifications.ts resolves the selected-locale start dialog",
      };
    }
  } else if (key.startsWith("eventDesc")) {
    const targetFile = "src/i18n/randomEventDescriptionMessages.ts";
    if (hasPopulatedTargetPath(targetFile, key)) {
      verifiedRandomEventTarget = {
        target: `${targetFile}#${key}`,
        route: "Random Event history/live-effect copy; randomEventDescription.ts and MetaJournalPane.tsx resolve the selected locale",
      };
      if (key === "eventDescOngoingTimedEffect" || key === "eventDescUnknownAction") {
        verifiedRandomEventTarget.disposition = "ADAPTED_UNREACHABLE_EVENT_FALLBACK";
        verifiedRandomEventTarget.route = "Source generic timed-effect fallback has no reachable target event because RandomEventId is a closed union; known effects display their selected-locale specific description"
      }
    }
  } else if (key.startsWith("notificationRandomEvent") || key.startsWith("notificationBlackHoleInstability")) {
    const family = key.startsWith("notificationRandomEvent")
      ? "randomEventTriggerNotificationMessages.ts"
      : key.includes("Stabilised")
        ? "randomEventEndNotificationMessages.ts"
        : "randomEventInstabilityNotificationMessages.ts";
    const match = exactTargetPaths.find((candidate) => candidate.includes(family));
    if (match) {
      verifiedRandomEventTarget = {
        target: match,
        route: family === "randomEventTriggerNotificationMessages.ts"
          ? "Random Event trigger notice; randomEventTriggeredNotifications.ts resolves the selected locale"
          : family === "randomEventEndNotificationMessages.ts"
            ? "Random Event expiry notice; randomEventEndNotifications.ts resolves the selected locale"
            : "Black Hole instability shift notice; randomEventInstabilityNotifications.ts resolves the selected locale",
      };
    }
  }
  const documentArticle = key.match(/^help(GetStarted|Story|ConceptsEarly|ConceptsMid|ConceptsLate|ConceptsEndGoal|Philosophies)Sub(Heading|Body)(\d+)$/u);
  const documentTitle = key.match(/^headerMain(GetStarted|Story|ConceptsEarly|ConceptsMid|ConceptsLate|ConceptsEndGoal|Philosophies)$/u);
  const documentDescription = key.match(/^headerDesc(GetStarted|Story|ConceptsEarly|ConceptsMid|ConceptsLate|ConceptsEndGoal|Philosophies)$/u);
  if (documentArticle) {
    const section = miaplaediaSectionBySourceSuffix[documentArticle[1]];
    const field = documentArticle[2] === "Heading" ? "heading" : "body";
    const articleIndex = Number(documentArticle[3]) - 1;
    const targetPath = `${section}[${articleIndex}].${field}`;
    const targetFile = "src/i18n/cosmicopediaMessages.ts";
    if (hasPopulatedTargetPath(targetFile, targetPath)) {
      verifiedMiaplaediaTarget = {
        target: `${targetFile}#${targetPath}`,
        route: `Miaplaedia ${section} document; MiaplaediaPane.tsx resolves cosmicopediaArticles(locale, "${section}")`,
      };
    }
  } else if (documentTitle) {
    const section = miaplaediaSectionBySourceSuffix[documentTitle[1]];
    const targetFile = "src/i18n/settingsMessages.ts";
    if (hasPopulatedTargetPath(targetFile, section)) {
      verifiedMiaplaediaTarget = {
        target: `${targetFile}#${section}`,
        route: `Miaplaedia ${section} child label/page title; settingsSectionName(locale, "${section}") via presentationNavigation.ts`,
      };
    }
  } else if (documentDescription) {
    const section = miaplaediaSectionBySourceSuffix[documentDescription[1]];
    const targetFile = "src/i18n/cosmicopediaMessages.ts";
    if (hasPopulatedTargetPath(targetFile, section)) {
      verifiedMiaplaediaTarget = {
        target: `${targetFile}#${section}`,
        route: `Miaplaedia ${section} document introduction; MiaplaediaPane.tsx resolves cosmicopediaDescription(locale, "${section}")`,
      };
    }
  }
  if (key === "cosmicopedia" && hasPopulatedTargetPath("src/i18n/messages.ts", "tab.miaplaedia")) {
    verifiedMiaplaediaTarget = {
      target: "src/i18n/messages.ts#tab.miaplaedia",
      route: "Miaplaedia top-level tab label; App.tsx resolves MESSAGES[tab.miaplaedia] in the active locale",
      disposition: "MAPPED_MIAPLAEDIA_LIBRARY_LABEL",
    };
  }
  if (key.startsWith("notificationPhilosophy")) {
    const exactTarget = exactTargetPaths.find((candidate) => candidate.startsWith("src/i18n/philosophyMessages.ts#"));
    if (exactTarget) {
      const targetPath = exactTarget.slice("src/i18n/philosophyMessages.ts#".length);
      if (hasPopulatedTargetPath("src/i18n/philosophyMessages.ts", targetPath)) {
        verifiedPhilosophyTarget = {
          target: exactTarget,
          route: targetPath.startsWith("selectionNotifications.")
            ? "Philosophy selection result; philosophyEventNotifications.ts resolves philosophyText(locale).selectionNotifications[event.philosophyId] for philosophy.selected"
            : "Philosophy ability/repeatable result; philosophyEventNotifications.ts resolves the selected-locale upgrade notice",
        };
      }
    } else if (
      key === "notificationPhilosophyRapidExpansion" &&
      exactCandidates.includes("src/i18n/philosophyMessages.ts")
    ) {
      verifiedPhilosophyTarget = {
        target: "src/i18n/philosophyMessages.ts#RAPID_EXPANSION_ACTIVATED_COPY[locale]",
        route: "Expansionist ability result; philosophyEventNotifications.ts resolves rapidExpansionActivatedText(locale)",
      };
    }
  }
  if (
    key === "headerMainContact" ||
    key === "headerDescContact" ||
    /^helpContactSub(?:Heading\d+|Body\d+)$/u.test(key)
  ) {
    ownerDirectedExclusion = {
      route: "Settings Contact (option9) and its external Discord/email links are excluded by the owner-directed navigation decision in docs/plans/open-decisions.md",
    };
  }
  if (new Set([
    "headerDescExitGame",
    "headerMainExitGame",
    "tab9ExitGameRowLabel",
    "modalExitGameText",
    "modalExitGameConfirmLabel",
    "modalExitGameExtra1Label",
  ]).has(key)) {
    ownerDirectedExitExclusion = {
      route: "The Settings Exit Game destination and confirmation flow are excluded by the platform/product navigation decision; the remake has no corresponding in-game exit route.",
    };
  }
  if (new Set([
    "notificationNoSaveDataToExport",
    "notificationErrorSavingToCloud",
    "tab9ExportCloudSaveRowLabel",
    "buttonSaveToCloud",
    "tab9ImportCloudSaveRowLabel",
    "buttonLoadFromCloud",
    "notificationCloudSaveDeleted",
    "notificationCloudSaveDeleteFailed",
    "notificationErrorSavingToCloudNoPioneerName",
    "notificationGameUpdatedInCloud",
    "notificationGameSavedToCloud",
    "notificationErrorLoadingFromCloud",
  ]).has(key)) {
    ownerDirectedCloudExclusion = {
      route: "Cosmic Forge cloud-save/account/sync actions and their result notices are excluded by the owner decision in docs/plans/open-decisions.md (No cloud saves, accounts or sync).",
    };
  }
  if (isRandomEventDiagnostic) {
    verifiedRandomEventTarget = {
      disposition: "EXCLUDED_NON_PLAYER_FACING_DIAGNOSTIC",
      route: "Cosmic Forge uses this value only in console diagnostics via getEventTriggerDescription (events.js:1384, 1676); no player-facing target route is required",
    };
  }
  if (verifiedTechnologyTarget) {
    verifiedTarget = verifiedTechnologyTarget.target;
    verifiedRoute = verifiedTechnologyTarget.route;
  } else if (verifiedTechnologySummaryTarget) {
    verifiedTarget = verifiedTechnologySummaryTarget.target;
    verifiedRoute = verifiedTechnologySummaryTarget.route;
  } else if (verifiedTechnologyNodeTarget) {
    verifiedTarget = verifiedTechnologyNodeTarget.target;
    verifiedRoute = verifiedTechnologyNodeTarget.route;
  } else if (verifiedPhilosophyTechnologyNameTarget) {
    verifiedTarget = verifiedPhilosophyTechnologyNameTarget.target;
    verifiedRoute = verifiedPhilosophyTechnologyNameTarget.route;
  } else if (verifiedPhilosophyTechnologyDescriptionTarget) {
    verifiedTarget = verifiedPhilosophyTechnologyDescriptionTarget.target;
    verifiedRoute = verifiedPhilosophyTechnologyDescriptionTarget.route;
  } else if (verifiedRandomEventTarget) {
    verifiedTarget = verifiedRandomEventTarget.target;
    verifiedRoute = verifiedRandomEventTarget.route;
  } else if (verifiedMiaplaediaTarget) {
    verifiedTarget = verifiedMiaplaediaTarget.target;
    verifiedRoute = verifiedMiaplaediaTarget.route;
  } else if (verifiedPhilosophyTarget) {
    verifiedTarget = verifiedPhilosophyTarget.target;
    verifiedRoute = verifiedPhilosophyTarget.route;
  } else if (verifiedPhilosophyHeaderHelpTarget) {
    verifiedTarget = verifiedPhilosophyHeaderHelpTarget.target;
    verifiedRoute = verifiedPhilosophyHeaderHelpTarget.route;
  } else if (verifiedHeaderDescriptionTarget) {
    verifiedTarget = verifiedHeaderDescriptionTarget.target;
    verifiedRoute = verifiedHeaderDescriptionTarget.route;
  } else if (ownerDirectedExclusion) {
    verifiedRoute = ownerDirectedExclusion.route;
  } else if (ownerDirectedExitExclusion) {
    verifiedRoute = ownerDirectedExitExclusion.route;
  } else if (ownerDirectedCloudExclusion) {
    verifiedRoute = ownerDirectedCloudExclusion.route;
  }
  let referenceMode = references.length ? "literal-reference-present" : "no-literal-production-reference";
  if (verifiedCasinoEmptyNotificationFragments.has(key)) {
    emptyKeys += 1;
    verifiedRoute = "Source Casino notification template fragment is intentionally empty in all six locales; surrounding localized fragments compose the visible result, so no standalone target field is required.";
    disposition = "EXCLUDED_INTENTIONALLY_EMPTY_CASINO_NOTIFICATION_FRAGMENT";
    evidence = "The source validator allowlists this empty suffix fragment in all six locales. It contributes no visible text; the active target composes the complete localized result from its populated notification template.";
    excludedEmptyCasinoNotificationFragments += 1;
  } else if (isEmptyEverywhere) {
    disposition = "INTENTIONALLY_EMPTY_FRAGMENT_REVIEW";
    evidence = "Source value is empty in all six locales; disposition recorded in the Phase 7 crosswalk.";
    emptyKeys += 1;
  } else if (key === "buttonGain" && references.includes("onboarding.js")) {
    verifiedRoute = "Cosmic Forge onboarding.js uses buttonGain only as the needle for matching visible copy; no UI callsite renders this value, while the visible source collection button is buttonGainOne.";
    disposition = "EXCLUDED_INTERNAL_ONBOARDING_NEEDLE";
    evidence = "This source value is an internal onboarding text-matching needle rather than rendered player-facing copy; the actual collection button uses buttonGainOne and is mapped separately.";
    excludedOnboardingNeedles += 1;
  } else if (
    key === "menuTitle" &&
    nonempty.length === locales.length &&
    references.length === 1 &&
    references[0] === "constantsAndGlobalVars.js"
  ) {
    verifiedRoute = "The only production reference is constantsAndGlobalVars.js#menuTitle, which stores document.getElementById('menuTitle'); the source HTML has no matching element and no source file calls localize('menuTitle'). The target DebugTools menu is a remake-only development utility, not a source player-facing route.";
    disposition = "EXCLUDED_STALE_UNROUTED_SOURCE_KEY";
    evidence = "The source key is populated but has no rendered DOM element or localization callsite in the current Cosmic Forge UI, so it does not require a player-facing MIAPLACIDUS route.";
    excludedUnroutedSourceKeys += 1;
  } else if (
    ownerDirectedFeedbackKeys.has(key) &&
    references.includes("descriptions.js") &&
    references.includes("ui.js") &&
    nonempty.length === locales.length
  ) {
    verifiedRoute = "Cosmic Forge ui.js#triggerFeedBackModal gathers free-text feedback and passes it to setFeedbackValueAndSaveGame, which calls saveGameToCloud; the owner decision excludes cloud saves, accounts, and sync in MIAPLACIDUS.";
    disposition = "EXCLUDED_OWNER_DIRECTED_FEEDBACK_CLOUD_SAVE";
    evidence = "These populated strings belong to the source feedback submission flow, whose callback saves the feedback payload to the cloud. MIAPLACIDUS has no equivalent feedback/cloud-save destination under the owner-directed cloud-save exclusion.";
    excludedOwnerFeedbackCloudSave += 1;
  } else if (
    key.startsWith("debugger") &&
    nonempty.length === locales.length &&
    references.length === 1 &&
    references[0] === "constantsAndGlobalVars.js"
  ) {
    verifiedRoute = "Cosmic Forge index.html#variableDebuggerWindow is a developer variable inspector toggled in ui.js only when variable-debugger cheats are enabled (or by the source Test1981 pioneer-name backdoor); the MIAPLACIDUS project rule forbids reproducing that backdoor or production edit/cheat access.";
    disposition = "EXCLUDED_OWNER_DIRECTED_DEBUGGER_TOOLING";
    evidence = "Source debugger copy is confined to the variable editor in constantsAndGlobalVars.js and is not player-facing gameplay. The source-only inspector is behind its debug/cheat gate; MIAPLACIDUS does not provide this variable editor, and AGENTS.md forbids the pioneer-name backdoor and production edit/cheat access.";
    excludedInternalDebugger += 1;
  } else if (
    key === "blackHoleFeedContent1" &&
    nonempty.length === locales.length &&
    references.length === 1 &&
    references[0] === "descriptions.js"
  ) {
    verifiedRoute = "The source description bundle defines blackHoleFeedRow.content1, but a scan of all 33 production JavaScript/HTML files finds no active renderer or callsite for blackHoleFeedRow; the text is never shown in the source UI. The remake's Black Hole Feed resource value remains visible without a standalone help row.";
    disposition = "EXCLUDED_UNRENDERED_SOURCE_DESCRIPTION";
    evidence = "The populated source localization key is only loaded into an unused descriptions.js object and has no UI callsite, so it is not a player-facing route requiring a target string.";
    excludedUnrenderedBlackHoleFeedDescription += 1;
  } else if (verifiedResearchRowLabelTarget) {
    verifiedTarget = verifiedResearchRowLabelTarget.target;
    verifiedRoute = verifiedResearchRowLabelTarget.route;
    disposition = verifiedResearchRowLabelTarget.adapted
      ? "ADAPTED_RESEARCH_AUTOBUYER_LABEL"
      : "MAPPED_RESEARCH_BUILDING_LABEL";
    evidence = verifiedResearchRowLabelTarget.adapted
      ? "The source Research AutoBuyer row label maps to the populated six-locale target toggle label; the remake keeps the control visible but disabled until unlocked and exposes localized lock help."
      : "The source Research science-building row heading maps to its populated six-locale target name and active purchase-card renderer; the existing Research locale coverage is authored and not run for Phase 7.";
    if (verifiedResearchRowLabelTarget.adapted) adaptedResearchAutoBuyerLabels += 1;
    else mappedResearchRowLabels += 1;
  } else if (verifiedCasinoTooltipTarget) {
    verifiedTarget = verifiedCasinoTooltipTarget.target;
    verifiedRoute = verifiedCasinoTooltipTarget.route;
    disposition = verifiedCasinoTooltipTarget.adapted
      ? "ADAPTED_GALACTIC_CASINO_HELP"
      : "MAPPED_GALACTIC_CASINO_HELP";
    evidence = verifiedCasinoTooltipTarget.adapted
      ? "The populated six-locale source Wheel guidance is routed to the target prize selector's visible accessible help; Cosmic Forge registers the text but its active Casino DOM has no corresponding info icon. The authored six-locale route spec is not run for Phase 7."
      : "The populated six-locale source header help maps to the active Galactic Casino header tooltip; the authored six-locale route spec is not run for Phase 7.";
    if (verifiedCasinoTooltipTarget.adapted) adaptedCasinoTooltips += 1;
    else mappedCasinoTooltips += 1;
  } else if (verifiedCasinoSourceCopyTarget) {
    verifiedTarget = verifiedCasinoSourceCopyTarget.target;
    verifiedRoute = verifiedCasinoSourceCopyTarget.route;
    disposition = verifiedCasinoSourceCopyTarget.adapted
      ? "ADAPTED_GALACTIC_CASINO_COPY"
      : "MAPPED_GALACTIC_CASINO_COPY";
    evidence = verifiedCasinoSourceCopyTarget.adapted
      ? "The source Casino help, tier-name, or Wheel prize copy maps to its populated six-locale active Casino route. Any remake-specific formatting, localized good-name interpolation, or added cost/odds context is recorded in the Phase 7 crosswalk; authored all-locale coverage is NOT RUN."
      : "The source Casino game-help copy maps to its populated six-locale active focusable help route; authored all-locale coverage is NOT RUN. The separate Galactic Casino child ownership is preserved.";
    if (verifiedCasinoSourceCopyTarget.adapted) adaptedCasinoSourceCopy += 1;
    else mappedCasinoSourceCopy += 1;
  } else if (verifiedCasinoNotificationTarget) {
    verifiedTarget = verifiedCasinoNotificationTarget.target;
    verifiedRoute = verifiedCasinoNotificationTarget.route;
    disposition = verifiedCasinoNotificationTarget.adapted
      ? "ADAPTED_GALACTIC_CASINO_NOTIFICATION"
      : "MAPPED_GALACTIC_CASINO_NOTIFICATION";
    evidence = "The populated six-locale source Casino notification or invalid-action copy maps to its active selected-locale outcome or inline-reason route; the specific template composition and any defensive-only path are recorded in the Phase 7 crosswalk. Authored locale coverage is NOT RUN.";
    if (verifiedCasinoNotificationTarget.adapted) adaptedCasinoNotificationCopy += 1;
    else mappedCasinoNotificationCopy += 1;
  } else if (verifiedCasinoNotificationExclusions.has(key)) {
    verifiedRoute = verifiedCasinoNotificationExclusions.get(key);
    disposition = "EXCLUDED_UNREACHABLE_CASINO_NOTIFICATION";
    evidence = "Static inspection of the source callsite and target typed Wheel reducer shows that this populated source fallback has no reachable normal player-facing result in the remake; the reason is recorded in the Phase 7 crosswalk.";
    excludedUnreachableCasinoNotifications += 1;
  } else if (casinoFallbackExclusionsAreVerified && casinoFallbackSourceKeys.has(key)) {
    disposition = "EXCLUDED_UNREACHABLE_CASINO_FALLBACK";
    evidence = "The source fallback is used only when a Void Seer catalog entry has no labelKey; the checked-in production catalog provides a populated casinoVoidSeerPrizeLabel key for all three tiers, so this fallback has no normal player-visible route.";
    excludedUnreachableCasinoFallbacks += 1;
  } else if (verifiedBattleResultCopyTarget) {
    verifiedTarget = verifiedBattleResultCopyTarget.target;
    verifiedRoute = verifiedBattleResultCopyTarget.route;
    disposition = "ADAPTED_BATTLE_RESULT_COPY";
    evidence = "The populated six-locale source battle result title/body or peaceful-arrival copy maps to the active inline Interstellar Colonise result route; the target does not open the source modal. The authored all-locale result spec is not run for Phase 7.";
    adaptedBattleResultCopy += 1;
  } else if (verifiedPlayerLeaderIntroTarget) {
    verifiedTarget = verifiedPlayerLeaderIntroTarget.target;
    verifiedRoute = verifiedPlayerLeaderIntroTarget.route;
    disposition = "ADAPTED_PLAYER_LEADER_INTRO_COPY";
    evidence = "The populated source leader-intro heading/path copy maps to the active first-star-study Philosophy choice cards, which present the localized path name, summary, ability name, and effect before the permanent choice; no duplicate post-award modal is rendered. The authored all-locale choice-card spec is not run for Phase 7.";
    adaptedPlayerLeaderIntroCopy += 1;
  } else if (verifiedHomecomingStoryTarget) {
    verifiedTarget = verifiedHomecomingStoryTarget.target;
    verifiedRoute = verifiedHomecomingStoryTarget.route;
    disposition = "ADAPTED_HOMECOMING_STORY_COPY";
    evidence = "The populated six-locale source story page heading/body or final action maps to its matching post-homecoming MIAPLACIDUS story field; the separate source page sequence and active story renderer are preserved. Authored six-locale route coverage is not run for Phase 7.";
    adaptedHomecomingStoryCopy += 1;
  } else if (verifiedOnboardingTarget) {
    verifiedTarget = verifiedOnboardingTarget.target;
    verifiedRoute = verifiedOnboardingTarget.route;
    disposition = "ADAPTED_ONBOARDING_TUTORIAL";
    evidence = "The source first-run modal was removed by the owner decision; its optional guidance is adapted into the populated six-locale resumable ProgressionTutorial offer/first step. The authored route spec is not run for Phase 7.";
    adaptedOnboardingMessages += 1;
  } else if (verifiedOpeningBriefingAdaptation) {
    verifiedTarget = verifiedOpeningBriefingAdaptation.target;
    verifiedRoute = verifiedOpeningBriefingAdaptation.route;
    disposition = verifiedOpeningBriefingAdaptation.disposition;
    evidence = verifiedOpeningBriefingAdaptation.evidence;
    if (key === "gameIntroHeader") adaptedStartupBriefingHeadings += 1;
    else if (key === "gameIntroText") excludedStartupBriefingBodies += 1;
  } else if (verifiedStartupNameTarget) {
    verifiedTarget = verifiedStartupNameTarget.target;
    verifiedRoute = verifiedStartupNameTarget.route;
    disposition = "ADAPTED_STARTUP_NAME_PROMPT";
    evidence = "The source pioneer-name collection prompt is adapted to the populated localized pioneer-name field label in SaveStartScreen.tsx; authored six-locale App Boot coverage is NOT RUN.";
    adaptedStartupNamePrompts += 1;
  } else if (verifiedStartupActionTarget) {
    verifiedTarget = verifiedStartupActionTarget.target;
    verifiedRoute = verifiedStartupActionTarget.route;
    disposition = "ADAPTED_STARTUP_NEW_GAME_ACTION";
    evidence = "The populated six-locale source New Game action maps to the active SaveStartScreen new-game button label; the existing authored six-locale startup route asserts the selected-locale button text and is not run for Phase 7.";
    adaptedStartupNewGameActions += 1;
  } else if (verifiedAchievementDescriptionTarget) {
    verifiedTarget = verifiedAchievementDescriptionTarget.target;
    verifiedRoute = verifiedAchievementDescriptionTarget.route;
    disposition = "MAPPED_ACHIEVEMENT_DESCRIPTION";
    evidence = "The source tooltip text maps by stable achievement id to populated six-locale target card-name and accessible-description fields rendered by AchievementsPane.tsx; the existing authored all-achievement name/description locale specs are not run for Phase 7.";
    mappedAchievementDescriptions += 1;
  } else if (verifiedAchievementNotificationTarget) {
    verifiedTarget = verifiedAchievementNotificationTarget.target;
    verifiedRoute = verifiedAchievementNotificationTarget.route;
    disposition = "MAPPED_ACHIEVEMENT_NOTIFICATION";
    evidence = "The source earned-notice key maps by stable achievement id to populated six-locale target copy selected by achievementEventNotifications.ts; authored notification locale coverage is not run for Phase 7.";
    mappedAchievementNotifications += 1;
  } else if (verifiedAchievementMetadataTarget) {
    verifiedTarget = verifiedAchievementMetadataTarget.target;
    verifiedRoute = verifiedAchievementMetadataTarget.route;
    disposition = "MAPPED_ACHIEVEMENT_METADATA_LABEL";
    evidence = "The source achievement tooltip label maps to its populated six-locale field in achievementMessages.ts and the active AchievementsPane.tsx card renderer; the focused all-card locale spec is AUTHORED, NOT RUN.";
    mappedAchievementMetadataLabels += 1;
  } else if (verifiedSourceCompoundPresetLabelExclusion) {
    verifiedRoute = verifiedSourceCompoundPresetLabelExclusion.route;
    verifiedTarget = "No direct target localization path; source quantity-preset selector is absent";
    disposition = "EXCLUDED_SOURCE_COMPOUND_PRESET_LABEL_WITHOUT_TARGET_CONTROL";
    evidence = "These populated source labels belong to Compound quantity-preset options that MIAPLACIDUS does not render. The active target has an Amount control and recipe rows; the authored locale spec covers the current recipe presentation only and does not claim the source selector exists.";
    excludedSourceCompoundPresetLabels += 1;
  } else if (warModeDialogTarget) {
    verifiedTarget = warModeDialogTarget.target;
    verifiedRoute = warModeDialogTarget.route;
    disposition = "MAPPED_WAR_MODE_ENTRY_CONFIRMATION_COPY";
    evidence = "Source war-entry confirmation copy maps to populated six-locale target fields on the active Starship Colonise route; the focused two-state locale spec is AUTHORED, NOT RUN.";
    mappedWarModeEntryCopy += 1;
  } else if (unsupportedWarModeOutcomeExclusion) {
    verifiedRoute = unsupportedWarModeOutcomeExclusion.route;
    verifiedTarget = "No direct target outcome-dialog route; target behavior gap is documented";
    disposition = "EXCLUDED_UNSUPPORTED_WAR_MODE_OUTCOME_DIALOG";
    evidence = "The source-only outcome dialog implies combat or diplomacy effects/timing that the active target does not reproduce; no target message is presented as equivalent. Exact mechanics differences remain documented for a separate owner behavior decision.";
    excludedWarModeOutcomeCopy += 1;
  } else if (dynamicNameFamily.test(key)) {
    disposition = "COMPUTED_NAME_FAMILY_MAPPED";
    evidence = "See the per-key module, fleet, Ascendency, and event-name mapping in the Phase 7 crosswalk.";
    referenceMode = references.length ? referenceMode : "computed-id-reference";
    mappedDynamic += 1;
  } else if (verifiedTechnologyTarget) {
    disposition = "MAPPED_TECHNOLOGY_NOTICE";
    evidence = "Target key and Tech Tree notification owner are recorded in the active crosswalk; six source and target locale values are present.";
    mappedTechnology += 1;
  } else if (verifiedTechnologySummaryTarget) {
    disposition = "ADAPTED_TECHNOLOGY_SUMMARY";
    evidence = "The source Content1 description maps to a populated six-locale concise summary rendered on its owning Research node or revealed Megastructure stage; detailed Content2 help remains separately routed. Authored all-locale route specs are NOT RUN.";
    adaptedTechnologySummaries += 1;
  } else if (verifiedTechnologyNodeTarget) {
    disposition = verifiedTechnologyNodeTarget.copyKind === "name"
      ? "MAPPED_TECHNOLOGY_NODE_NAME"
      : "MAPPED_TECHNOLOGY_NODE_DESCRIPTION";
    evidence = "The standard Tech Tree source key maps to a populated six-locale technology catalogue field and the active TechnologyPrerequisiteTree node route; the authored Research locale spec is not run.";
    if (verifiedTechnologyNodeTarget.copyKind === "name") mappedTechnologyNodeNames += 1;
    else mappedTechnologyNodeDescriptions += 1;
  } else if (verifiedMegastructureStructureNameTarget) {
    verifiedTarget = verifiedMegastructureStructureNameTarget.target;
    verifiedRoute = verifiedMegastructureStructureNameTarget.route;
    disposition = "MAPPED_MEGASTRUCTURE_STRUCTURE_NAME";
    evidence = "The localized source structure label maps to a populated six-locale target name and remains on its own Megastructure track heading; see the Megastructures area README and Phase 7 crosswalk.";
    mappedMegastructureStructureNames += 1;
  } else if (verifiedMegastructureStageNameTarget) {
    verifiedTarget = verifiedMegastructureStageNameTarget.target;
    verifiedRoute = verifiedMegastructureStageNameTarget.route;
    disposition = "MAPPED_MEGASTRUCTURE_STAGE_NAME";
    evidence = "The localized source research-stage label maps to its populated six-locale technology name and active stage row; see the Megastructures area README and Phase 7 crosswalk.";
    mappedMegastructureStageNames += 1;
  } else if (verifiedMegastructureEffectTarget) {
    verifiedTarget = verifiedMegastructureEffectTarget.target;
    verifiedRoute = verifiedMegastructureEffectTarget.route;
    disposition = "MAPPED_MEGASTRUCTURE_EFFECT_COPY";
    evidence = "The source-visible stage effect label maps to its populated six-locale MEGASTRUCTURE_EFFECTS record and is rendered on the corresponding Megastructure stage row; the authored six-locale E2E spec is not run.";
    mappedMegastructureEffects += 1;
  } else if (verifiedCosmicRipResultDialogTarget) {
    verifiedTarget = verifiedCosmicRipResultDialogTarget.target;
    verifiedRoute = verifiedCosmicRipResultDialogTarget.route;
    if (verifiedCosmicRipResultDialogTarget.kind === "research") {
      disposition = "MAPPED_COSMIC_RIP_RESEARCH_RESULT_DIALOG";
      evidence = "Source Cosmic Rip technology-result copy maps to populated six-locale structured result-dialog fields and the active App.tsx research-completion handler; the route is covered by authored E2E area specs, which are not run for Phase 7.";
      mappedCosmicRipResearchResultDialogs += 1;
    } else if (verifiedCosmicRipResultDialogTarget.adapted) {
      disposition = "ADAPTED_COSMIC_RIP_RESULT_DIALOG";
      evidence = "The source Cosmic Rip result body maps to its populated six-locale target dialog field with the owner-directed MIAPLACIDUS identity; its active event route is recorded in the Phase 7 crosswalk.";
      adaptedCosmicRipResultDialogs += 1;
    } else {
      disposition = "MAPPED_COSMIC_RIP_RESULT_DIALOG";
      evidence = "Source Cosmic Rip milestone/closure result copy maps to populated six-locale target dialog fields and its active event handler; see the Phase 7 crosswalk.";
      mappedCosmicRipResultDialogs += 1;
    }
  } else if (verifiedResearchUnlockResultDialogTarget) {
    verifiedTarget = verifiedResearchUnlockResultDialogTarget.target;
    verifiedRoute = verifiedResearchUnlockResultDialogTarget.route;
    disposition = "ADAPTED_RESEARCH_UNLOCK_RESULT_DIALOG";
    evidence = "Cosmic Forge research unlock result copy maps to populated six-locale structured dialog fields and the active App.tsx completion handler; Compound Machining also uses its dialog for the second-level unlock. The authored all-locale result-dialog spec is NOT RUN for Phase 8.";
    adaptedResearchUnlockResultDialogs += 1;
  } else if (verifiedSpaceProgressionDialogTarget) {
    verifiedTarget = verifiedSpaceProgressionDialogTarget.target;
    verifiedRoute = verifiedSpaceProgressionDialogTarget.route;
    disposition = "MAPPED_SPACE_PROGRESSION_RESULT_DIALOG";
    evidence = "Source Galactic unlock/O-type result dialog copy maps to its active populated six-locale result route; the authored route specs are marked NOT RUN for Phase 8.";
    mappedSpaceProgressionDialogs += 1;
  } else if (verifiedRebirthConfirmationTarget) {
    verifiedTarget = verifiedRebirthConfirmationTarget.target;
    verifiedRoute = verifiedRebirthConfirmationTarget.route;
    disposition = "MAPPED_REBIRTH_CONFIRMATION_COPY";
    evidence = "Source Rebirth confirmation copy maps to populated six-locale REBIRTH_TEXT fields on the active AscendencyPane dialog. The source body replaces its placeholder carry span with modalRebirthCarryOverAp and conditionally appends modalRebirthGainGp; those values map to carry and gp separately. The all-locale route spec covers the title, prompt, reset/retained-state body, AP and unlocked Cosmic Rip GP carryover, and actions; authored Phase 7 coverage is NOT RUN.";
    mappedRebirthConfirmationCopy += 1;
  } else if (verifiedRebirthRowTarget) {
    verifiedTarget = verifiedRebirthRowTarget.target;
    verifiedRoute = verifiedRebirthRowTarget.route;
    disposition = "ADAPTED_REBIRTH_PAGE_COPY";
    evidence = "The source Galactic Rebirth row copy maps to a populated six-locale Rebirth page destination: the row label is the count-card heading, its reset/retain-AP description is adapted to the confirmation's reset/retained-meta body, and the liquidation label is the asset-liquidation card heading. The six-locale route spec is AUTHORED, NOT RUN.";
    adaptedRebirthPageCopy += 1;
  } else if (verifiedTab7ChildLabelTarget) {
    verifiedTarget = verifiedTab7ChildLabelTarget.target;
    verifiedRoute = verifiedTab7ChildLabelTarget.route;
    disposition = "MAPPED_GALACTIC_CHILD_LABEL";
    evidence = "The source Tab 7 row label maps to a populated six-locale field rendered in its separate Galactic Market or Galactic Casino child page; the all-locale source-label specs are AUTHORED, NOT RUN.";
    mappedGalacticCopy += 1;
  } else if (verifiedAutobuyerDisplayCopyTarget) {
    verifiedTarget = verifiedAutobuyerDisplayCopyTarget.target;
    verifiedRoute = verifiedAutobuyerDisplayCopyTarget.route;
    disposition = verifiedAutobuyerDisplayCopyTarget.adapted
      ? "ADAPTED_ECONOMY_AUTOBUYER_DISPLAY_COPY"
      : "MAPPED_ECONOMY_AUTOBUYER_DISPLAY_COPY";
    evidence = verifiedAutobuyerDisplayCopyTarget.adapted
      ? "Source Economy action fragments map to populated six-locale Energy action templates or the active Resource/Compound Autobuyer tier purchase and rate summary. Focused Hydrogen and Diesel assertions are AUTHORED, NOT RUN."
      : "The source quantity label maps to the populated selected-locale quantity label in the active Resource and Compound Autobuyer tier summaries. The focused six-locale route spec is AUTHORED, NOT RUN.";
    if (verifiedAutobuyerDisplayCopyTarget.adapted) adaptedAutobuyerDisplayCopy += 1;
    else mappedAutobuyerDisplayCopy += 1;
  } else if (verifiedEnergyLabelTarget) {
    verifiedTarget = verifiedEnergyLabelTarget.target;
    verifiedRoute = verifiedEnergyLabelTarget.route;
    disposition = "MAPPED_ENERGY_PAGE_COPY";
    evidence = "Source Energy row or action copy maps to its populated six-locale target catalogue value and active Batteries/Power renderer; the authored locale route spec is marked NOT RUN for Phase 8.";
    mappedEnergyLabels += 1;
  } else if (verifiedCompoundActionTarget) {
    verifiedTarget = verifiedCompoundActionTarget.target;
    verifiedRoute = verifiedCompoundActionTarget.route;
    disposition = verifiedCompoundActionTarget.adapted
      ? "ADAPTED_COMPOUND_CHILD_ACTION_COPY"
      : "MAPPED_COMPOUND_CHILD_ACTION_COPY";
    evidence = verifiedCompoundActionTarget.adapted
      ? "The source Auto: label maps to the populated six-locale automatic-creation checkbox label on individual Compound children. The wording expands the source abbreviation while retaining the selected-locale control route; its focused spec is AUTHORED, NOT RUN."
      : "Source Compound creation, sale, or storage copy maps to populated six-locale target fields on its active individual Compound child; Water retains its distinct reservoir copy. The authored locale route spec is marked NOT RUN for Phase 8.";
    if (verifiedCompoundActionTarget.adapted) adaptedCompoundActionCopy += 1;
    else mappedCompoundActionCopy += 1;
  } else if (verifiedPhilosophyTechnologyNameTarget) {
    disposition = "MAPPED_PHILOSOPHY_TECHNOLOGY_NAME";
    evidence = "The source Philosophy ability/repeatable technology name maps to its populated six-locale path in philosophyMessages.ts and the active PhilosophyPane renderer; source and destination ownership are recorded in the Phase 7 crosswalk.";
    mappedPhilosophyTechnologyNames += 1;
  } else if (verifiedPhilosophyPathNameTarget) {
    verifiedTarget = verifiedPhilosophyPathNameTarget.target;
    verifiedRoute = verifiedPhilosophyPathNameTarget.route;
    disposition = "MAPPED_PHILOSOPHY_PATH_NAME";
    evidence = "The source Philosophy choice name maps to its distinct populated six-locale path identity and the active choice-card route; the focused locale spec is AUTHORED, NOT RUN.";
    mappedPhilosophyPathNames += 1;
  } else if (verifiedPhilosophyTechnologyDescriptionTarget) {
    disposition = "ADAPTED_PHILOSOPHY_TECHNOLOGY_EFFECT";
    evidence = "The source Philosophy technology help maps to its populated six-locale ability or repeatable effect text on the corresponding active PhilosophyPane card; focused all-locale copy coverage is authored and NOT RUN.";
    adaptedPhilosophyTechnologyDescriptions += 1;
  } else if (verifiedRandomEventTarget?.disposition === "EXCLUDED_NON_PLAYER_FACING_DIAGNOSTIC") {
    disposition = verifiedRandomEventTarget.disposition;
    evidence = "Source call-site review identifies this value as a developer-only console diagnostic, not player-facing copy; this exclusion is recorded in the Phase 7 crosswalk.";
    excludedRandomEventDiagnostics += 1;
  } else if (verifiedRandomEventTarget?.disposition === "ADAPTED_UNREACHABLE_EVENT_FALLBACK") {
    disposition = verifiedRandomEventTarget.disposition;
    evidence = "The target uses specific descriptions for every member of its closed RandomEventId union; the source's generic fallback has no corresponding reachable target state. Its retained target catalogue values are populated.";
    adaptedRandomEventFallbacks += 1;
  } else if (verifiedRandomEventTarget) {
    disposition = "MAPPED_RANDOM_EVENT_COPY";
    evidence = "Target key, six populated locale values, and selected-locale route owner are recorded in the Phase 7 crosswalk.";
    mappedRandomEvent += 1;
  } else if (ownerDirectedExclusion) {
    disposition = "EXCLUDED_OWNER_DIRECTED_CONTACT";
    evidence = "The Contact external-link destination is explicitly excluded from the six-destination Settings scope by the owner decision; this source copy has no remake route.";
    excludedOwnerContact += 1;
  } else if (ownerDirectedExitExclusion) {
    disposition = "EXCLUDED_OWNER_DIRECTED_EXIT";
    evidence = "The Settings Exit Game menu item and confirmation flow are excluded by the owner-directed platform decision; no player-facing remake destination is required.";
    excludedOwnerExit += 1;
  } else if (ownerDirectedCloudExclusion) {
    disposition = "EXCLUDED_OWNER_DIRECTED_CLOUD_SAVE";
    evidence = "The source cloud save/account/sync route and its notices have no target because the owner decision excludes cloud saves, accounts, and sync.";
    excludedOwnerCloudSave += 1;
  } else if (verifiedMiaplaediaTarget) {
    disposition = verifiedMiaplaediaTarget.disposition ?? "MAPPED_MIAPLAEDIA_DOCUMENT_COPY";
    evidence = disposition === "MAPPED_MIAPLAEDIA_LIBRARY_LABEL"
      ? "The source Cosmicopedia library label is owner-adapted to the populated Miaplaedia tab label in all six locales."
      : "Source option and article index map to the active Miaplaedia child/catalogue route; target values are non-empty in all six locales.";
    if (disposition === "MAPPED_MIAPLAEDIA_LIBRARY_LABEL") mappedMiaplaediaLibraryLabel += 1;
    else mappedMiaplaedia += 1;
  } else if (verifiedPhilosophyTarget) {
    disposition = "MAPPED_PHILOSOPHY_NOTIFICATION";
    evidence = "P-44 source/catalogue/renderer comparison records all 20 action-result and four selection notices across six locales; the active philosophy event handler resolves the mapped target path. See the archived audit and Phase 7 crosswalk.";
    mappedPhilosophyNotices += 1;
  } else if (verifiedPhilosophyHeaderHelpTarget) {
    verifiedTarget = verifiedPhilosophyHeaderHelpTarget.target;
    verifiedRoute = verifiedPhilosophyHeaderHelpTarget.route;
    disposition = "ADAPTED_PHILOSOPHY_HEADER_HELP";
    evidence = "The source Philosophy page tooltip maps to its populated six-locale three-paragraph target guidance and active focusable header control; focused all-locale assertions are authored and NOT RUN.";
    adaptedPhilosophyHeaderHelp += 1;
  } else if (verifiedHeaderDescriptionTarget) {
    disposition = verifiedHeaderDescriptionTarget.exact
      ? "MAPPED_HEADER_DESCRIPTION"
      : "ADAPTED_HEADER_DESCRIPTION";
    evidence = verifiedHeaderDescriptionTarget.exact
      ? "Source header-description key matches the populated six-locale target property and its active renderer route; see the Phase 7 crosswalk."
      : "The source header-description key is adapted to populated six-locale help in its active target page renderer; see the Phase 7 crosswalk.";
    if (verifiedHeaderDescriptionTarget.exact) mappedHeaderDescriptions += 1;
    else adaptedHeaderDescriptions += 1;
  } else if (verifiedSourceNewsTarget) {
    verifiedTarget = verifiedSourceNewsTarget.target;
    verifiedRoute = verifiedSourceNewsTarget.route;
    disposition = "MAPPED_SOURCE_NEWS_COPY";
    evidence = "Source news array order, target six-locale indexed-array shape, news ID offset, and active ticker/journal renderer selection are statically mapped; see the Phase 7 crosswalk. Translation quality is not assessed.";
    mappedSourceNews += 1;
  } else if (verifiedStatisticsTarget) {
    verifiedTarget = verifiedStatisticsTarget.target;
    verifiedRoute = verifiedStatisticsTarget.route;
    disposition = "MAPPED_STATISTICS_LABEL";
    evidence = "The archived 102-row Statistics crosswalk maps the source label to its active target label selector and rendered row; source and target values are populated in all six locales. See the Phase 7 crosswalk.";
    mappedStatistics += 1;
  } else if (verifiedStatusLabelTarget) {
    verifiedTarget = verifiedStatusLabelTarget.target;
    verifiedRoute = verifiedStatusLabelTarget.route;
    disposition = "MAPPED_STATUS_LABEL";
    evidence = "The source HUD status label maps to the active selected-locale TopStatusBar renderer and populated target value in all six locales; the focused route spec is AUTHORED, NOT RUN.";
    mappedStatusLabels += 1;
  } else if (verifiedMegastructureResultTarget) {
    verifiedTarget = verifiedMegastructureResultTarget.target;
    verifiedRoute = verifiedMegastructureResultTarget.route;
    disposition = "MAPPED_MEGASTRUCTURE_RESULT_COPY";
    evidence = "The source Megastructure header/body maps to the populated selected-locale result dialog title, summary, and benefit lines for its corresponding technology research event; see the Phase 7 crosswalk.";
    mappedMegastructureResults += 1;
  } else if (verifiedAutobuyerNameTarget) {
    verifiedTarget = verifiedAutobuyerNameTarget.target;
    verifiedRoute = verifiedAutobuyerNameTarget.route;
    disposition = "MAPPED_AUTOBUYER_NAME";
    evidence = "The source resourceDataObject nameUpgrade key is rendered by the matching source drawTab row and maps to the populated six-locale target tier label and active Resources/Compounds route.";
    mappedAutobuyerNames += 1;
  } else if (verifiedAutobuyerRowLabelTarget) {
    verifiedTarget = verifiedAutobuyerRowLabelTarget.target;
    verifiedRoute = verifiedAutobuyerRowLabelTarget.route;
    disposition = "ADAPTED_AUTOBUYER_ROW_LABEL";
    evidence = "The source Autobuyer row label is represented by the populated selected-locale tier name and tier heading in its active Resources/Compounds route; Hydrogen Tier 1 uses the dedicated compressor heading. The row-label mapping is adapted to the remake's heading structure.";
    adaptedAutobuyerRowLabels += 1;
  } else if (excludedSolarAutobuyerNameTarget) {
    verifiedRoute = excludedSolarAutobuyerNameTarget.route;
    disposition = "EXCLUDED_UNROUTED_SOLAR_AUTOBUYER_NAME";
    evidence = "Source data contains this localized key, but source UI route inspection found no rendered Solar Autobuyer name control; the value remains only for legacy data compatibility.";
    excludedSolarAutobuyerNames += 1;
  } else if (verifiedAutobuyerHelpTarget) {
    verifiedTarget = verifiedAutobuyerHelpTarget.target;
    verifiedRoute = verifiedAutobuyerHelpTarget.route;
    disposition = "MAPPED_AUTOBUYER_HELP";
    evidence = "The source Hydrogen Autobuyer Tier 1 description maps to its populated six-locale target help field and visible control route; see the Phase 7 crosswalk.";
    mappedAutobuyerHelp += 1;
  } else if (verifiedResearchActionHelpTarget) {
    verifiedTarget = verifiedResearchActionHelpTarget.target;
    verifiedRoute = verifiedResearchActionHelpTarget.route;
    disposition = "MAPPED_RESEARCH_BUILDING_HELP";
    evidence = "The source Science Kit, Science Club, or Science Lab help maps to a populated six-locale action-card description; the Science Lab adds its live localized Power rate. Focused all-locale route coverage is AUTHORED, NOT RUN.";
    mappedResearchActionHelp += 1;
  } else if (verifiedAscendencyPerkHelpTarget) {
    verifiedTarget = verifiedAscendencyPerkHelpTarget.target;
    verifiedRoute = verifiedAscendencyPerkHelpTarget.route;
    disposition = "ADAPTED_ASCENDENCY_PERK_EFFECT_COPY";
    evidence = "The source Ascendency buff-row description maps to a populated six-locale effect summary on its matching Galactic > Ascendency Perks card; focused all-locale visible-copy coverage is AUTHORED, NOT RUN.";
    adaptedAscendencyPerkHelp += 1;
  } else if (verifiedEconomyActionHelpTarget) {
    verifiedTarget = verifiedEconomyActionHelpTarget.target;
    verifiedRoute = verifiedEconomyActionHelpTarget.route;
    disposition = "MAPPED_ECONOMY_ACTION_HELP";
    evidence = "The source Resource/Compound action description maps to its same-key populated six-locale target help field; the active EconomyPanes.tsx route selects it for the matching good and action, and the all-locale row/help spec is authored but not run for Phase 7.";
    mappedEconomyActionHelp += 1;
  } else if (verifiedCosmicRipRowLabelTarget) {
    verifiedTarget = verifiedCosmicRipRowLabelTarget.target;
    verifiedRoute = verifiedCosmicRipRowLabelTarget.route;
    disposition = verifiedCosmicRipRowLabelTarget.adapted
      ? "ADAPTED_COSMIC_RIP_ROW_LABEL"
      : "MAPPED_COSMIC_RIP_ROW_LABEL";
    evidence = "The source Cosmic Rip status/action row maps to a populated six-locale message and its separate target page route; map and status labels are rendered on their owning child pages. See the Phase 7 crosswalk.";
    if (verifiedCosmicRipRowLabelTarget.adapted) adaptedCosmicRipRowLabels += 1;
    else mappedCosmicRipRowLabels += 1;
  } else if (verifiedCosmicRipMessageTarget) {
    verifiedTarget = verifiedCosmicRipMessageTarget.target;
    verifiedRoute = verifiedCosmicRipMessageTarget.route;
    if (verifiedCosmicRipMessageTarget.kind === "technology-status") {
      disposition = "MAPPED_COSMIC_RIP_TECHNOLOGY_STATUS";
      evidence = "The source Cosmic Rip completed-technology or final-stabilization status maps to its populated six-locale target status field and active selected-locale Situation/card renderer; authored all-locale coverage is not run for Phase 7.";
      mappedCosmicRipTechnologyStatuses += 1;
    } else {
      disposition = "MAPPED_COSMIC_RIP_OBJECTIVE";
      evidence = "The source Cosmic Rip next-objective message maps to its populated six-locale objective field and the active selected-locale Situation route; the authored all-locale objective flow is not run for Phase 7.";
      mappedCosmicRipObjectives += 1;
    }
  } else if (verifiedCosmicRipActionHelpTarget) {
    verifiedTarget = verifiedCosmicRipActionHelpTarget.target;
    verifiedRoute = verifiedCosmicRipActionHelpTarget.route;
    disposition = "MAPPED_COSMIC_RIP_ACTION_HELP";
    evidence = "The source Cosmic Rip status, upgrade, or technology help maps to its populated six-locale target description and active selected-locale InfoTooltip route; authored focused locale coverage is not run for Phase 7.";
    mappedCosmicRipActionHelp += 1;
  } else if (verifiedSpaceMiningLabelTarget) {
    verifiedTarget = verifiedSpaceMiningLabelTarget.target;
    verifiedRoute = verifiedSpaceMiningLabelTarget.route;
    disposition = verifiedSpaceMiningLabelTarget.adapted
      ? "ADAPTED_SPACE_MINING_LABEL"
      : "MAPPED_SPACE_MINING_LABEL";
    evidence = "The source Space Mining label maps to its populated six-locale Telescope or Rocket field and its active child-page renderer; see the Phase 7 crosswalk.";
    if (verifiedSpaceMiningLabelTarget.adapted) adaptedSpaceMiningLabels += 1;
    else mappedSpaceMiningLabels += 1;
  } else if (verifiedRocketMinerNameTarget) {
    verifiedTarget = verifiedRocketMinerNameTarget.target;
    verifiedRoute = verifiedRocketMinerNameTarget.route;
    disposition = "ADAPTED_ROCKET_MINER_NAME";
    evidence = "Each populated six-locale source Rocket Miner name maps to its indexed Launch Pad card using the target's shared six-locale rocketMinerLabel template; the authored all-locale card assertions are not run for Phase 7.";
    adaptedRocketMinerNames += 1;
  } else if (verifiedResourceRowLabelTarget) {
    verifiedTarget = verifiedResourceRowLabelTarget.target;
    verifiedRoute = verifiedResourceRowLabelTarget.route;
    disposition = "ADAPTED_RESOURCE_ROW_ACTION_LABEL";
    evidence = "The source's conditional sell/allocate row label is adapted to the distinct remake sale action or production-allocation heading, with its selected-locale resource name; both target values are populated in all six locales and the active renderer route is recorded in the Phase 7 crosswalk.";
    mappedResourceRowLabels += 1;
  } else if (verifiedNavigationLabelTarget) {
    verifiedTarget = verifiedNavigationLabelTarget.target;
    verifiedRoute = verifiedNavigationLabelTarget.route;
    disposition = verifiedNavigationLabelTarget.adapted
      ? "ADAPTED_NAVIGATION_LABEL"
      : "MAPPED_NAVIGATION_LABEL";
    evidence = verifiedNavigationLabelTarget.adapted
      ? "Source menu label maps to its owner-directed target destination and populated selected-locale label; source option ownership and active renderer are recorded in the Phase 7 crosswalk."
      : "Source menu label maps to its populated six-locale target label and active destination renderer; source option ownership is recorded in the Phase 7 crosswalk.";
    if (verifiedNavigationLabelTarget.adapted) adaptedNavigationLabels += 1;
    else mappedNavigationLabels += 1;
  } else if (verifiedSettingsCopyTarget) {
    verifiedTarget = verifiedSettingsCopyTarget.target;
    verifiedRoute = verifiedSettingsCopyTarget.route;
    disposition = verifiedSettingsCopyTarget.adapted
      ? "ADAPTED_SETTINGS_PREFERENCE_COPY"
      : "MAPPED_SETTINGS_PREFERENCE_COPY";
    evidence = "Source Settings control copy maps to a populated six-locale target catalogue field used by its active Settings pane renderer; see the Settings locale spec and Phase 7 crosswalk.";
    if (verifiedSettingsCopyTarget.adapted) adaptedSettingsPreferenceCopy += 1;
    else mappedSettingsPreferenceCopy += 1;
  } else if (verifiedSaveSettingsCopyTarget) {
    verifiedTarget = verifiedSaveSettingsCopyTarget.target;
    verifiedRoute = verifiedSaveSettingsCopyTarget.route;
    disposition = verifiedSaveSettingsCopyTarget.adapted
      ? "ADAPTED_SETTINGS_SAVE_COPY"
      : "MAPPED_SETTINGS_SAVE_COPY";
    evidence = "Source Save Manager/autosave copy maps to its populated six-locale save catalogue field and active Settings route; the authored Save Manager locale spec is not run.";
    if (verifiedSaveSettingsCopyTarget.adapted) adaptedSettingsSaveCopy += 1;
    else mappedSettingsSaveCopy += 1;
  } else if (verifiedSettingsEventColumnTarget) {
    verifiedTarget = verifiedSettingsEventColumnTarget.target;
    verifiedRoute = verifiedSettingsEventColumnTarget.route;
    disposition = "ADAPTED_SETTINGS_EVENT_COLUMN_TO_CARDS";
    evidence = "Source Events Event/Effect table headings are adapted to the target's localized per-card event title and effect description in active/history entries; the six-locale event spec is authored and NOT RUN for Phase 8.";
    adaptedSettingsEventColumns += 1;
  } else if (verifiedInterstellarCopyTarget) {
    verifiedTarget = verifiedInterstellarCopyTarget.target;
    verifiedRoute = verifiedInterstellarCopyTarget.route;
    disposition = verifiedInterstellarCopyTarget.adapted
      ? "ADAPTED_INTERSTELLAR_COPY"
      : "MAPPED_INTERSTELLAR_COPY";
    evidence = "Source Interstellar child-page copy maps to a populated six-locale Starship catalogue value and its distinct active Starship/Fleet Hangar/Colonise renderer; see the authored Starship locale spec and Phase 7 crosswalk.";
    if (verifiedInterstellarCopyTarget.adapted) adaptedInterstellarCopy += 1;
    else mappedInterstellarCopy += 1;
  } else if (verifiedInterstellarScanReportLabelTarget) {
    verifiedTarget = verifiedInterstellarScanReportLabelTarget.target;
    verifiedRoute = verifiedInterstellarScanReportLabelTarget.route;
    disposition = verifiedInterstellarScanReportLabelTarget.adapted
      ? "ADAPTED_INTERSTELLAR_COPY"
      : "MAPPED_INTERSTELLAR_COPY";
    evidence = "The source Interstellar scan-report copy maps to populated six-locale Starship or Star Map fields. Grouped intelligence and air/land/sea labels follow the remake's structured report; the six-locale scan-report specs are authored and NOT RUN for Phase 8.";
    if (verifiedInterstellarScanReportLabelTarget.adapted) adaptedInterstellarCopy += 1;
    else mappedInterstellarCopy += 1;
  } else if (verifiedInterstellarTooltipTarget) {
    verifiedTarget = verifiedInterstellarTooltipTarget.target;
    verifiedRoute = verifiedInterstellarTooltipTarget.route;
    disposition = "ADAPTED_INTERSTELLAR_TOOLTIP";
    evidence = "The populated six-locale source tooltip maps to its distinct Star Map, Star Data, or Colonise report field and active focusable tooltip route; authored coverage is not run for Phase 7.";
    adaptedInterstellarTooltips += 1;
  } else if (verifiedCosmicRipPageHelpTarget) {
    verifiedTarget = verifiedCosmicRipPageHelpTarget.target;
    verifiedRoute = verifiedCosmicRipPageHelpTarget.route;
    disposition = "ADAPTED_COSMIC_RIP_PAGE_HELP";
    evidence = "The source info-tooltip body maps to the distinct populated six-locale help field on its owning Cosmic Rip child page. Its source page introduction is tracked separately; authored all-locale route coverage is NOT RUN.";
    adaptedCosmicRipPageHelp += 1;
  } else if (verifiedSourceTooltipCopyTarget) {
    verifiedTarget = verifiedSourceTooltipCopyTarget.target;
    verifiedRoute = verifiedSourceTooltipCopyTarget.route;
    disposition = "ADAPTED_SOURCE_HELP_TOOLTIP";
    evidence = key === "infoTooltipRebirthLiquidation"
      ? "The source localization entry has no Cosmic Forge DOM callsite. MIAPLACIDUS adapts its calculation guidance to the populated six-locale Galactic Rebirth liquidation card tooltip; authored route coverage is NOT RUN."
      : "The source header-help tooltip maps to populated six-locale target help sections rendered together on its owning Space Mining child page; remake-specific distance/status behavior is recorded in the route note and area README. Authored route coverage is NOT RUN.";
    adaptedSourceTooltipCopy += 1;
  } else if (verifiedResourceAllocationBreakdownTarget) {
    verifiedTarget = verifiedResourceAllocationBreakdownTarget.target;
    verifiedRoute = verifiedResourceAllocationBreakdownTarget.route;
    disposition = "ADAPTED_RESOURCE_ALLOCATION_BREAKDOWN";
    evidence = "The source production-rate allocation label maps to a populated six-locale target breakdown value on the owning Resource page; the storage row also appears in the source-defined Compound net-rate tooltip. Focused six-locale specs are authored and NOT RUN.";
    adaptedResourceAllocationBreakdownCopy += 1;
  } else if (verifiedAllocationTooltipTarget) {
    verifiedTarget = verifiedAllocationTooltipTarget.target;
    verifiedRoute = verifiedAllocationTooltipTarget.route;
    disposition = "ADAPTED_RESOURCE_ALLOCATION_TOOLTIP";
    evidence = "The source allocation or slider instruction maps to a populated six-locale selected-locale Resource allocation tooltip with current share values interpolated by AllocationControls; remaining breakdown-specific source branches are tracked separately. Authored locale coverage is NOT RUN.";
    adaptedAllocationTooltipCopy += 1;
  } else if (verifiedBlackHoleControlCopyTarget) {
    verifiedTarget = verifiedBlackHoleControlCopyTarget.target;
    verifiedRoute = verifiedBlackHoleControlCopyTarget.route;
    disposition = verifiedBlackHoleControlCopyTarget.adapted
      ? "ADAPTED_BLACK_HOLE_CONTROL_COPY"
      : "MAPPED_BLACK_HOLE_CONTROL_COPY";
    evidence = "The source Black Hole control or status copy maps to populated six-locale BlackHolePane fields and its selected-locale action/status route. Dynamic prices, current/next values, countdowns, or separately displayed multipliers are documented as adaptations; authored locale specs are NOT RUN.";
    if (verifiedBlackHoleControlCopyTarget.adapted) adaptedBlackHoleControlCopy += 1;
    else mappedBlackHoleControlCopy += 1;
  } else if (verifiedAdditionalPageCopyTarget) {
    verifiedTarget = verifiedAdditionalPageCopyTarget.target;
    verifiedRoute = verifiedAdditionalPageCopyTarget.route;
    disposition = "MAPPED_GALACTIC_CHILD_COPY";
    evidence = "The source Galactic child copy maps to a populated six-locale target catalogue value rendered on its own active child page; see the authored Black Hole locale spec and Phase 7 crosswalk.";
    mappedGalacticCopy += 1;
  } else if (verifiedGalacticMarketHelpTarget) {
    verifiedTarget = verifiedGalacticMarketHelpTarget.target;
    verifiedRoute = verifiedGalacticMarketHelpTarget.route;
    disposition = "MAPPED_GALACTIC_MARKET_HELP";
    evidence = "The source Galactic Market or Rebirth help value maps to a populated six-locale target field and active selected-locale InfoTooltip route; the authored Galactic area route spec is not run for Phase 7.";
    mappedGalacticMarketHelp += 1;
  } else if (verifiedRebirthSourceHelpTarget) {
    verifiedTarget = verifiedRebirthSourceHelpTarget.target;
    verifiedRoute = verifiedRebirthSourceHelpTarget.route;
    disposition = "ADAPTED_REBIRTH_PAGE_HELP";
    evidence = "The source Rebirth row description now has a separate populated six-locale tooltip beside the target Rebirth action; this keeps it distinct from the page overview and confirmation body. Focused route assertions are authored and NOT RUN.";
    adaptedRebirthPageHelp += 1;
  } else if (verifiedMegastructureHelpTarget) {
    verifiedTarget = verifiedMegastructureHelpTarget.target;
    verifiedRoute = verifiedMegastructureHelpTarget.route;
    disposition = "MAPPED_MEGASTRUCTURE_HELP_COPY";
    evidence = "The source force-field tooltip key maps to its populated six-locale target message and the live level-specific Megastructure help route; see the authored Megastructure help locale spec and Phase 7 crosswalk.";
    mappedMegastructureHelp += 1;
  } else if (verifiedResourceActionTarget) {
    verifiedTarget = verifiedResourceActionTarget.target;
    verifiedRoute = verifiedResourceActionTarget.route;
    disposition = verifiedResourceActionTarget.disposition;
    evidence = verifiedResourceActionTarget.evidence;
    mappedResourceActions += 1;
  } else if (verifiedResourceAndCompoundPageCopyTarget) {
    verifiedTarget = verifiedResourceAndCompoundPageCopyTarget.target;
    verifiedRoute = verifiedResourceAndCompoundPageCopyTarget.route;
    disposition = verifiedResourceAndCompoundPageCopyTarget.adapted
      ? "ADAPTED_RESOURCE_AND_COMPOUND_PAGE_COPY"
      : "MAPPED_RESOURCE_AND_COMPOUND_PAGE_COPY";
    evidence = "The populated source label maps to the selected-locale Resource or Compound storage control, bulk action, or child-group heading in the active remake renderer; all six target locale values are present. Focused locale route coverage is authored and NOT RUN for Phase 8.";
    mappedResourceActions += 1;
  } else if (key === "buttonEnlargeReservoir" && waterReservoirAction) {
    verifiedTarget = waterReservoirAction.target;
    verifiedRoute = waterReservoirAction.route;
    disposition = "MAPPED_RESOURCE_ACTION_LABEL";
    evidence = "Cosmic Forge assigns Water a distinct reservoir button label; the target uses its populated six-locale Water-specific action key in both the Water storage heading and purchase button, covered by the authored Resource row locale spec.";
    mappedResourceActions += 1;
  } else if (verifiedSourceNotificationTargets.has(key)) {
    const sourceNotificationTarget = verifiedSourceNotificationTargets.get(key);
    verifiedTarget = sourceNotificationTarget.target;
    verifiedRoute = sourceNotificationTarget.route;
    disposition = sourceNotificationTarget.disposition;
    evidence = sourceNotificationTarget.disposition === "ADAPTED_GALACTIC_DISCOVERY_CUE"
      ? "The source availability toast is adapted to the persistent, populated six-locale New page-attention cue, which remains until Megastructures is visited; current source/target ownership and all-locale route coverage are recorded in the Phase 7 crosswalk."
      : "The source feedback key maps to its populated six-locale target message and active selected-locale route; source/target ownership and authored-not-run locale coverage are recorded in the Phase 7 crosswalk.";
    mappedSourceNotifications += 1;
  } else {
    unresolved += 1;
  }
  rows.push(
    [
      key,
      `${nonempty.length}/6`,
      references.length ? references.join("; ") : "",
      referenceMode,
      exactCandidates.length ? exactCandidates.join("; ") : "",
      exactTargetPaths.length ? exactTargetPaths.join("; ") : "",
      samePropertyPathCandidateCatalogues.length ? samePropertyPathCandidateCatalogues.join("; ") : "",
      samePropertyPathCandidateTargetPaths.length ? samePropertyPathCandidateTargetPaths.join("; ") : "",
      verifiedTarget,
      verifiedRoute,
      disposition,
      evidence,
    ].map(quote).join(","),
  );
}

const output = path.join(projectRoot, "docs", "plans", "phase-7-source-key-inventory.csv");
process.stdout.write(`${rows.join("\n")}\n`);
console.error(JSON.stringify({
  output: path.relative(projectRoot, output).replaceAll(path.sep, "/"),
  sourceKeys: sourceKeys.length,
  sourceFilesScanned: sourceFiles.length,
  targetCataloguesScanned: targetFiles.length,
  targetLocalePathsExtracted: targetLocalePaths.reduce((total, [, catalogue]) => total + catalogue.en.size, 0),
  coreMessageLocalePaths: targetCatalogue("src/i18n/messages.ts")?.en.size ?? 0,
  coreMiaplaediaLabelParsed: targetCatalogue("src/i18n/messages.ts")?.en.has("tab.miaplaedia") ?? false,
  allLocaleKeysWithExactValueCandidates: exactCandidateKeys,
  allLocaleKeysWithSamePropertyPathCandidates: samePropertyPathCandidateKeys,
  keysInComputedNameFamiliesMappedByCrosswalk: mappedDynamic,
  mappedAchievementDescriptions,
  mappedAchievementNotifications,
  mappedAchievementMetadataLabels,
  excludedSourceCompoundPresetLabels,
  mappedWarModeEntryCopy,
  excludedWarModeOutcomeCopy,
  adaptedOnboardingMessages,
  adaptedStartupBriefingHeadings,
  excludedStartupBriefingBodies,
  adaptedStartupNamePrompts,
  adaptedStartupNewGameActions,
  mappedCasinoTooltips,
  adaptedCasinoTooltips,
  mappedCasinoSourceCopy,
  adaptedCasinoSourceCopy,
  mappedCasinoNotificationCopy,
  adaptedCasinoNotificationCopy,
  excludedUnreachableCasinoFallbacks,
  excludedUnreachableCasinoNotifications,
  excludedEmptyCasinoNotificationFragments,
  adaptedCosmicRipPageHelp,
  adaptedHomecomingStoryCopy,
  mappedResearchRowLabels,
  mappedResearchActionHelp,
  adaptedAscendencyPerkHelp,
  mappedPhilosophyPathNames,
  adaptedResearchAutoBuyerLabels,
  keysInTechnologyNoticeCrosswalk: mappedTechnology,
  mappedTechnologyNodeNames,
  mappedTechnologyNodeDescriptions,
  adaptedTechnologySummaries,
  adaptedPhilosophyTechnologyDescriptions,
  adaptedPhilosophyHeaderHelp,
  keysInRandomEventCopyCrosswalk: mappedRandomEvent,
  keysInMiaplaediaDocumentCrosswalk: mappedMiaplaedia,
  adaptedRandomEventFallbacks,
  excludedRandomEventDiagnostics,
  mappedMiaplaediaLibraryLabel,
  mappedSourceNews,
  mappedPhilosophyNotices,
  mappedPhilosophyTechnologyNames,
  mappedHeaderDescriptions,
  adaptedHeaderDescriptions,
  mappedStatistics,
  mappedStatusLabels,
  adaptedSourceTooltipCopy,
  adaptedAllocationTooltipCopy,
  adaptedResourceAllocationBreakdownCopy,
  mappedMegastructureResults,
  mappedMegastructureStructureNames,
  mappedMegastructureStageNames,
  mappedMegastructureEffects,
  mappedAutobuyerNames,
  adaptedAutobuyerRowLabels,
  mappedAutobuyerDisplayCopy,
  adaptedAutobuyerDisplayCopy,
  excludedSolarAutobuyerNames,
  mappedAutobuyerHelp,
  mappedEconomyActionHelp,
  mappedCosmicRipRowLabels,
  adaptedCosmicRipRowLabels,
  mappedCosmicRipTechnologyStatuses,
  mappedCosmicRipObjectives,
  mappedCosmicRipActionHelp,
  mappedCosmicRipResultDialogs,
  adaptedCosmicRipResultDialogs,
  mappedCosmicRipResearchResultDialogs,
  mappedSpaceProgressionDialogs,
  adaptedResearchUnlockResultDialogs,
  mappedRebirthConfirmationCopy,
  adaptedRebirthPageCopy,
  mappedEnergyLabels,
  mappedCompoundActionCopy,
  adaptedCompoundActionCopy,
  mappedSpaceMiningLabels,
  adaptedSpaceMiningLabels,
  adaptedRocketMinerNames,
  mappedResourceRowLabels,
  mappedNavigationLabels,
  adaptedNavigationLabels,
  mappedSettingsPreferenceCopy,
  adaptedSettingsPreferenceCopy,
  mappedSettingsSaveCopy,
  adaptedSettingsSaveCopy,
  adaptedSettingsEventColumns,
  mappedInterstellarCopy,
  adaptedInterstellarCopy,
  adaptedInterstellarTooltips,
  adaptedBattleResultCopy,
  adaptedPlayerLeaderIntroCopy,
  mappedGalacticCopy,
  mappedBlackHoleControlCopy,
  adaptedBlackHoleControlCopy,
  mappedGalacticMarketHelp,
  adaptedRebirthPageHelp,
  mappedMegastructureHelp,
  mappedResourceActions,
  mappedSourceNotifications,
  excludedOnboardingNeedles,
  excludedInternalDebugger,
  excludedUnrenderedBlackHoleFeedDescription,
  mappedSettingsPreferenceCopy,
  targetLocaleSourcesScanned: targetLocaleSourceFiles.length,
  excludedOwnerContact,
  excludedOwnerExit,
  excludedOwnerCloudSave,
  excludedOwnerFeedbackCloudSave,
  excludedUnroutedSourceKeys,
  sourceKeysEmptyInAllLocales: emptyKeys,
  remainingUnreviewedKeys: unresolved,
}, null, 2));
