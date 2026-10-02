import { useState } from "react";
import type { GameCommand } from "../../engine/commands";
import type { GameStore } from "../../engine/store";
import type { GameState } from "../../engine/state";
import { hydrogenAutobuyerPrice } from "../../content/hydrogen";
import { autobuyerUpgradeId } from "../../content/ids";
import { useGameSnapshot } from "../../ui/useGameSnapshot";
import { translate, type MessageKey } from "../../i18n/messages";

type ScenarioId = "compressor-ready" | "storage-ready";

interface DebugMetrics {
  readonly frames: number;
  readonly durationMs: number;
  readonly framesPerSecond: number;
}

interface DebugToolsProps {
  readonly store: GameStore;
  readonly seed: number;
  advanceBy(milliseconds: number): void;
  readonly readFrameMetrics: () => DebugMetrics;
}

interface DebugGateway extends DebugToolsProps {
  dispatch(command: GameCommand): boolean;
  runScenario(scenario: ScenarioId): GameState;
  getState(): GameState;
  getCommandLog(): readonly string[];
}

declare global {
  interface Window {
    miaplacidusTest?: DebugGateway;
  }
}

function clonedState(store: GameStore): GameState {
  return JSON.parse(JSON.stringify(store.getState())) as GameState;
}

function applyScenario(
  store: GameStore,
  scenario: ScenarioId,
  dispatchBatch: (commands: readonly GameCommand[]) => void,
): GameState {
  const target =
    scenario === "compressor-ready"
      ? hydrogenAutobuyerPrice(
          store.getState().run.upgrades[autobuyerUpgradeId("hydrogen", 1)] ?? 0,
        )
      : Math.max(0, store.getState().run.goods.hydrogen.storageCapacity - 1);
  let attempts = 0;
  const currentQuantity = store.getState().run.goods.hydrogen.quantity;
  const commands: GameCommand[] = [];
  let quantity = currentQuantity;
  while (quantity < target && attempts < 300) {
    commands.push({ type: "resource.collect", goodId: "hydrogen" });
    quantity += 1;
    attempts += 1;
  }
  dispatchBatch(commands);
  return clonedState(store);
}

export function installDebugGateway(props: DebugToolsProps): () => void {
  const commandLog: string[] = [];
  const dispatch = (command: GameCommand): boolean => {
    commandLog.push(JSON.stringify(command));
    return props.store.dispatch(command).accepted;
  };
  const dispatchBatch = (commands: readonly GameCommand[]): void => {
    commandLog.push(...commands.map((command) => JSON.stringify(command)));
    props.store.dispatchBatch(commands);
  };
  const gateway: DebugGateway = {
    ...props,
    advanceBy(milliseconds) {
      commandLog.push(JSON.stringify({ type: "test.clock.advance", milliseconds }));
      props.advanceBy(milliseconds);
    },
    dispatch,
    runScenario: (scenario) => applyScenario(props.store, scenario, dispatchBatch),
    getState: () => clonedState(props.store),
    getCommandLog: () => [...commandLog],
  };
  window.miaplacidusTest = gateway;
  return () => {
    if (window.miaplacidusTest === gateway) delete window.miaplacidusTest;
  };
}

function flatten(
  value: unknown,
  prefix = "",
  entries: [string, string][] = [],
): [string, string][] {
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, entries);
    }
  } else {
    entries.push([prefix, String(value)]);
  }
  return entries;
}

export function DebugTools(props: DebugToolsProps) {
  const { store, seed, readFrameMetrics } = props;
  const snapshot = useGameSnapshot(store);
  const [search, setSearch] = useState("");
  const [commandCount, setCommandCount] = useState(0);
  const t = (key: MessageKey) => translate(snapshot.locale, key);
  const values = flatten(store.getState()).filter(([path]) =>
    path.toLowerCase().includes(search.toLowerCase()),
  );

  function runScenario(scenario: ScenarioId): void {
    window.miaplacidusTest?.runScenario(scenario);
    setCommandCount(window.miaplacidusTest?.getCommandLog().length ?? 0);
  }

  function advanceClock(): void {
    window.miaplacidusTest?.advanceBy(10_000);
    setCommandCount(window.miaplacidusTest?.getCommandLog().length ?? 0);
  }

  return (
    <details className="debug-tools">
      <summary>{t("test.title")}</summary>
      <div className="debug-content">
        <dl className="debug-meta">
          <div>
            <dt>{t("test.seed")}</dt>
            <dd>{seed}</dd>
          </div>
          <div>
            <dt>{t("test.clock")}</dt>
            <dd>{Math.round(store.getState().run.clock.wallNowMs ?? 0)} ms</dd>
          </div>
          <div>
            <dt>{t("test.commands")}</dt>
            <dd>{commandCount}</dd>
          </div>
          <div>
            <dt>{t("test.fps")}</dt>
            <dd>{readFrameMetrics().framesPerSecond.toFixed(1)}</dd>
          </div>
        </dl>
        <div className="debug-actions">
          <button type="button" onClick={() => runScenario("compressor-ready")}>
            {t("test.ready")}
          </button>
          <button type="button" onClick={() => runScenario("storage-ready")}>
            {t("test.storageReady")}
          </button>
          <button type="button" onClick={advanceClock}>
            {t("test.advance")}
          </button>
        </div>
        <label className="debug-search">
          <span>{t("test.search")}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
        </label>
        <section className="debug-variables" aria-label={t("test.search")}>
          {values.slice(0, 50).map(([path, value]) => (
            <div className="debug-variable" key={path}>
              <code>{path}</code>
              <span>{value}</span>
            </div>
          ))}
          {values.length === 0 && <p>{t("test.search")}</p>}
        </section>
        <details className="debug-log">
          <summary>{t("test.commands")}</summary>
          <ol>
            {(window.miaplacidusTest?.getCommandLog() ?? []).map((entry, index) => (
              <li key={`${entry}-${index}`}>
                <code>{entry}</code>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </details>
  );
}
