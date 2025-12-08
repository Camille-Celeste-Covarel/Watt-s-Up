import type { ReactNode, RefObject } from "react";
import type {
  StationAttributes,
  TerminalAttributes,
} from "../models/models.ts";

export interface Plug {
  id: string;
  name: string;
}

export interface EnrichedTerminalAttributes extends TerminalAttributes {
  plugs?: Plug[];
}

export interface EnrichedStationAttributes extends StationAttributes {
  terminals?: EnrichedTerminalAttributes[];
}

export interface PlugIconProps {
  plugName: string;
  className?: string;
}

export interface TerminalGroup {
  key: string;
  power: number;
  plugs: Plug[];
  count: number;
  availableCount: number;
}

export interface HistoryEntry {
  import_id: string;
  log_file_uuid?: string;
  file_name: string;
  status: "COMPLETED" | "PARTIAL_SUCCESS" | "FAILED" | "CANCELLED";
  import_date: string;
  total_lines_in_file: number;
  total_lines_processed: number;
  successful_lines: number;
  duration_ms: number;
  error_summary: { message: string } | null;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export interface RouteHandle {
  isOverlay?: boolean;
}

export interface ScrollToTopButtonProps {
  targetRef?: RefObject<HTMLElement | null>;
}

export interface CreateReservationData {
  stationId: string;
  power: number;
  plugIds: string[];
}

export interface ReservationResponse {
  id: string;
}
