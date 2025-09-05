import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { setUser, setLogin } = useAuth();

  useEffect(() => {
    console.log("✅ AuthSuccess mounted");

    const checkAuth = async () => {
      try {
        // Extract token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          localStorage.setItem('authToken', token);
        }
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
          credentials: "include",
          headers,
        });
        const data = await response.json();
        console.log('AuthContext /me response:', data);
        
        if (data.success && data.user) {
          setUser(data.user);
          setLogin(true);
          navigate("/");
        } else {
          setLogin(false);
          navigate("/login");
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setLogin(false);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, setUser, setLogin]);

  return <p className="text-center mt-10">⏳ Logging you in...</p>;
}
