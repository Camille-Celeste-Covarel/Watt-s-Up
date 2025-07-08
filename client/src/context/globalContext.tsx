import { createContext } from "react";
import type { StationAttributes } from "../../../server/src/types/models/models";

export const globalContext = createContext<{
  station: StationAttributes[];
} | null>(null);
