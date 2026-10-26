// Keeps track of who is logged in and shares it with the whole app.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TOKEN_KEY, setUnauthorizedHandler } from '@/lib/api';
import { authService } from '@/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we check a saved token on first load (so we don't flash the login page)
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const saveSession = useCallback(({ token, user: nextUser }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // If any request returns 401 (expired token), log out automatically
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (localStorage.getItem(TOKEN_KEY)) toast.error('Your session has expired. Please log in again.');
      logout();
    });
  }, [logout]);

  // On page load: if we have a saved token, ask the server who we are
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService
      .me()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setInitializing(false));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isHost: user?.role === 'host',
      login: async (credentials) => saveSession(await authService.login(credentials)),
      register: async (data) => saveSession(await authService.register(data)),
      logout,
      becomeHost: async () => {
        const updated = await authService.becomeHost();
        setUser(updated);
        return updated;
      },
      setUser,
    }),
    [user, initializing, saveSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
