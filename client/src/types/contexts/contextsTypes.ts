export interface OverlayContextType {
  closeOverlay: () => void;
}

export interface User {
  firstName: string;
  isAdmin: boolean;
  avatarUrl: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface ImportStats {
  total: number;
  success: number;
  errors: number;
}

export interface ImportState {
  isImporting: boolean;
  isWsConnected: boolean;
  importId: string | null;
  progressPercentage: number;
  logLines: string[];
  errorMessages: string[];
  elapsedTime: number;
  stats: ImportStats;
  fileName: string | null;
}

export interface ImportContextType extends ImportState {
  startUpload: (file: File) => Promise<void>;
  cancelImport: () => void;
  clearImportState: () => void;
}
