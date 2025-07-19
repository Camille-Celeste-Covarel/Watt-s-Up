import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  firstName: string;
  isAdmin: boolean;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const login = useCallback((userData: User) => {
    setUser(userData);
    setIsAdmin(userData.isAdmin);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {}
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/check`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        setIsAdmin(data.user.isAdmin);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAdmin(false);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
