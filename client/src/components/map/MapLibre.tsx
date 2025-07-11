import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre.css";
import "@stadiamaps/maplibre-search-box/dist/maplibre-search-box.css";
import Filter from "../filter/Filter.tsx";

import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box";
import type * as GeoJSON from "geojson";
import maplibregl, { GlobeControl } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";
import type { StationMapAttributes } from "../../types/types_maplibre.ts";
import { StationDetails } from "../StationDetails/stationDetails";

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
  const { openOverlay } = useOverlay();

  const [filterData, setFilterData] = useState({
    vehicles: [] as string[],
    powers: [] as string[],
    plugs: [] as string[],
  });

  const currentFiltersRef = useRef(filterData);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    currentFiltersRef.current = filterData;
  }, [filterData]);

  const fetchAndUpdateStations = useCallback(
    async (filters?: typeof filterData) => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      const source = map.getSource("stations") as maplibregl.GeoJSONSource;
      if (!source) return;

      try {
        const bounds = map.getBounds();
        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ].join(",");

        let url = `${import.meta.env.VITE_API_URL}/api/stations/visible?bbox=${bbox}`;

        if (filters) {
          if (filters.vehicles.length > 0) {
            url += `&vehicles=${filters.vehicles.join(",")}`;
          }
          if (filters.powers.length > 0) {
            url += `&powers=${filters.powers.join(",")}`;
          }
          if (filters.plugs.length > 0) {
            url += `&plugs=${filters.plugs.join(",")}`;
          }
        }

        const response = await fetch(url);
        if (!response.ok) {
          console.error(
            `HTTP error! status: ${response.status} ${response.statusText}`,
          );
          return;
        }

        const data: StationMapAttributes[] = await response.json();
        logInvalidStations(data, "fetchAndUpdateStations");

        const features = data
          .map((station) => {
            if (!station.geojson_geom) {
              return null;
            }
            try {
              const geometry = JSON.parse(
                station.geojson_geom as unknown as string,
              );
              if (
                geometry?.type === "Point" &&
                Array.isArray(geometry.coordinates)
              ) {
                return {
                  type: "Feature",
                  properties: station,
                  geometry: geometry,
                };
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
      } catch (error) {
        console.error("Erreur lors du chargement des stations:", error);
      }
    },
    [],
  );

  const applyFiltersToStations = useCallback(
    async (filters: typeof filterData) => {
      console.log("🎯 Application des filtres:", filters);
      await fetchAndUpdateStations(filters);
    },
    [fetchAndUpdateStations],
  );

  const handleFilterValidation = (filters: {
    vehicles: string[];
    powers: string[];
    plugs: string[];
  }) => {
    console.log("🔍 Filtres reçus:", filters);
    setFilterData(filters);
    applyFiltersToStations(filters).catch((error) => {
      console.error("Erreur lors de l'application des filtres:", error);
    });
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [1.444, 43.6045],
      zoom: 14,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "bottom-right",
    );
    map.addControl(new MapLibreSearchControl({}), "top-left");
    map.addControl(new GlobeControl(), "bottom-right");

    map.on("load", async () => {
      map.addSource("stations", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // --- Couche des cercles de clusters ---
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
          "circle-opacity-transition": { duration: 500 },
        },
      } as maplibregl.CircleLayerSpecification);

      // --- Couche du nombre dans les clusters ---
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
          "text-opacity-transition": { duration: 500 },
        },
      } as maplibregl.SymbolLayerSpecification);

      // --- Couche des points non-clusterisés ---
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "stations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#F2C641FF",
          "circle-radius": 6,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#40352c",
          "circle-opacity-transition": { duration: 500 },
        },
      } as maplibregl.CircleLayerSpecification);

      try {
        await fetchAndUpdateStations();
      } catch (error) {
        console.error("Le chargement initial des station a échoué :", error);
      }
    });

    map.on("click", "cluster-circles", async (e) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const clusterId = feature.properties?.cluster_id;
      if (clusterId && feature.geometry.type === "Point") {
        const source = map.getSource("stations") as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: feature.geometry.coordinates as maplibregl.LngLatLike,
          zoom: zoom,
        });
      }
    });

    map.on("click", "unclustered-point", (e) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const stationId = feature.properties?.id;

      if (stationId && feature.geometry?.type === "Point") {
        openOverlay(<StationDetails id={stationId} />);
        map.easeTo({
          center: feature.geometry.coordinates as maplibregl.LngLatLike,
          zoom: 16,
        });
      }
    });

    const setCursorToPointer = () => {
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = "pointer";
      }
    };

    const resetCursor = () => {
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = "";
      }
    };

    map.on("mouseenter", "cluster-circles", setCursorToPointer);
    map.on("mouseleave", "cluster-circles", resetCursor);
    map.on("mouseenter", "unclustered-point", setCursorToPointer);
    map.on("mouseleave", "unclustered-point", resetCursor);

    const debouncedFetch = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = window.setTimeout(() => {
        fetchAndUpdateStations(currentFiltersRef.current).catch((error) => {
          console.error("Erreur lors du rafraîchissement de la carte:", error);
        });
      }, 250);
    };

    map.on("moveend", debouncedFetch);
    map.on("zoomend", debouncedFetch);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, [openOverlay, fetchAndUpdateStations]);

  return (
    <div ref={mapContainer} className="map-wrap">
      <Filter onFilterValidation={handleFilterValidation} />
    </div>
  );
}

export default MapLibre;
