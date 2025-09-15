import { useCallback } from "react";

export function useLocalStorage() {
  const setItemL = useCallback(<T>(key: string, value: T): void => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting localStorage item:", error);
    }
  }, []);

  const getItemL = useCallback(<T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === "undefined") return defaultValue;
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.error("Error getting localStorage item:", error);
      return defaultValue;
    }
  }, []);

  return { setItemL, getItemL };
}

export function useSessionStorage() {
  const setItemS = <T>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting sessionStorage item:", error);
    }
  };

  const getItemS = <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.error("Error getting sessionStorage item:", error);
      return defaultValue;
    }
  };

  const removeItemS = (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing sessionStorage item:", error);
    }
  };

  return { setItemS, getItemS, removeItemS };
}
