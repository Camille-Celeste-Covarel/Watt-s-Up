import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

function MapLibre() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [1.4497, 43.6079],
      zoom: 14,
    });

    new maplibregl.Marker({ color: "red" })
      .setLngLat([1.4497, 43.6079])
      .addTo(map);

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} className="map-container" />;
}

export default MapLibre;
