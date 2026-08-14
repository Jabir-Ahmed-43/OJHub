import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ojhub_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("ojhub_token"));
  const [loading, setLoading] = useState(true);

  // Attach the JWT to every outgoing request automatically
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("ojhub_token");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Auto-logout on 401 (expired/invalid token)
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validate stored token on first load
  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        localStorage.setItem("ojhub_user", JSON.stringify(res.data.user));
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((userData, jwtToken) => {
    localStorage.setItem("ojhub_token", jwtToken);
    localStorage.setItem("ojhub_user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ojhub_token");
    localStorage.removeItem("ojhub_user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem("ojhub_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
