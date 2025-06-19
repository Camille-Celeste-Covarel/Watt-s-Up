import type { StationAttributes, TerminalAttributes } from "../models/models";
import type { CsvRow } from "./dataProcessing";

export interface TransformedData {
  stationData: Partial<StationAttributes>;
  terminalData: Partial<TerminalAttributes>;
  plugAssociations: { idPlug: number }[];
}

export interface TransformError {
  type: string;
  message: string;
  rowNumber?: number;
  rowData: CsvRow;
  details?: unknown;
}

export type TransformResult =
  | { success: true; data: TransformedData }
  | { success: false; error: TransformError };

export interface CustomFile extends Express.Multer.File {
  path: string;
}
