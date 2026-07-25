"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WORKSPACE_MODE_STORAGE_KEY = "creatorshub-workspace-mode";

const VALID_WORKSPACE_MODES = ["insights", "analytics"];

const WorkspaceModeContext = createContext(null);

function isValidWorkspaceMode(mode) {
  return VALID_WORKSPACE_MODES.includes(mode);
}

export function WorkspaceModeProvider({ children }) {
  const [mode, setModeState] = useState("insights");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    try {
      const savedMode = window.localStorage.getItem(
        WORKSPACE_MODE_STORAGE_KEY
      );

      if (isValidWorkspaceMode(savedMode)) {
        setModeState(savedMode);
      }
    } catch (error) {
      console.warn(
        "CreatorsHub could not load the saved workspace mode.",
        error
      );
    } finally {
      setHasLoadedPreference(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedPreference) {
      return;
    }

    try {
      window.localStorage.setItem(
        WORKSPACE_MODE_STORAGE_KEY,
        mode
      );
    } catch (error) {
      console.warn(
        "CreatorsHub could not save the workspace mode.",
        error
      );
    }
  }, [hasLoadedPreference, mode]);

  const setMode = useCallback((nextMode) => {
    if (!isValidWorkspaceMode(nextMode)) {
      console.warn(
        `Unsupported workspace mode: ${nextMode}`
      );

      return;
    }

    setModeState(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((currentMode) =>
      currentMode === "insights"
        ? "analytics"
        : "insights"
    );
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isInsightsMode: mode === "insights",
      isAnalyticsMode: mode === "analytics",
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode]
  );

  return (
    <WorkspaceModeContext.Provider value={value}>
      {children}
    </WorkspaceModeContext.Provider>
  );
}

export function useWorkspaceMode() {
  const context = useContext(WorkspaceModeContext);

  if (!context) {
    throw new Error(
      "useWorkspaceMode must be used inside WorkspaceModeProvider."
    );
  }

  return context;
}