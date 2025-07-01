import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type { StationAttributes } from "../../../../server/src/types/models/models";

function MapLibre() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [stations, setStations] = useState<StationAttributes[]>([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("http://localhost:3310/api/stations");
        console.log("la réponse : ", response);

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération");
        }
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [1.4497, 43.6079],
      zoom: 14,
    });

    for (const station of stations) {
      if (station.geom?.coordinates) {
        const [longitude, latitude] = station.geom.coordinates;

        new maplibregl.Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .addTo(map);
      }
    }

    return () => map.remove();
  }, [stations]);

  return <div ref={mapContainer} className="map-container" />;
}

export default MapLibre;
