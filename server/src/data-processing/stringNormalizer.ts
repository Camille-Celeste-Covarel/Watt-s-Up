import type * as GeoJSON from "geojson";
import type { Point } from "geojson";

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function normalizeString(
  input: string | number | null | undefined,
): string | null {
  if (input === null || input === undefined) {
    return null;
  }
  const trimmed = String(input).trim();
  const sanitized = escapeHtml(trimmed);
  return sanitized === "" ? null : sanitized;
}

export function parseNumber(
  input: string | number | null | undefined,
): number | null {
  if (
    input === null ||
    input === undefined ||
    (typeof input === "string" && input.trim() === "")
  ) {
    return null;
  }
  const cleanedInput =
    typeof input === "string" ? input.replace(",", ".") : input;
  const num = Number.parseFloat(String(cleanedInput));
  return Number.isNaN(num) ? null : num;
}

export function parseBoolean(
  input: string | number | boolean | null | undefined,
): boolean | null {
  if (
    input === null ||
    input === undefined ||
    (typeof input === "string" && input.trim() === "")
  ) {
    return null;
  }
  if (typeof input === "boolean") {
    return input;
  }
  if (typeof input === "number") {
    if (input === 1) return true;
    if (input === 0) return false;
    return null;
  }

  const s = String(input).trim().toLowerCase();
  if (["true", "1", "oui", "yes"].includes(s)) {
    return true;
  }
  if (["false", "0", "non", "no"].includes(s)) {
    return false;
  }
  return null;
}

export function parseDate(
  input: string | Date | null | undefined,
): Date | null {
  if (
    input === null ||
    input === undefined ||
    (typeof input === "string" && input.trim() === "")
  ) {
    return null;
  }
  if (input instanceof Date) {
    return input;
  }
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseGeoJSONPoint(
  coordsString: string | null | undefined,
): GeoJSON.Point | null {
  if (!coordsString) {
    return null;
  }
  const cleanedString = coordsString.replace(/[\[\]\s]/g, "").trim();
  const parts = cleanedString.split(",").map(Number);

  if (
    parts.length === 2 &&
    !Number.isNaN(parts[0]) &&
    !Number.isNaN(parts[1])
  ) {
    const longitude = parts[0];
    const latitude = parts[1];
    if (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }
  }
  console.warn(
    `[Parse Error] Coordonnées GeoJSON invalides ou format inattendu: "${coordsString}"`,
  );
  return null;
}

export function parseSeparateGeoJSONCoordinates(
  latitudeString: string | number,
  longitudeString: string | number,
): Point | null {
  const lat = parseNumber(latitudeString);
  const lon = parseNumber(longitudeString);

  if (
    lat !== null &&
    lon !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  ) {
    return {
      type: "Point",
      coordinates: [lon, lat],
    };
  }
  console.warn(
    `[Parse Error] Lat/Lon GeoJSON séparées invalides: lat="${latitudeString}", lon="${longitudeString}"`,
  );
  return null;
}
