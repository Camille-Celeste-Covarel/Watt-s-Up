import type * as GeoJSON from "geojson";
import {
  Access,
  Compagny,
  Operator,
  Plug,
  Power,
  Provider,
} from "../models/_index";

export async function findOrCreateAccessByName(name: string): Promise<number> {
  const [access, created] = await Access.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return access.id;
}

export async function findOrCreateCompagnyByName(
  name: string,
): Promise<number> {
  const [compagny, created] = await Compagny.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return compagny.id;
}

export async function findOrCreateOperatorByName(
  name: string,
): Promise<number> {
  const [operator, created] = await Operator.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return operator.id;
}

export async function findOrCreateProviderByName(
  name: string,
): Promise<number> {
  const [provider, created] = await Provider.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return provider.id;
}

export async function findOrCreatePlugByName(name: string): Promise<number> {
  const [plug, created] = await Plug.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return plug.id;
}

export async function findOrCreatePowerByName(name: string): Promise<number> {
  const [power, created] = await Power.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return power.id;
}

export function parseBoolean(value: string | undefined): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  const lowerCaseValue = value.toLowerCase().trim();
  return (
    lowerCaseValue === "true" ||
    lowerCaseValue === "1" ||
    lowerCaseValue === "oui" ||
    lowerCaseValue === "yes"
  );
}

export function parseCoordinates(
  coordString: string | undefined,
): GeoJSON.Point | null {
  if (!coordString) {
    return null;
  }

  const cleanedString = coordString.replace(/[\[\]\s]/g, "").trim();
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
    `[Parse Error] Coordonnées invalides ou format inattendu: "${coordString}"`,
  );
  return null;
}
