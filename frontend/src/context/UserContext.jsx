import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { DEFAULT_SENSORY, applySensoryToDocument, applyLanguageToDocument } from '../utils/preferences';

const UserContext = createContext(null);
const STORAGE_KEY = 'humsaathi_user_id';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState('unknown');

  const loadUser = useCallback(async (userId) => {
    try {
      const { user: loaded } = await api.getUser(userId);
      setUser(loaded);
      applySensoryToDocument(loaded.sensoryPrefs || DEFAULT_SENSORY);
      applyLanguageToDocument(loaded.language || 'en');
      localStorage.setItem(STORAGE_KEY, loaded.id);
    } catch {
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
      // ignore JSON parse error
    }
    api.health().then((h) => setAiMode(h.mode)).catch(() => setAiMode('offline'));
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      loadUser(storedId).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const setupUser = async (data) => {
    const payload = { ...data, userId: user?.id };
    const result = await api.setupUser(payload);
    const userObj = result?.user || result;
    setUser(userObj);
    const finalSensory = userObj?.sensoryPrefs || DEFAULT_SENSORY;
    const finalLang = userObj?.language || 'en';
    applySensoryToDocument(finalSensory);
    applyLanguageToDocument(finalLang);
    localStorage.setItem('humsaathi_language', finalLang);
    localStorage.setItem('humsaathi_sensory', JSON.stringify(finalSensory));
    if (userObj?.id) {
      localStorage.setItem(STORAGE_KEY, userObj.id);
    }
    return userObj;
  };

  const loginUser = async (credentials) => {
    const result = await api.loginUser(credentials);
    const userObj = result?.user || result;
    setUser(userObj);
    const finalSensory = userObj?.sensoryPrefs || DEFAULT_SENSORY;
    const finalLang = userObj?.language || 'en';
    applySensoryToDocument(finalSensory);
    applyLanguageToDocument(finalLang);
    localStorage.setItem('humsaathi_language', finalLang);
    localStorage.setItem('humsaathi_sensory', JSON.stringify(finalSensory));
    if (userObj?.id) {
      localStorage.setItem(STORAGE_KEY, userObj.id);
    }
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
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const refreshUser = () => user?.id && loadUser(user.id);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        aiMode,
        setupUser,
        loginUser,
        selectPersona,
        updateSensory,
        updateLanguage,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
