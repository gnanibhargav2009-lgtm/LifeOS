import { useState, useEffect, useCallback, useRef } from 'react';

// Helper to handle localStorage events for syncing across tabs if needed, 
// primarily used here for simple persistence.

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Use a ref to store initialValue to avoid re-initializing if the object reference changes
  // but the content is conceptually the same (common with inline objects).
  const initialValueRef = useRef(initialValue);

  // Initialize state lazily so we only read from localStorage on mount
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValueRef.current;
    }
  });

  // Update storedValue if the key changes (unlikely but good practice)
  useEffect(() => {
     try {
        const item = window.localStorage.getItem(key);
        if (item) {
           setStoredValue(JSON.parse(item));
        }
     } catch (e) {
        // ignore
     }
  }, [key]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      setStoredValue((currentStoredValue) => {
        const valueToStore = value instanceof Function ? value(currentStoredValue) : value;
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

export const clearAllData = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.location.reload();
  }
};