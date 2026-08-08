import React, { createContext, useContext, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("hh_admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (username, password) => {
    const { data } = await client.post("/api/admin/login", { username, password });
    localStorage.setItem("hh_admin_token", data.accessToken);
    localStorage.setItem("hh_admin_user", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hh_admin_token");
    localStorage.removeItem("hh_admin_user");
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
