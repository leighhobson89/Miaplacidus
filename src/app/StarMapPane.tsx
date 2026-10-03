import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createStarCatalogue, GALAXY_SEED_DEFAULT } from "../content";
import { STAR_TYPE_IDS, type StarType } from "../content/starCatalogue";
import {
  createStarDataRows,
  filterStarDataRows,
  sortStarDataRows,
  type StarDataSortDirection,
  type StarDataSortKey,
  type StarDataRow,
} from "../engine/starData";
import { createStarMapModel, searchStarCatalogue } from "../engine/starMap";
import type { GameState } from "../engine/state";
import { starMapText } from "../i18n/starMapMessages";
import { starshipText } from "../i18n/starshipMessages";
import { economyGoodName } from "./EconomyPanes";
import { checkPreconditions } from "../engine/commands";
import type { GameStore } from "../engine/store";
import type { SystemId } from "../content/ids";

interface StarMapPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 450;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

interface PanState {
  readonly x: number;
  readonly y: number;
}

interface DragState {
  readonly pointerId: number;
  readonly clientX: number;
  readonly clientY: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatDistance(locale: GameState["settings"]["locale"], value: number): string {
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ly`;
}

interface StarDataTableProps {
  readonly locale: GameState["settings"]["locale"];
  readonly rows: readonly StarDataRow[];
  readonly onShowOnMap: (systemId: string) => void;
  readonly onSetDestination: (systemId: SystemId) => void;
  readonly destinationSystemId: string | null;
  readonly canChangeDestination: boolean;
  readonly isDestinationSelectable: (systemId: SystemId) => boolean;
}

function StarDataTable({
  locale,
  rows,
  onShowOnMap,
  onSetDestination,
  destinationSystemId,
  canChangeDestination,
  isDestinationSelectable,
}: StarDataTableProps) {
  const [query, setQuery] = useState("");
  const [starType, setStarType] = useState<StarType | "all">("all");
  const [sortBy, setSortBy] = useState<StarDataSortKey>("name");
  const [sortDirection, setSortDirection] = useState<StarDataSortDirection>("ascending");
  const filteredRows = useMemo(
    () => sortStarDataRows(filterStarDataRows(rows, query, starType), sortBy, sortDirection),
    [rows, query, starType, sortBy, sortDirection],
  );
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const sortLabels: Readonly<Record<StarDataSortKey, string>> = {
    name: starMapText(locale, "sortName"),
    distance: starMapText(locale, "sortDistance"),
    type: starMapText(locale, "sortType"),
    weather: starMapText(locale, "sortWeather"),
    precipitation: starMapText(locale, "sortPrecipitation"),
    fuel: starMapText(locale, "sortFuel"),
    ascendency: starMapText(locale, "sortAscendency"),
  };

  return (
    <div className="star-data-view" data-testid="star-data-view">
      <div className="star-data-toolbar">
        <label>
          <span>{starMapText(locale, "filterName")}</span>
          <input
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </label>
        <label>
          <span>{starMapText(locale, "filterType")}</span>
          <select
            value={starType}
            onChange={(event) => setStarType(event.currentTarget.value as StarType | "all")}
          >
            <option value="all">{starMapText(locale, "allTypes")}</option>
            {STAR_TYPE_IDS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{starMapText(locale, "sortBy")}</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.currentTarget.value as StarDataSortKey)}
          >
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="star-data-reverse"
          aria-label={starMapText(locale, "reverseSort")}
          onClick={() =>
            setSortDirection((direction) =>
              direction === "ascending" ? "descending" : "ascending",
            )
          }
        >
          {sortDirection === "ascending" ? "↑" : "↓"}
        </button>
      </div>
      {filteredRows.length === 0 ? (
        <p className="star-data-empty">{starMapText(locale, "noData")}</p>
      ) : (
        <div className="star-data-table-scroll">
          <table className="star-data-table" data-testid="star-data-table">
            <thead>
              <tr>
                <th scope="col">{starMapText(locale, "sortName")}</th>
                <th scope="col">{starMapText(locale, "distance")}</th>
                <th scope="col">{starMapText(locale, "starType")}</th>
                <th scope="col">{starMapText(locale, "weather")}</th>
                <th scope="col">{starMapText(locale, "precipitation")}</th>
                <th scope="col">{starMapText(locale, "fuel")}</th>
                <th scope="col">{starMapText(locale, "ascendency")}</th>
                <th scope="col">{starMapText(locale, "mapTarget")}</th>
                <th scope="col">{starshipText(locale, "setDestination")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.systemId}>
                  <th scope="row">
                    {row.name}
                    {row.revealedFactory && (
                      <span
                        className="star-data-factory-marker"
                        data-testid={`factory-system-${row.systemId}`}
                        aria-label={starMapText(locale, "factorySystem")}
                        title={starMapText(locale, "factorySystem")}
                      >
                        {" "}
                        &#9881;
                      </span>
                    )}
                  </th>
                  <td>{formatDistance(locale, row.distanceLy)}</td>
                  <td>{row.starType}</td>
                  <td>
                    {starMapText(locale, row.weatherType)} {number.format(row.weatherChance)}%
                  </td>
                  <td>{economyGoodName(locale, row.precipitationGoodId)}</td>
                  <td>{number.format(row.antimatterRequired)}</td>
                  <td>{number.format(row.ascendencyPoints)}</td>
                  <td>
                    <button type="button" onClick={() => onShowOnMap(row.systemId)}>
                      {starMapText(locale, "mapTarget")}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={!canChangeDestination || !isDestinationSelectable(row.systemId)}
                      aria-pressed={destinationSystemId === row.systemId}
                      onClick={() => onSetDestination(row.systemId)}
                    >
                      {destinationSystemId === row.systemId
                        ? starshipText(locale, "destinationSelected")
                        : starshipText(locale, "setDestination")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function StarMapPane({ state, store }: StarMapPaneProps) {
  const locale = state.settings.locale;
  const catalogue = useMemo(() => createStarCatalogue(GALAXY_SEED_DEFAULT), []);
  const hiddenFactoryIds = new Set(
    state.run.space.ancientManuscripts
      .filter((record) => !record.reported)
      .map((record) => record.factorySystemId),
  );
  const model = useMemo(
    () =>
      createStarMapModel(
        catalogue,
        state.run.space.currentSystemId,
        state.run.space.starStudyRange,
      ),
    [catalogue, state.run.space.currentSystemId, state.run.space.starStudyRange],
  );
  const currentNode = model.find((node) => node.current);
  const currentSystemIdentity = state.run.space.currentSystemId;
  const [view, setView] = useState<"map" | "data">("map");
  const [selection, setSelection] = useState<{
    readonly origin: string;
    readonly id: string | null;
  }>(() => ({ origin: currentSystemIdentity, id: null }));
  const selectedId =
    selection.origin === currentSystemIdentity
      ? (selection.id ?? state.run.space.starship.destinationSystemId)
      : state.run.space.starship.destinationSystemId;
  const [query, setQuery] = useState("");
  const [selectionFeedback, setSelectionFeedback] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const selectedNode =
    model.find(
      (node) => node.id === selectedId && node.selectable && !hiddenFactoryIds.has(node.id),
    ) ?? currentNode;
  const matches = searchStarCatalogue(catalogue, query).filter(
    (star) => !hiddenFactoryIds.has(star.id),
  );
  const dataRows = useMemo(
    () =>
      createStarDataRows(
        catalogue,
        state.run.space.systemProfiles,
        currentSystemIdentity,
        state.run.space.ancientManuscripts,
      ),
    [
      catalogue,
      state.run.space.systemProfiles,
      state.run.space.ancientManuscripts,
      currentSystemIdentity,
    ],
  );
  const normalizedQuery = query.trim();
  const searchStatus =
    normalizedQuery.length === 0
      ? ""
      : normalizedQuery.length < 2
        ? starMapText(locale, "searchTooShort")
        : matches.length === 0
          ? starMapText(locale, "noMatches")
          : "";

  const viewWidth = MAP_WIDTH / zoom;
  const viewHeight = MAP_HEIGHT / zoom;
  const viewX = clamp((MAP_WIDTH - viewWidth) / 2 + pan.x, 0, MAP_WIDTH - viewWidth);
  const viewY = clamp((MAP_HEIGHT - viewHeight) / 2 + pan.y, 0, MAP_HEIGHT - viewHeight);
  const viewBox = `${viewX} ${viewY} ${viewWidth} ${viewHeight}`;

  function selectNode(systemId: SystemId): void {
    if (hiddenFactoryIds.has(systemId)) return;
    const node = model.find((entry) => entry.id === systemId);
    if (!node) return;
    if (!node.selectable) {
      setSelectionFeedback(
        node.name === "Miaplacidus"
          ? starMapText(locale, "homeLocked")
          : starMapText(locale, "studyFarther"),
      );
      return;
    }
    setSelection({ origin: currentSystemIdentity, id: node.id });
    setSelectionFeedback("");
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>): void {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>): void {
    const drag = dragRef.current;
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!drag || drag.pointerId !== event.pointerId || !bounds) return;
    const deltaX = ((event.clientX - drag.clientX) * viewWidth) / bounds.width;
    const deltaY = ((event.clientY - drag.clientY) * viewHeight) / bounds.height;
    setPan((previous) => ({ x: previous.x - deltaX, y: previous.y - deltaY }));
    dragRef.current = { ...drag, clientX: event.clientX, clientY: event.clientY };
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>): void {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function resetView(): void {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function showOnMap(systemId: string): void {
    setSelection({ origin: currentSystemIdentity, id: systemId });
    setSelectionFeedback("");
    setView("map");
  }

  function setDestination(systemId: SystemId): void {
    const result = store.dispatch({ type: "space.starship.destination.select", systemId });
    if (result.accepted) setSelection({ origin: currentSystemIdentity, id: systemId });
    setSelectionFeedback(
      result.accepted
        ? starshipText(locale, "destinationSelected")
        : starshipText(locale, "noDestination"),
    );
  }

  function clearDestination(): void {
    store.dispatch({ type: "space.starship.destination.select", systemId: null });
    setSelectionFeedback("");
  }

  function isDestinationSelectable(systemId: SystemId): boolean {
    if (hiddenFactoryIds.has(systemId)) return false;
    return checkPreconditions(state, {
      type: "space.starship.destination.select",
      systemId,
    }).ok;
  }

  const destinationSystemId = state.run.space.starship.destinationSystemId;
  const canChangeDestination = state.run.space.starship.phase === "unlaunched";
  const selectedTargetCommand =
    selectedNode && !selectedNode.current
      ? ({
          type: "space.starship.destination.select",
          systemId: selectedNode.id,
        } as const)
      : null;
  const selectedTargetAvailable =
    selectedTargetCommand !== null && checkPreconditions(state, selectedTargetCommand).ok;

  return (
    <div className="star-map-panel" data-testid="star-map-pane">
      <header className="pane-heading">
        <div>
          <p className="eyebrow">05 / {starMapText(locale, "title")}</p>
          <h2>{starMapText(locale, "title")}</h2>
          <p className="pane-intro">{starMapText(locale, "description")}</p>
        </div>
        <p className="star-map-range">
          {starMapText(locale, "studyRange")}: <strong>{state.run.space.starStudyRange}</strong> ly
        </p>
      </header>

      <div
        className="star-map-view-switch"
        role="tablist"
        aria-label={starMapText(locale, "title")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "map"}
          onClick={() => setView("map")}
        >
          {starMapText(locale, "mapView")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "data"}
          onClick={() => setView("data")}
        >
          {starMapText(locale, "dataView")}
        </button>
      </div>

      {view === "data" ? (
        <StarDataTable
          locale={locale}
          rows={dataRows}
          onShowOnMap={showOnMap}
          onSetDestination={setDestination}
          destinationSystemId={destinationSystemId}
          canChangeDestination={canChangeDestination}
          isDestinationSelectable={isDestinationSelectable}
        />
      ) : (
        <>
          <div className="star-map-toolbar">
            <label htmlFor="star-map-search">{starMapText(locale, "searchLabel")}</label>
            <input
              id="star-map-search"
              type="search"
              autoComplete="off"
              placeholder={starMapText(locale, "searchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
            {searchStatus && (
              <output className="star-map-search-status" aria-live="polite">
                {searchStatus}
              </output>
            )}
            {normalizedQuery.length >= 2 && matches.length > 0 && (
              <ul className="star-map-search-results">
                {matches.map((star) => {
                  const node = model.find((entry) => entry.id === star.id);
                  return (
                    <li key={star.id}>
                      <button type="button" onClick={() => selectNode(star.id)}>
                        {star.name}
                      </button>
                      {node && !node.selectable && (
                        <span className="star-map-result-state">
                          {star.name === "Miaplacidus"
                            ? starMapText(locale, "homeLocked")
                            : starMapText(locale, "studyFarther")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="star-map-layout">
            <div className="star-map-viewport">
              <svg
                ref={svgRef}
                className="star-map-canvas"
                data-testid="star-map-canvas"
                data-zoom={zoom}
                viewBox={viewBox}
                preserveAspectRatio="none"
                aria-label={starMapText(locale, "title")}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <defs>
                  <radialGradient id="star-map-nebula">
                    <stop offset="0" stopColor="#16365b" stopOpacity="0.7" />
                    <stop offset="1" stopColor="#07101c" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <title>{starMapText(locale, "title")}</title>
                <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="#07101c" />
                <ellipse cx="590" cy="220" rx="520" ry="245" fill="url(#star-map-nebula)" />
                {model.map((node) => {
                  if (!node.visible) {
                    return (
                      <circle
                        key={node.id}
                        className="star-map-unseen-dot"
                        cx={node.x}
                        cy={node.y}
                        r="1.5"
                        aria-hidden="true"
                      />
                    );
                  }
                  const selected = node.id === selectedNode?.id;
                  const settled = state.permanent.settledSystemIds.includes(node.id);
                  const undisclosedFactory = hiddenFactoryIds.has(node.id);
                  return (
                    <g
                      key={node.id}
                      className={`star-map-marker${node.current ? " is-current" : ""}${node.name === "Miaplacidus" ? " is-home" : ""}${settled ? " is-settled" : ""}${selected ? " is-selected" : ""}${!node.studied ? " is-locked" : ""}`}
                      data-settled={settled}
                    >
                      {selected && (
                        <circle
                          className="star-map-selection-ring"
                          cx={node.x}
                          cy={node.y}
                          r={node.size * 4}
                        />
                      )}
                      <circle
                        className="star-map-star"
                        cx={node.x}
                        cy={node.y}
                        r={Math.max(2.5, node.size * 1.1)}
                      />
                      {!undisclosedFactory && (
                        <text className="star-map-label" x={node.x + 8} y={node.y - 7}>
                          {node.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="star-map-marker-overlay">
                {model
                  .filter((node) => node.visible)
                  .map((node) => {
                    const undisclosedFactory = hiddenFactoryIds.has(node.id);
                    return (
                      <button
                        key={node.id}
                        type="button"
                        className="star-map-hit-target"
                        data-testid={`star-marker-${node.id}`}
                        data-system-id={node.id}
                        data-distance-ly={node.distanceLy}
                        style={{
                          left: `${((node.x - viewX) / viewWidth) * 100}%`,
                          top: `${((node.y - viewY) / viewHeight) * 100}%`,
                        }}
                        aria-label={`${undisclosedFactory ? starMapText(locale, "unidentifiedStar") : node.name}, ${starMapText(locale, "starType")} ${node.starType}, ${formatDistance(locale, node.distanceLy)}`}
                        aria-disabled={!node.selectable || undisclosedFactory}
                        disabled={!node.selectable || undisclosedFactory}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => selectNode(node.id)}
                      />
                    );
                  })}
              </div>
              <div className="star-map-zoom-controls" aria-label={starMapText(locale, "title")}>
                <button
                  type="button"
                  aria-label={starMapText(locale, "zoomIn")}
                  onClick={() => setZoom((value) => clamp(value * 1.25, MIN_ZOOM, MAX_ZOOM))}
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label={starMapText(locale, "zoomOut")}
                  onClick={() => setZoom((value) => clamp(value / 1.25, MIN_ZOOM, MAX_ZOOM))}
                >
                  −
                </button>
                <button
                  type="button"
                  aria-label={starMapText(locale, "resetView")}
                  onClick={resetView}
                >
                  ↺
                </button>
              </div>
            </div>

            <aside className="star-map-selection" data-testid="star-selection" aria-live="polite">
              <p className="eyebrow">{starMapText(locale, "selected")}</p>
              {selectedNode ? (
                <>
                  <h3>{selectedNode.name}</h3>
                  <dl>
                    <div>
                      <dt>{starMapText(locale, "starType")}</dt>
                      <dd>{selectedNode.starType}</dd>
                    </div>
                    <div>
                      <dt>{starMapText(locale, "distance")}</dt>
                      <dd data-testid="star-distance">
                        {formatDistance(locale, selectedNode.distanceLy)}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p>{starMapText(locale, "studyFarther")}</p>
              )}
              {selectionFeedback && (
                <output className="star-map-selection-feedback" aria-live="polite">
                  {selectionFeedback}
                </output>
              )}
              {selectedTargetCommand && (
                <button
                  type="button"
                  disabled={!selectedTargetAvailable}
                  aria-pressed={destinationSystemId === selectedTargetCommand.systemId}
                  onClick={() => setDestination(selectedTargetCommand.systemId)}
                >
                  {destinationSystemId === selectedTargetCommand.systemId
                    ? starshipText(locale, "destinationSelected")
                    : starshipText(locale, "setDestination")}
                </button>
              )}
              {destinationSystemId && canChangeDestination && (
                <button type="button" onClick={clearDestination}>
                  {starshipText(locale, "clearDestination")}
                </button>
              )}
              <ul className="star-map-legend">
                <li>
                  <span className="legend-current" />
                  {starMapText(locale, "current")}
                </li>
                <li>
                  <span className="legend-studied" />
                  {starMapText(locale, "studied")}
                </li>
                <li>
                  <span className="legend-uncharted" />
                  {starMapText(locale, "uncharted")}
                </li>
              </ul>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
