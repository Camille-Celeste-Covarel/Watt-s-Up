import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";

// ✅ On exporte l'interface pour la réutiliser
export interface FilterState {
  vehicles: string[];
  powers: string[];
  plugs: string[];
}

// ... le reste du fichier est inchangé
interface FilterContextType {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    vehicles: [],
    powers: [],
    plugs: [],
  });

  const hasActiveFilters =
    filters.vehicles.length > 0 ||
    filters.powers.length > 0 ||
    filters.plugs.length > 0;

  const value = {
    filters,
    setFilters,
    hasActiveFilters,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
