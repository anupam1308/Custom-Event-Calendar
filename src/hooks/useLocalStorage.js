import { useState, useEffect } from "react";

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
};

export const useEventStorage = () => {
  const [events, setEvents] = useLocalStorage("calendar-events", []);

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    return newEvent;
  };

  const updateEvent = (eventId, updates) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    );
  };

  const deleteEvent = (eventId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  };

  const clearAllEvents = () => {
    setEvents([]);
  };

  return [events, addEvent, updateEvent, deleteEvent, clearAllEvents];
};

export const usePreferences = () => {
  const defaultPreferences = {
    theme: "light",
    defaultView: "month",
    weekStartsOn: 0,
    timeFormat: "12h",
    defaultEventDuration: 60,
    showWeekends: true,
    eventColors: {
      work: "#3b82f6",
      personal: "#10b981",
      meeting: "#8b5cf6",
      deadline: "#ef4444",
      other: "#6b7280",
    },
  };

  const [preferences, setPreferences] = useLocalStorage("calendar-preferences", defaultPreferences);

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return [preferences, updatePreference, resetPreferences];
};

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useLocalStorage("calendar-search-history", []);

  const addSearchTerm = (term) => {
    if (!term.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== term);
      return [term, ...filtered].slice(0, 10);
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  return [searchHistory, addSearchTerm, clearSearchHistory];
};
