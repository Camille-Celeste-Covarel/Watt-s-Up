import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre.css";
import type * as GeoJSON from "geojson";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type { StationAttributes } from "../../../../server/src/types/models/models";

function MapLibre() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [stations, setStations] = useState<StationAttributes[]>([]);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("http://localhost:3310/api/stations");

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP: ${response.status} lors de la récupération des stations`,
          );
        }
        const data: StationAttributes[] = await response.json();
        setStations(data);
      } catch (error) {
        console.error("Erreur lors du chargement des stations:", error);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [1.4497, 43.6079],
      zoom: 10,
    });

    map.on("load", () => {
      mapRef.current = map;
    });

    map.on("error", (e) => {
      console.error("Erreur MapLibre :", e.error);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    if (stations.length === 0) {
      return;
    }

    const map = mapRef.current;

    if (map.getLayer("stations-layer")) {
      map.removeLayer("stations-layer");
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
          const { geom, latitude, longitude, ...restOfProperties } = station;

          return {
            type: "Feature",
            properties: restOfProperties as GeoJSON.GeoJsonProperties,
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
    });

    map.addLayer({
      id: "stations-layer",
      type: "circle",
      source: "stations",
      paint: {
        "circle-color": "#4264fb",
        "circle-radius": 6,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });

    map.on("click", "stations-layer", (e) => {
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

        new maplibregl.Popup()
          .setLngLat(coordinates as maplibregl.LngLatLike)
          .setHTML(description)
          .addTo(map);
      }
    });

    map.on("mouseenter", "stations-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "stations-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    return () => { };
  }, [stations]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default MapLibre;
