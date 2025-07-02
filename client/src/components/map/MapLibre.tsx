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

    const layerIds = ["clusters", "cluster-count", "unclustered-point"];
    for (const layerId of layerIds) {
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
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 50,
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

        new maplibregl.Popup()
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

    return () => {};
  }, [stations]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

export default MapLibre;
