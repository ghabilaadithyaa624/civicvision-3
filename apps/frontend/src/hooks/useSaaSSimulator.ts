import { useState, useEffect } from "react";

export type SaaSState = "NORMAL" | "LOADING" | "EMPTY" | "ERROR";

export interface SimulatorConfig {
  state: SaaSState;
  offline: boolean;
  realtime: boolean;
}

const STORAGE_KEY = "civicvision_saas_simulator";

const defaultConfig: SimulatorConfig = {
  state: "NORMAL",
  offline: false,
  realtime: false,
};

export function useSaaSSimulator() {
  const [config, setConfig] = useState<SimulatorConfig>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setConfig(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Failed to parse storage event value", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Support custom events in same-tab triggers
    const handleCustomChange = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          setConfig(JSON.parse(raw));
        } catch (err) {
          console.warn("Failed to parse storage simulator key", err);
        }
      }
    };
    window.addEventListener("saas_simulator_change", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("saas_simulator_change", handleCustomChange);
    };
  }, []);

  const updateConfig = (updater: Partial<SimulatorConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updater };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("saas_simulator_change"));
      return next;
    });
  };

  return {
    state: config.state,
    isOffline: config.offline,
    isRealtime: config.realtime,
    setSaaSState: (state: SaaSState) => updateConfig({ state }),
    setOffline: (offline: boolean) => updateConfig({ offline }),
    setRealtime: (realtime: boolean) => updateConfig({ realtime }),
  };
}
