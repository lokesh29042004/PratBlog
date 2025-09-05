import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  email: string;
  display_name?: string;
  picture?: string;
};

type AuthContextType = {
  login: boolean;
  setLogin: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 🔑 start in loading

  useEffect(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, { 
      credentials: "include",
      headers 
    })
      .then(res => res.json())
      .then(data => {
        console.log('AuthContext /me response:', data);
        if (data.success && data.user) {
          setUser(data.user);
          setLogin(true);
        } else {
          // If token expired, clear it from localStorage
          if (data.expired) {
            localStorage.removeItem('authToken');
          }
          setUser(null);
          setLogin(false);
        }
      })
      .catch((err) => {
        console.error('AuthContext /me error:', err);
        // Clear token on any auth error
        localStorage.removeItem('authToken');
        setUser(null);
        setLogin(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setLogin(false);
  };

  return (
    <AuthContext.Provider value={{ login, setLogin, user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
