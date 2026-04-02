import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, setTasksToken } from "../services/api";

const AuthContext = createContext(null);
const storageKey = "taskflow-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : { token: null, user: null };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(authState));
    setTasksToken(authState.token);
  }, [authState]);

  async function login(credentials) {
    setLoading(true);
    try {
      const { data } = await authApi.post("/login", credentials);
      setAuthState({ token: data.token, user: data.user });
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const { data } = await authApi.post("/register", payload);
      setAuthState({ token: data.token, user: data.user });
      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuthState({ token: null, user: null });
  }

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token),
      loading,
      login,
      register,
      logout
    }),
    [authState, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

