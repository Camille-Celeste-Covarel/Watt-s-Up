import type { StationAttributes, TerminalAttributes } from "../models/models";
import type { CsvRow } from "./dataProcessing";

export interface TransformedData {
  stationData: Partial<StationAttributes>;
  terminalData: Partial<TerminalAttributes>;
  plugAssociations: { id_plug: string }[];
}

export interface TransformError {
  type: string;
  message: string;
  rowNumber?: number;
  rowData: CsvRow;
  details?: unknown;
  columnName?: string;
  culpritValue?: string;
  originalError?: unknown;
}

export type TransformResult =
  | { success: true; data: TransformedData }
  | { success: false; error: TransformError };

export interface CustomFile extends Express.Multer.File {
  path: string;
}

export interface StagedStationContent {
  stationData: Partial<StationAttributes>;
  terminals: {
    terminalData: Partial<TerminalAttributes>;
    plugAssociations: { id_plug: string }[];
  }[];
  lastModifiedRow: number;
  originalCsvRow: CsvRow;
}
