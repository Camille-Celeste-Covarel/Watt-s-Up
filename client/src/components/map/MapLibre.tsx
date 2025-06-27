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
    if (!mapContainer.current) {
      console.log("Conteneur de carte non disponible.");
      return;
    }

    console.log("Initialisation de la carte...");
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [1.4497, 43.6079],
      zoom: 14,
    });

    console.log(`Tentative d'ajout de ${stations.length} marqueurs.`);
    for (const station of stations) {
      if (station.latitude != null && station.longitude != null) {
        const longitude = station.longitude;
        const latitude = station.latitude;

        new maplibregl.Marker({ color: "orange" })
          .setLngLat([longitude, latitude])
          .addTo(map);
      } else {
        console.warn("Station sans coordonnées valides:", station);
      }
    }

    return () => {
      map.remove();
    };
  }, [stations]);

  return <div ref={mapContainer} className="map-container" />;
}

export default MapLibre;
