import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from "react";
import { createStarCatalogue, GALAXY_SEED_DEFAULT } from "../content";
import { STAR_TYPE_IDS, type StarType } from "../content/starCatalogue";
import {
  createStarDataRows,
  filterStarDataRows,
  sortStarDataRows,
  antimatterRequiredForDistance,
  type StarDataSortDirection,
  type StarDataSortKey,
  type StarDataRow,
} from "../engine/starData";
import { createStarMapModel, searchStarCatalogue } from "../engine/starMap";
import { selectStarDestination, type StarDestinationSelection } from "../engine/starMapSelectors";
import { miaplacidusForceFieldLevel } from "../engine/megastructures";
import type { GameState } from "../engine/state";
import { starMapText } from "../i18n/starMapMessages";
import { starshipText } from "../i18n/starshipMessages";
import { CelestialIllustration } from "./CelestialIllustration";
import { PageArtworkRow } from "./PageArtworkRow";
import { economyGoodName } from "./economyDisplay";
import { formatNumber } from "./numberFormatting";
import type { CommandFailure } from "../engine/commands";
import type { GameStore } from "../engine/store";
import type { SystemId } from "../content/ids";
import { starshipTravelProgressFraction } from "../engine/spaceRules";
import { WeatherIcon } from "./TopStatusBar";
import { InfoTooltip } from "./InfoTooltip";

interface StarMapPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
  readonly view: "map" | "data";
  readonly onShowOnMap: () => void;
}

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 450;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const STAR_MAP_MODES = ["normal", "distance", "studied", "in-range"] as const;
type StarMapMode = (typeof STAR_MAP_MODES)[number];
const STAR_MAP_MODE_TEXT_KEYS: Readonly<
  Record<StarMapMode, "mapModeNormal" | "mapModeDistance" | "mapModeStudied" | "mapModeInRange">
> = {
  normal: "mapModeNormal",
  distance: "mapModeDistance",
  studied: "mapModeStudied",
  "in-range": "mapModeInRange",
};

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

function formatDistance(
  locale: GameState["settings"]["locale"],
  value: number,
  notation: GameState["settings"]["notation"],
): string {
  return `${formatNumber(locale, value, 2, notation)} ly`;
}

function destinationFailureText(
  locale: GameState["settings"]["locale"],
  failure: CommandFailure | undefined,
): string {
  return failure?.code === "space-starship-already-launched"
    ? starshipText(locale, "alreadyLaunched")
    : starMapText(locale, "destinationUnavailable");
}

interface StarDataTableProps {
  readonly locale: GameState["settings"]["locale"];
  readonly notation: GameState["settings"]["notation"];
  readonly rows: readonly StarDataRow[];
  readonly settledSystemIds: readonly string[];
  readonly onShowOnMap: (systemId: string) => void;
  readonly onSetDestination: (systemId: SystemId) => void;
  readonly selectDestination: (systemId: SystemId) => StarDestinationSelection;
  readonly destinationSystemId: string | null;
}

function StarDataTable({
  locale,
  notation,
  rows,
  settledSystemIds,
  onShowOnMap,
  onSetDestination,
  selectDestination,
  destinationSystemId,
}: StarDataTableProps) {
  const [query, setQuery] = useState("");
  const [starType, setStarType] = useState<StarType | "all">("all");
  const [sortBy, setSortBy] = useState<StarDataSortKey>("name");
  const [sortDirection, setSortDirection] = useState<StarDataSortDirection>("ascending");
  const filteredRows = useMemo(
    () => sortStarDataRows(filterStarDataRows(rows, query, starType), sortBy, sortDirection),
    [rows, query, starType, sortBy, sortDirection],
  );
  const settledSystemIdSet = useMemo(() => new Set(settledSystemIds), [settledSystemIds]);
  const displayedRows = useMemo(
    () => [
      ...filteredRows.filter((row) => !settledSystemIdSet.has(row.systemId)),
      ...filteredRows.filter((row) => settledSystemIdSet.has(row.systemId)),
    ],
    [filteredRows, settledSystemIdSet],
  );
  const number = (value: number) => formatNumber(locale, value, 0, notation);
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
          aria-label={starMapText(
            locale,
            sortDirection === "ascending" ? "sortDescending" : "sortAscending",
          )}
          aria-pressed={sortDirection === "descending"}
          onClick={() =>
            setSortDirection((direction) =>
              direction === "ascending" ? "descending" : "ascending",
            )
          }
        >
          {sortDirection === "ascending" ? "↑" : "↓"}
        </button>
      </div>
      {displayedRows.length === 0 ? (
        <p className="star-data-empty">{starMapText(locale, "noData")}</p>
      ) : (
        <>
          <p className="star-data-scroll-hint" data-testid="star-data-scroll-hint">
            {starMapText(locale, "tableScrollHint")}
          </p>
          <div
            className="star-data-table-scroll"
            role="region"
            aria-label={starMapText(locale, "dataView")}
            tabIndex={0}
          >
            <table className="star-data-table" data-testid="star-data-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="star-data-header-label">
                      {starMapText(locale, "sortName")}
                      <InfoTooltip
                        id="star-data-name-help"
                        label={`${starMapText(locale, "sortName")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
                        content={starMapText(locale, "starDataNameHelp")}
                        testId="star-data-name-help"
                      />
                    </span>
                  </th>
                  <th scope="col">{starMapText(locale, "distance")}</th>
                  <th scope="col">{starMapText(locale, "dataType")}</th>
                  <th scope="col">
                    <span className="star-data-header-label">
                      {starMapText(locale, "weather")}
                      <InfoTooltip
                        id="star-data-weather-help"
                        label={`${starMapText(locale, "weather")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
                        content={starMapText(locale, "starDataWeatherHelp")}
                        testId="star-data-weather-help"
                      />
                    </span>
                  </th>
                  <th scope="col">{starMapText(locale, "precipitation")}</th>
                  <th scope="col">{starMapText(locale, "fuel")}</th>
                  <th scope="col">
                    <span className="star-data-header-label">
                      {starMapText(locale, "ascendency")}
                      <InfoTooltip
                        id="star-data-ap-help"
                        label={`${starMapText(locale, "ascendency")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
                        content={starshipText(locale, "scanApHelp")}
                        testId="star-data-ap-help"
                      />
                    </span>
                  </th>
                  <th scope="col">{starMapText(locale, "mapColumn")}</th>
                  <th scope="col">{starshipText(locale, "setDestination")}</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => {
                  const destination = selectDestination(row.systemId);
                  const isSettled = settledSystemIdSet.has(row.systemId);
                  const failureText = destinationFailureText(locale, destination.failure);
                  const reasonId = `star-data-destination-reason-${row.systemId}`;
                  const weatherIcon = row.weatherType === "sunny" ? "clear" : row.weatherType;
                  const weatherLabel = `${starMapText(locale, row.weatherType)} ${number(row.weatherChance)}%`;
                  return (
                    <tr key={row.systemId} className={isSettled ? "is-settled" : undefined}>
                      <th scope="row">
                        {row.name}
                        {isSettled && (
                          <span
                            className="star-data-settled-marker"
                            data-testid={`star-data-settled-${row.systemId}`}
                          >
                            {` (${starMapText(locale, "settled")})`}
                          </span>
                        )}
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
                      <td>
                        {isSettled
                          ? starMapText(locale, "settled")
                          : formatDistance(locale, row.distanceLy, notation)}
                      </td>
                      <td>{row.starType}</td>
                      <td>
                        {!isSettled && (
                          <span
                            className="star-data-weather-display"
                            role="img"
                            aria-label={weatherLabel}
                            title={weatherLabel}
                            data-testid={`star-data-weather-${row.systemId}`}
                          >
                            <span className={`weather-symbol weather-symbol-${weatherIcon}`}>
                              <WeatherIcon weather={weatherIcon} />
                            </span>
                            <span>{number(row.weatherChance)}%</span>
                          </span>
                        )}
                      </td>
                      <td>{!isSettled && economyGoodName(locale, row.precipitationGoodId)}</td>
                      <td>
                        {isSettled
                          ? starMapText(locale, "settled")
                          : number(destination.route?.antimatterRequired ?? row.antimatterRequired)}
                      </td>
                      <td>
                        {!isSettled &&
                          number(destination.route?.ascendencyPoints ?? row.ascendencyPoints)}
                      </td>
                      <td>
                        <button
                          type="button"
                          aria-label={`${starMapText(locale, "mapTarget")}: ${row.name}`}
                          onClick={() => onShowOnMap(row.systemId)}
                        >
                          {starMapText(locale, "mapTarget")}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={!destination.enabled}
                          aria-pressed={destinationSystemId === row.systemId}
                          aria-label={`${starshipText(
                            locale,
                            destinationSystemId === row.systemId
                              ? "destinationSelected"
                              : "setDestination",
                          )}: ${row.name}`}
                          aria-describedby={!destination.enabled ? reasonId : undefined}
                          onClick={() => onSetDestination(row.systemId)}
                        >
                          {destinationSystemId === row.systemId
                            ? starshipText(locale, "destinationSelected")
                            : starshipText(locale, "setDestination")}
                        </button>
                        {!destination.enabled && (
                          <span className="control-reason" id={reasonId}>
                            {failureText}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function StarMapPane({ state, store, view, onShowOnMap }: StarMapPaneProps) {
  const focusMapAfterDataNavigation = useRef(false);
  const locale = state.settings.locale;
  const catalogue = useMemo(() => createStarCatalogue(GALAXY_SEED_DEFAULT), []);
  const hiddenFactoryIds = new Set(
    state.permanent.megastructures.ancientManuscripts
      .filter((record) => !record.reported)
      .map((record) => record.factorySystemId),
  );
  const forceFieldLevel = miaplacidusForceFieldLevel(state);
  const model = useMemo(
    () =>
      createStarMapModel(
        catalogue,
        state.run.space.currentSystemId,
        state.run.space.starStudyRange,
        forceFieldLevel,
      ),
    [catalogue, state.run.space.currentSystemId, state.run.space.starStudyRange, forceFieldLevel],
  );
  const currentNode = model.find((node) => node.current);
  const currentSystemIdentity = state.run.space.currentSystemId;
  const [selection, setSelection] = useState<{
    readonly origin: string;
    readonly id: string | null;
  }>(() => ({ origin: currentSystemIdentity, id: null }));
  const selectedId =
    selection.origin === currentSystemIdentity
      ? (selection.id ?? state.run.space.starship.destinationSystemId)
      : state.run.space.starship.destinationSystemId;
  const [query, setQuery] = useState("");
  const [mapMode, setMapMode] = useState<StarMapMode>("normal");
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
  const searchEnabled = mapMode === "normal" || mapMode === "distance";
  const showUnstudiedStars = searchEnabled;
  const studiedMapNodes = model.filter((node) => node.studied);
  const farthestStudiedDistance = Math.max(1, ...studiedMapNodes.map((node) => node.distanceLy));
  const isNodeShown = (node: (typeof model)[number]) =>
    node.visible && (showUnstudiedStars || node.studied);
  const dataRows = useMemo(
    () =>
      createStarDataRows(
        catalogue,
        state.run.space.systemProfiles,
        currentSystemIdentity,
        state.permanent.megastructures.ancientManuscripts,
      ),
    [
      catalogue,
      state.run.space.systemProfiles,
      state.permanent.megastructures.ancientManuscripts,
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
    if (hiddenFactoryIds.has(systemId)) {
      setSelectionFeedback(starMapText(locale, "unidentifiedUnavailable"));
      return;
    }
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

  function selectNodeAtPointer(
    event: ReactMouseEvent<HTMLButtonElement>,
    fallbackSystemId: SystemId,
  ): void {
    if (event.detail === 0) {
      selectNode(fallbackSystemId);
      return;
    }
    const overlay = event.currentTarget.closest(".star-map-marker-overlay");
    const markers = overlay?.querySelectorAll<HTMLButtonElement>(".star-map-hit-target") ?? [];
    let closestSystemId = fallbackSystemId;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const marker of markers) {
      const systemId = marker.dataset["systemId"] as SystemId | undefined;
      if (!systemId) continue;
      const bounds = marker.getBoundingClientRect();
      const deltaX = event.clientX - (bounds.left + bounds.width / 2);
      const deltaY = event.clientY - (bounds.top + bounds.height / 2);
      const distance = deltaX * deltaX + deltaY * deltaY;
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSystemId = systemId;
      }
    }
    selectNode(closestSystemId);
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

  function handleMapKeyDown(event: ReactKeyboardEvent<SVGSVGElement>): void {
    const horizontalStep = Math.max(24, viewWidth * 0.12);
    const verticalStep = Math.max(24, viewHeight * 0.12);
    const panByKey: Readonly<Record<string, PanState>> = {
      ArrowLeft: { x: -horizontalStep, y: 0 },
      ArrowRight: { x: horizontalStep, y: 0 },
      ArrowUp: { x: 0, y: -verticalStep },
      ArrowDown: { x: 0, y: verticalStep },
    };
    const delta = panByKey[event.key];
    if (!delta) return;
    event.preventDefault();
    setPan((previous) => ({ x: previous.x + delta.x, y: previous.y + delta.y }));
  }

  function resetView(): void {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function showOnMap(systemId: string): void {
    setSelection({ origin: currentSystemIdentity, id: systemId });
    setSelectionFeedback("");
    focusMapAfterDataNavigation.current = true;
    onShowOnMap();
  }

  function setDestination(systemId: SystemId): void {
    const result = store.dispatch({ type: "space.starship.destination.select", systemId });
    if (result.accepted) setSelection({ origin: currentSystemIdentity, id: systemId });
    setSelectionFeedback(
      result.accepted
        ? starshipText(locale, "destinationSelected")
        : destinationFailureText(locale, selectStarDestination(state, systemId).failure),
    );
  }

  function clearDestination(): void {
    store.dispatch({ type: "space.starship.destination.select", systemId: null });
    setSelectionFeedback("");
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
  const selectedTargetSelection = selectedTargetCommand
    ? selectStarDestination(state, selectedTargetCommand.systemId)
    : null;
  const selectedTargetAvailable = selectedTargetSelection?.enabled ?? false;
  const starship = state.run.space.starship;
  const travelProgress = starshipTravelProgressFraction(state);
  const travelDestinationNode = starship.destinationSystemId
    ? model.find((node) => node.id === starship.destinationSystemId && node.visible)
    : undefined;
  const isTravelling = starship.phase === "travelling";
  const isOrbitingDestination = starship.phase === "orbiting";
  const selectedRouteNode =
    !isTravelling && !isOrbitingDestination && selectedNode && !selectedNode.current
      ? selectedNode
      : undefined;
  const selectedRoute = selectedRouteNode
    ? selectStarDestination(state, selectedRouteNode.id).route
    : null;
  const selectedRouteAffordable =
    selectedRoute !== null && state.run.space.antimatter >= selectedRoute.antimatterRequired;
  const travelArrowX =
    currentNode && travelDestinationNode
      ? currentNode.x + (travelDestinationNode.x - currentNode.x) * travelProgress
      : 0;
  const travelArrowY =
    currentNode && travelDestinationNode
      ? currentNode.y + (travelDestinationNode.y - currentNode.y) * travelProgress
      : 0;
  const travelAngle =
    currentNode && travelDestinationNode
      ? (Math.atan2(
          travelDestinationNode.y - currentNode.y,
          travelDestinationNode.x - currentNode.x,
        ) *
          180) /
        Math.PI
      : 0;
  const orbitRadius = travelDestinationNode
    ? Math.max(2.5, travelDestinationNode.size * 1.1) * 3
    : 0;
  const orbitArrowX = travelDestinationNode
    ? travelDestinationNode.x + orbitRadius * Math.cos(Math.PI / 4)
    : 0;
  const orbitArrowY = travelDestinationNode
    ? travelDestinationNode.y + orbitRadius * Math.sin(Math.PI / 4)
    : 0;

  useEffect(() => {
    if (view !== "map" || !focusMapAfterDataNavigation.current) return;
    focusMapAfterDataNavigation.current = false;
    document.getElementById("panel-interstellar-star-map")?.focus();
  }, [view]);

  return (
    <div className="star-map-panel">
      <section
        id="panel-interstellar-star-map"
        className="subpane-panel"
        role="tabpanel"
        aria-labelledby="tab-interstellar-star-map"
        tabIndex={0}
        data-testid="star-map-pane"
        hidden={view !== "map"}
      >
        <header className="pane-heading">
          <div>
            <div className="space-mining-title-row">
              <h2 className="game-page-title">{starMapText(locale, "title")}</h2>
              <InfoTooltip
                id="star-map-page-help"
                label={`${starMapText(locale, "title")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
                content={starMapText(locale, "mapHeaderHelp")}
                testId="star-map-page-help"
              />
            </div>
            <p className="pane-intro">{starMapText(locale, "description")}</p>
          </div>
          <p className="star-map-range">
            {starMapText(locale, "studyRange")}: <strong>{state.run.space.starStudyRange}</strong>{" "}
            ly
          </p>
        </header>

        <PageArtworkRow>
          <CelestialIllustration kind="star-system" />
        </PageArtworkRow>

        <div className="star-map-toolbar">
          <div
            className="star-map-mode-controls"
            role="group"
            aria-label={starMapText(locale, "mapModesLabel")}
          >
            {STAR_MAP_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`star-map-mode-button${mapMode === mode ? " green-ready-text" : ""}`}
                aria-pressed={mapMode === mode}
                onClick={() => {
                  setMapMode(mode);
                  if (mode === "studied" || mode === "in-range") setQuery("");
                }}
              >
                {starMapText(locale, STAR_MAP_MODE_TEXT_KEYS[mode])}
              </button>
            ))}
            <InfoTooltip
              id="star-map-modes-help"
              label={`${starMapText(locale, "mapModesLabel")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={starMapText(locale, "mapModesHelp")}
              testId="star-map-modes-help"
            />
          </div>
          <label htmlFor="star-map-search">{starMapText(locale, "searchLabel")}</label>
          <input
            id="star-map-search"
            type="search"
            autoComplete="off"
            disabled={!searchEnabled}
            placeholder={starMapText(
              locale,
              searchEnabled ? "searchPlaceholder" : "searchUnavailableInMode",
            )}
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
                    <button
                      type="button"
                      aria-disabled={node ? !node.selectable : undefined}
                      aria-describedby={
                        node && !node.selectable ? `star-map-search-reason-${star.id}` : undefined
                      }
                      onClick={() => selectNode(star.id)}
                    >
                      {star.name}
                    </button>
                    {node && !node.selectable && (
                      <span
                        className="star-map-result-state"
                        id={`star-map-search-reason-${star.id}`}
                      >
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
          <p id="star-map-keyboard-help" className="sr-only">
            {starMapText(locale, "keyboardHelp")}
          </p>
          <div className="star-map-viewport">
            <svg
              ref={svgRef}
              className="star-map-canvas"
              role="group"
              tabIndex={0}
              data-testid="star-map-canvas"
              data-zoom={zoom}
              viewBox={viewBox}
              preserveAspectRatio="none"
              aria-label={starMapText(locale, "title")}
              aria-describedby="star-map-keyboard-help"
              onKeyDown={handleMapKeyDown}
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
              <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="var(--bg-color)" />
              <ellipse cx="590" cy="220" rx="520" ry="245" fill="url(#star-map-nebula)" />
              {isTravelling && currentNode && travelDestinationNode && (
                <g
                  data-testid="starship-route-travel"
                  data-travel-progress={travelProgress}
                  aria-hidden="true"
                >
                  <line
                    className="star-map-travel-line"
                    x1={currentNode.x}
                    y1={currentNode.y}
                    x2={travelDestinationNode.x}
                    y2={travelDestinationNode.y}
                  />
                  <path
                    className="star-map-travel-arrow"
                    data-testid="starship-route-ship-marker"
                    d="M -8 -5 L 8 0 L -8 5 Z"
                    transform={`translate(${travelArrowX} ${travelArrowY}) rotate(${travelAngle})`}
                  />
                </g>
              )}
              {isOrbitingDestination && travelDestinationNode && (
                <g data-testid="starship-route-orbit" aria-hidden="true">
                  <circle
                    className="star-map-orbit-ring"
                    cx={travelDestinationNode.x}
                    cy={travelDestinationNode.y}
                    r={orbitRadius}
                  />
                  <path
                    className="star-map-orbit-arrow"
                    data-testid="starship-route-orbit-arrow"
                    d="M -8 -5 L 8 0 L -8 5 Z"
                    transform={`translate(${orbitArrowX} ${orbitArrowY}) rotate(135)`}
                  />
                </g>
              )}
              {!isTravelling &&
                !isOrbitingDestination &&
                currentNode &&
                selectedRouteNode &&
                selectedRoute && (
                  <g
                    className={`star-map-selected-route ${selectedRouteAffordable ? "green-ready-text" : "red-disabled-text"}`}
                    data-testid="star-map-selected-route"
                    data-affordable={selectedRouteAffordable}
                    aria-hidden="true"
                  >
                    <line
                      className="star-map-selected-route-line"
                      x1={currentNode.x}
                      y1={currentNode.y}
                      x2={selectedRouteNode.x}
                      y2={selectedRouteNode.y}
                    />
                    <rect
                      className="star-map-selected-route-label-backdrop"
                      x={(currentNode.x + selectedRouteNode.x) / 2 - 112}
                      y={(currentNode.y + selectedRouteNode.y) / 2 - 24}
                      width="224"
                      height="42"
                      rx="5"
                    />
                    <text
                      className="star-map-selected-route-label"
                      data-testid="star-map-selected-route-label"
                      x={(currentNode.x + selectedRouteNode.x) / 2}
                      y={(currentNode.y + selectedRouteNode.y) / 2 - 8}
                      textAnchor="middle"
                    >
                      <tspan>
                        {starMapText(locale, "distance")}:{" "}
                        {formatDistance(locale, selectedRoute.distanceLy, state.settings.notation)}
                      </tspan>
                      <tspan x={(currentNode.x + selectedRouteNode.x) / 2} dy="16">
                        {starMapText(locale, "antimatterRequired")}:{" "}
                        {formatNumber(
                          locale,
                          selectedRoute.antimatterRequired,
                          0,
                          state.settings.notation,
                        )}
                      </tspan>
                    </text>
                  </g>
                )}
              {model.map((node) => {
                if (!node.visible) {
                  if (!showUnstudiedStars) return null;
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
                if (!isNodeShown(node)) return null;
                const selected = node.id === selectedNode?.id;
                const settled = state.permanent.settledSystemIds.includes(node.id);
                const undisclosedFactory = hiddenFactoryIds.has(node.id);
                const isHome = node.name === "Miaplacidus";
                const separateStatusStyle = node.current || settled || isHome;
                const distanceShare =
                  mapMode === "distance" && node.studied && !separateStatusStyle
                    ? Math.round((node.distanceLy / farthestStudiedDistance) * 100)
                    : null;
                // This matches the distance-based cost returned in the engine's route preview.
                const inRangeFuel =
                  mapMode === "in-range" && node.studied && !separateStatusStyle
                    ? antimatterRequiredForDistance(node.distanceLy)
                    : null;
                const isOrbitingDestination =
                  mapMode === "in-range" &&
                  state.run.space.starship.phase === "orbiting" &&
                  state.run.space.starship.destinationSystemId === node.id;
                const outOfRange =
                  inRangeFuel !== null &&
                  !isOrbitingDestination &&
                  state.run.space.antimatter < inRangeFuel;
                return (
                  <g
                    key={node.id}
                    className={`star-map-marker${node.current ? " is-current" : ""}${isHome ? " is-home" : ""}${settled ? " is-settled" : ""}${selected ? " is-selected" : ""}${!node.studied ? " is-locked" : ""}${distanceShare !== null ? " is-distance-coded" : ""}${inRangeFuel !== null ? " is-in-range-coded" : ""}${outOfRange ? " is-out-of-range" : ""}${isOrbitingDestination ? " is-in-range-destination" : ""}`}
                    data-settled={settled}
                    style={
                      distanceShare === null
                        ? undefined
                        : ({ "--star-distance-share": `${distanceShare}%` } as CSSProperties)
                    }
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
              {model.filter(isNodeShown).map((node) => {
                const undisclosedFactory = hiddenFactoryIds.has(node.id);
                const markerUnavailableReason = undisclosedFactory
                  ? starMapText(locale, "unidentifiedUnavailable")
                  : node.name === "Miaplacidus"
                    ? starMapText(locale, "homeLocked")
                    : starMapText(locale, "studyFarther");
                const markerDisabled = !node.selectable || undisclosedFactory;
                const markerReasonId = `star-map-marker-reason-${node.id}`;
                return (
                  <span key={node.id}>
                    <button
                      type="button"
                      className="star-map-hit-target"
                      data-testid={`star-marker-${node.id}`}
                      data-system-id={node.id}
                      data-distance-ly={node.distanceLy}
                      style={{
                        left: `${((node.x - viewX) / viewWidth) * 100}%`,
                        top: `${((node.y - viewY) / viewHeight) * 100}%`,
                      }}
                      aria-label={`${undisclosedFactory ? starMapText(locale, "unidentifiedStar") : node.name}, ${starMapText(locale, "starType")} ${node.starType}, ${formatDistance(locale, node.distanceLy, state.settings.notation)}`}
                      aria-disabled={markerDisabled}
                      aria-describedby={markerDisabled ? markerReasonId : undefined}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => selectNodeAtPointer(event, node.id)}
                    />
                    {markerDisabled && (
                      <span id={markerReasonId} className="sr-only">
                        {markerUnavailableReason}
                      </span>
                    )}
                  </span>
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
                <CelestialIllustration kind="star-system" className="star-system-mark" />
                <dl>
                  <div>
                    <dt>{starMapText(locale, "starType")}</dt>
                    <dd>{selectedNode.starType}</dd>
                  </div>
                  <div>
                    <dt>{starMapText(locale, "distance")}</dt>
                    <dd data-testid="star-distance">
                      {formatDistance(locale, selectedNode.distanceLy, state.settings.notation)}
                    </dd>
                  </div>
                  {selectedTargetSelection?.route && (
                    <>
                      <div>
                        <dt>{starMapText(locale, "antimatterRequired")}</dt>
                        <dd data-testid="star-route-antimatter">
                          {formatNumber(
                            locale,
                            selectedTargetSelection.route.antimatterRequired,
                            0,
                            state.settings.notation,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>{starMapText(locale, "potentialAp")}</dt>
                        <dd data-testid="star-route-ap">
                          {selectedTargetSelection.route.ascendencyPoints === null
                            ? "—"
                            : formatNumber(
                                locale,
                                selectedTargetSelection.route.ascendencyPoints,
                                0,
                                state.settings.notation,
                              )}
                        </dd>
                      </div>
                    </>
                  )}
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
                aria-describedby={
                  !selectedTargetAvailable ? "star-map-destination-reason" : undefined
                }
                aria-label={`${starshipText(
                  locale,
                  destinationSystemId === selectedTargetCommand.systemId
                    ? "destinationSelected"
                    : "setDestination",
                )}: ${selectedNode?.name ?? ""}`}
                onClick={() => setDestination(selectedTargetCommand.systemId)}
              >
                {destinationSystemId === selectedTargetCommand.systemId
                  ? starshipText(locale, "destinationSelected")
                  : starshipText(locale, "setDestination")}
              </button>
            )}
            {selectedTargetCommand && !selectedTargetAvailable && (
              <p className="control-reason" id="star-map-destination-reason">
                {destinationFailureText(locale, selectedTargetSelection?.failure)}
              </p>
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
      </section>
      <section
        id="panel-interstellar-star-data"
        className="subpane-panel"
        role="tabpanel"
        aria-labelledby="tab-interstellar-star-data"
        tabIndex={0}
        hidden={view !== "data"}
      >
        <header className="pane-heading">
          <div>
            <div className="space-mining-title-row">
              <h2 className="game-page-title">{starMapText(locale, "dataView")}</h2>
              <InfoTooltip
                id="star-data-page-help"
                label={`${starMapText(locale, "dataView")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
                content={starMapText(locale, "dataHeaderHelp")}
                testId="star-data-page-help"
              />
            </div>
            <p className="pane-intro">{starMapText(locale, "starDataDescription")}</p>
          </div>
        </header>
        <PageArtworkRow>
          <CelestialIllustration kind="star-system" />
        </PageArtworkRow>
        <StarDataTable
          locale={locale}
          notation={state.settings.notation}
          rows={dataRows}
          settledSystemIds={state.permanent.settledSystemIds}
          onShowOnMap={showOnMap}
          onSetDestination={setDestination}
          selectDestination={(systemId) => selectStarDestination(state, systemId)}
          destinationSystemId={destinationSystemId}
        />
      </section>
    </div>
  );
}
