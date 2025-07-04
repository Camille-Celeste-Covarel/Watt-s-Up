import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre.css";
import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box";
import type * as GeoJSON from "geojson";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type { StationAttributes } from "../../../../server/src/types/models/models";
import "@stadiamaps/maplibre-search-box/dist/maplibre-search-box.css";

function MapLibre() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [stations, setStations] = useState<StationAttributes[]>([]);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [1.444, 43.6045],
      zoom: 14,
      attributionControl: false,
    });

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: false,
    });

    map.addControl(geolocate, "bottom-right");

    map.addControl(new MapLibreSearchControl(), "top-left");

    map.on("load", () => {
      const input = document.querySelector(
        ".input-container input",
      ) as HTMLInputElement;
      if (input) {
        input.placeholder = "Rechercher un lieu";
      }
    });

    mapRef.current = map;

    map.on("zoomstart", () => {
      map.setLayoutProperty("clusters", "visibility", "none");
      map.setLayoutProperty("cluster-count", "visibility", "none");
      map.setLayoutProperty("unclustered-point", "visibility", "none");
    });

    map.on("zoomend", () => {
      map.setLayoutProperty("clusters", "visibility", "visible");
      map.setLayoutProperty("cluster-count", "visibility", "visible");
      map.setLayoutProperty("unclustered-point", "visibility", "none");
    });

    map.on("error", (e) => {
      console.error("Erreur MapLibre :", e.error);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const fetchStationsInBbox = async () => {
      const bounds = map.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ].join(",");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/stations/visible?bbox=${bbox}`,
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data: StationAttributes[] = await response.json();
        setStations(data);
      } catch (error) {
        console.error("Erreur lors du chargement des stations:", error);
      }
    };

    fetchStationsInBbox();

    map.on("moveend", fetchStationsInBbox);

    return () => {
      map.off("moveend", fetchStationsInBbox);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || stations.length === 0) return;
    const map = mapRef.current;

    const calculateClusterRadius = (zoom: number): number => {
      return Math.max(20, 150 - zoom * 6);
    };

    const updateClusterSource = () => {
      const zoom = map.getZoom();
      const clusterRadius = calculateClusterRadius(zoom);

      for (const layerId of [
        "clusters",
        "cluster-count",
        "unclustered-point",
      ]) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      }

      if (map.getSource("stations")) {
        map.removeSource("stations");
      }

      const geoJsonData: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: stations
          .filter(
            (station) => station.latitude != null && station.longitude != null,
          )
          .map((station) => {
            const { geom, latitude, longitude, ...rest } = station;
            return {
              type: "Feature",
              properties: rest as GeoJSON.GeoJsonProperties,
              geometry: {
                type: "Point",
                coordinates: [longitude, latitude] as GeoJSON.Position,
              },
            };
          }),
      };

      map.addSource("stations", {
        type: "geojson",
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 11,
        clusterRadius: clusterRadius,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "stations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            10,
            "#f1f075",
            30,
            "#f28cb1",
          ],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
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
          "text-size": 12,
        },
        paint: {
          "text-color": "#000",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "stations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#4264fb",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });
    };

    map.on("click", "unclustered-point", (e) => {
      if (e.features?.[0]) {
        const coordinates = (
          e.features[0].geometry as GeoJSON.Point
        ).coordinates.slice();
        const properties = e.features[0].properties;

        let description = `<h3>${properties?.nom_station}</h3>`;
        if (properties?.adresse_station) {
          description += `<p>${properties.adresse_station}</p>`;
        }
        if (properties?.condition_acces) {
          description += `<p>Accès: ${properties.condition_acces}</p>`;
        }
        description += `<button type="button" class="button-reservation-popup">Réservez votre borne</button>`;

        new maplibregl.Popup({ closeButton: false })
          .setLngLat(coordinates as maplibregl.LngLatLike)
          .setHTML(description)
          .addTo(map);
      }
    });

    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
    });

    updateClusterSource();

    map.on("zoomend", updateClusterSource);
    return () => {
      map.off("zoomend", updateClusterSource);
    };
  }, [stations]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default MapLibre;
