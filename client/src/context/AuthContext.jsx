import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, signupUser } from "../services/factforgeApi";
import { clearAccessToken, getAccessToken, setAccessToken } from "../services/authSession";

const AuthContext = createContext(null);

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    getCurrentUser()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  const login = async ({ email, password }) => {
    const data = await loginUser({ email: normalizeEmail(email), password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const signup = async ({ email, full_name, password }) => {
    const data = await signupUser({ email: normalizeEmail(email), full_name: full_name.trim(), password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearAccessToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      signup,
      logout
    }),
    [user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
