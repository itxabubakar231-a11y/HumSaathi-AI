import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { DEFAULT_SENSORY, applySensoryToDocument, applyLanguageToDocument } from '../utils/preferences';

const UserContext = createContext(null);
const TOKEN_KEY = 'humsaathi_auth_token';
const STORAGE_KEY = 'humsaathi_user_id';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState('unknown');

  const syncUserPreferences = (userObj) => {
    if (!userObj) return;
    const finalSensory = userObj.sensoryPrefs || DEFAULT_SENSORY;
    const finalLang = userObj.language || 'en';
    applySensoryToDocument(finalSensory);
    applyLanguageToDocument(finalLang);
    localStorage.setItem('humsaathi_language', finalLang);
    localStorage.setItem('humsaathi_sensory', JSON.stringify(finalSensory));
    if (userObj.id) {
      localStorage.setItem(STORAGE_KEY, userObj.id);
    }
  };

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      const legacyId = localStorage.getItem(STORAGE_KEY);
      if (legacyId) {
        try {
          const { user: loaded } = await api.getUser(legacyId);
          if (loaded) {
            setUser(loaded);
            syncUserPreferences(loaded);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      }
      return;
    }

    try {
      const data = await api.getMe();
      const loaded = data?.user || data;
      if (loaded && loaded.id) {
        setUser(loaded);
        syncUserPreferences(loaded);
      } else {
        throw new Error('Invalid user session');
      }
    } catch (err) {
      console.warn('Session verification failed, clearing credentials:', err);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem('humsaathi_language') || 'en';
      applyLanguageToDocument(storedLang);
      const storedSensory = localStorage.getItem('humsaathi_sensory');
      if (storedSensory) {
        applySensoryToDocument(JSON.parse(storedSensory));
      }
    } catch {
      // ignore
    }

    api.health().then((h) => setAiMode(h.mode)).catch(() => setAiMode('offline'));

    loadCurrentUser().finally(() => setLoading(false));
  }, [loadCurrentUser]);

  const signupUser = async (registrationData) => {
    const result = await api.signupUser(registrationData);
    const userObj = result?.user || result;
    const token = result?.token;

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    setUser(userObj);
    syncUserPreferences(userObj);
    return userObj;
  };

  const loginUser = async (credentials) => {
    const result = await api.loginUser(credentials);
    const userObj = result?.user || result;
    const token = result?.token;

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    setUser(userObj);
    syncUserPreferences(userObj);
    return userObj;
  };

  const loginWithGoogle = async (credentialOrToken) => {
    const payload = typeof credentialOrToken === 'string'
      ? { credential: credentialOrToken }
      : credentialOrToken;
    const result = await api.googleAuth(payload);
    const userObj = result?.user || result;
    const token = result?.token;

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    setUser(userObj);
    syncUserPreferences(userObj);
    return { user: userObj, isNewUser: Boolean(result?.isNewUser) };
  };

  const setupUser = async (data) => {
    const payload = { ...data, userId: user?.id };
    const result = await api.setupUser(payload);
    const userObj = result?.user || result;
    const token = result?.token;

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    setUser(userObj);
    syncUserPreferences(userObj);
    return userObj;
  };

  const selectPersona = async (persona) => {
    if (!user?.id) {
      setUser((prev) => (prev ? { ...prev, persona } : { persona, language: 'en', sensoryPrefs: DEFAULT_SENSORY }));
      return { persona };
    }
    const result = await api.selectPersona(user.id, persona);
    const updated = result?.user || { ...user, persona };
    setUser(updated);
    return updated;
  };

  const updateSensory = async (patch) => {
    const nextPrefs = { ...(user?.sensoryPrefs || DEFAULT_SENSORY), ...patch };
    applySensoryToDocument(nextPrefs);
    localStorage.setItem('humsaathi_sensory', JSON.stringify(nextPrefs));
    if (user?.id) {
      try {
        const result = await api.updateSensory(user.id, nextPrefs);
        const updated = result?.user || { ...user, sensoryPrefs: nextPrefs };
        setUser(updated);
        return updated;
      } catch (err) {
        console.warn('Sensory update error:', err);
      }
    }
    setUser((prev) => (prev ? { ...prev, sensoryPrefs: nextPrefs } : null));
    return nextPrefs;
  };

  const updateLanguage = async (newLang) => {
    applyLanguageToDocument(newLang);
    localStorage.setItem('humsaathi_language', newLang);
    if (user?.id) {
      try {
        const result = await api.updateLanguage(user.id, newLang);
        const updated = result?.user || { ...user, language: newLang };
        setUser(updated);
        return updated;
      } catch (err) {
        console.warn('Language update error:', err);
      }
    }
    setUser((prev) => (prev ? { ...prev, language: newLang } : null));
    return newLang;
  };

  const logout = () => {
    api.logoutUser().catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const refreshUser = () => loadCurrentUser();

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        aiMode,
        signupUser,
        loginUser,
        loginWithGoogle,
        setupUser,
        selectPersona,
        updateSensory,
        updateLanguage,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
