import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre.css";
import "@stadiamaps/maplibre-search-box/dist/maplibre-search-box.css";

import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box";
import type * as GeoJSON from "geojson";
import maplibregl, { GlobeControl } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { useOverlay } from "../../contexts/OverlayContext/OverlayContext.tsx";
import type { StationMapAttributes } from "../../types/types_maplibre.ts";
import { StationDetails } from "../stationDetails/stationDetails";

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
        },
      });

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
        paint: { "text-color": "#ffffff" },
      });

      // Couche pour les points non clusterisés
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "stations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      try {
        await fetchAndUpdateStations();
      } catch (error) {
        console.error("Le chargement initial des station a échoué :", error);
      }
    });

    // --- GESTIONNAIRES DE CLICS (PLUS ROBUSTES) ---

    // Clic sur un cluster
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

    // Clic sur un point unique
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

    // --- GESTIONNAIRES DE SURVOL ---
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

    // --- LOGIQUE DE MISE A JOUR DES DONNEES ---
    const fetchAndUpdateStations = async () => {
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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/stations/visible?bbox=${bbox}`,
        );
        if (!response.ok) {
          console.error(
            `HTTP error! status: ${response.status} ${response.statusText}`,
          );
          return;
        }

        const data: StationMapAttributes[] = await response.json();
        logInvalidStations(data, "fetchAndUpdateStations");

        // TRANSFORMATION ROBUSTE DES DONNÉES
        const features = data
          .map((station) => {
            // On ne traite que les stations avec une géométrie
            if (!station.geojson_geom) {
              return null;
            }
            try {
              const geometry = JSON.parse(
                station.geojson_geom as unknown as string,
              );
              // On vérifie que la géométrie parsée est bien un Point valide
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
              return null; // La géométrie n'est pas un Point valide
            } catch (e) {
              console.warn(
                "Impossible de parser geojson_geom pour la station:",
                station.id,
              );
              return null; // Le JSON est invalide
            }
          })
          .filter(Boolean); // Élimine tous les 'null' du tableau

        const geoJsonData: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: features as GeoJSON.Feature[],
        };

        source.setData(geoJsonData);
      } catch (error) {
        console.error("Erreur lors du chargement des stations:", error);
      }
    };

    // On attache le listener pour mettre à jour les données quand la carte bouge
    map.on("moveend", fetchAndUpdateStations);
    map.on("zoomend", fetchAndUpdateStations);

    // Nettoyage au démontage du composant
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [openOverlay]);

  return <div ref={mapContainer} className="map-wrap" />;
}

export default MapLibre;
