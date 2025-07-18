import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

// 1. Définir la forme de nos filtres
export interface FiltersState {
  vehicles: string[];
  powers: string[];
  plugs: string[];
}

// 2. Définir la forme de notre contexte
interface FilterContextType {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
}

// 3. Créer le contexte avec une valeur par défaut (qui lèvera une erreur si utilisée)
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// 4. Créer le "Provider" qui contiendra la logique et les données
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FiltersState>({
    vehicles: [],
    powers: [],
    plugs: [],
  });

  // useMemo garantit que la valeur du contexte ne change que si 'filters' change,
  // ce qui optimise les re-rendus des composants qui l'utilisent.
  const value = useMemo(() => ({ filters, setFilters }), [filters]);

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

// 5. Créer un hook personnalisé pour utiliser le contexte facilement et de manière sécurisée
export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
