import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre.css";
import "@stadiamaps/maplibre-search-box/dist/maplibre-search-box.css";

import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box";
import { useQuery } from "@tanstack/react-query";
import type * as GeoJSON from "geojson";
import maplibregl, { GlobeControl } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StationMapAttributes } from "../../types/types_maplibre.ts";
import { fetchVisibleStations } from "../../utils/stationApi.ts";

import filtreIcon from "../../assets/images/topbar/filtre.svg";
import { useFilters } from "../../contexts/FilterContext.tsx";

function logInvalidStations(stations: StationMapAttributes[], source: string) {
  const invalidStations = stations.filter((station) => !station.geojson_geom);
  if (invalidStations.length > 0) {
    console.warn(
      `[Validation - ${source}] ${invalidStations.length} station(s) reçue(s) sans géométrie:`,
      invalidStations,
    );
  }
}

function MapLibre() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const bottomRightControlsRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const { filters, hasActiveFilters } = useFilters();

  const [bbox, setBbox] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(14);

  const setCursorToPointer = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "pointer";
    }
  }, []);

  const resetCursor = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "";
    }
  }, []);

  const { data: stationsData, isLoading } = useQuery<StationMapAttributes[]>({
    queryKey: ["stations", "visible", bbox, filters, zoom],
    queryFn: () => {
      if (!bbox) {
        return Promise.reject(new Error("Bbox is required to fetch stations."));
      }
      return fetchVisibleStations(bbox, filters, zoom);
    },
    enabled: !!bbox,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!stationsData || !mapRef.current) return;

    const source = mapRef.current.getSource(
      "stations",
    ) as maplibregl.GeoJSONSource;
    if (!source) return;

    logInvalidStations(stationsData, "ReactQueryUpdate");

    const features = stationsData
      .map((station) => {
        if (!station.geojson_geom) return null;
        try {
          const geometry = JSON.parse(
            station.geojson_geom as unknown as string,
          );
          if (
            geometry?.type === "Point" &&
            Array.isArray(geometry.coordinates)
          ) {
            return { type: "Feature", properties: station, geometry };
          }
          return null;
        } catch (e) {
          console.warn(
            "Impossible de parser geojson_geom pour la station:",
            station.id,
          );
          return null;
        }
      })
      .filter(Boolean);

    const geoJsonData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: features as GeoJSON.Feature[],
    };

    source.setData(geoJsonData);
  }, [stationsData]);

  useEffect(() => {
    if (mapRef.current) return;
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [1.444, 43.6045],
      zoom: 14,
      attributionControl: false,
    });
    mapRef.current = map;

    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    const globeControl = new GlobeControl();

    if (bottomRightControlsRef.current) {
      const geolocateElement = geolocateControl.onAdd(map);
      const globeElement = globeControl.onAdd(map);

      bottomRightControlsRef.current.appendChild(geolocateElement);
      bottomRightControlsRef.current.appendChild(globeElement);
    }

    map.addControl(new MapLibreSearchControl({}), "top-left");

    map.on("load", () => {
      map.addSource("stations", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "cluster-circles",
        type: "circle",
        source: "stations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "point_count"],
            10,
            "#F2D5B5",
            100,
            "#F2C641",
            300,
            "#f29f41",
            750,
            "#A62100",
          ],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "point_count"],
            10,
            15,
            100,
            25,
            300,
            30,
            750,
            35,
          ],
          "circle-opacity-transition": { duration: 300 },
        },
      } as maplibregl.CircleLayerSpecification);

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "stations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold"],
          "text-size": 14,
        },
        paint: {
          "text-color": "#ffffff",
          "text-opacity-transition": { duration: 300 },
        },
      } as maplibregl.SymbolLayerSpecification);

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "stations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#a62100",
          "circle-radius": 8,
          "circle-opacity-transition": { duration: 300 },
        },
      } as maplibregl.CircleLayerSpecification);

      const bounds = map.getBounds();
      setBbox(
        [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ].join(","),
      );
      setZoom(map.getZoom());
    });

    map.on("click", "unclustered-point", (e) => {
      if (!e.features?.length) return;
      const stationId = e.features[0].properties?.id;
      if (stationId) {
        navigate(`/station/${stationId}`);
      }
    });

    map.on("mouseenter", "cluster-circles", setCursorToPointer);
    map.on("mouseleave", "cluster-circles", resetCursor);
    map.on("mouseenter", "unclustered-point", setCursorToPointer);
    map.on("mouseleave", "unclustered-point", resetCursor);

    const debouncedUpdateMapState = () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        if (!mapRef.current) return;
        const bounds = mapRef.current.getBounds();
        setBbox(
          [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
          ].join(","),
        );
        setZoom(mapRef.current.getZoom());
      }, 250);
    };

    map.on("moveend", debouncedUpdateMapState);
    map.on("zoomend", debouncedUpdateMapState);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      geolocateControl.onRemove();
      globeControl.onRemove();

      map.off("moveend", debouncedUpdateMapState);
      map.off("zoomend", debouncedUpdateMapState);
      map.off("mouseenter", "cluster-circles", setCursorToPointer);
      map.off("mouseleave", "cluster-circles", resetCursor);
      map.off("mouseenter", "unclustered-point", setCursorToPointer);
      map.off("mouseleave", "unclustered-point", resetCursor);
      map.remove();
      mapRef.current = null;
    };
  }, [navigate, resetCursor, setCursorToPointer]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      {isLoading && <div className="loading-indicator">Chargement...</div>}

      <div className="map-controls-container top-right">
        <button
          type="button"
          className={`filter-map-button ${
            hasActiveFilters ? "active-filters" : ""
          }`}
          onClick={() => navigate("/filtres")}
          title="Ouvrir les filtres"
          aria-label="Ouvrir les filtres"
        >
          <img src={filtreIcon} alt="Icône de filtre" />
        </button>
      </div>

      <div
        ref={bottomRightControlsRef}
        className="map-controls-container bottom-right"
      />
    </div>
  );
}

export default MapLibre;
