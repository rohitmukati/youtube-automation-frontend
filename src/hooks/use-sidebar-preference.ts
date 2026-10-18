import * as React from "react";

const STORAGE_KEY = "sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useSidebarCollapsed(): [boolean, (collapsed: boolean) => void] {
  const collapsed = React.useSyncExternalStore(subscribe, getSnapshot, () => false);
  const setCollapsed = React.useCallback((next: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // The preference is optional; ignore storage failures.
    }
    listeners.forEach((listener) => listener());
  }, []);
  return [collapsed, setCollapsed];
}
