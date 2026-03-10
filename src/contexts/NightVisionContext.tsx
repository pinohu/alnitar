import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { STORAGE_KEYS, getItem, setItem } from "@/lib/clientStorage";

interface NightVisionContextType {
  nightVision: boolean;
  toggleNightVision: () => void;
}

const NightVisionContext = createContext<NightVisionContextType>({
  nightVision: false,
  toggleNightVision: () => {},
});

export function NightVisionProvider({ children }: { children: ReactNode }) {
  const [nightVision, setNightVision] = useState(() => getItem(STORAGE_KEYS.NIGHT_VISION) === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("night-vision", nightVision);
    setItem(STORAGE_KEYS.NIGHT_VISION, String(nightVision));
  }, [nightVision]);

  return (
    <NightVisionContext.Provider value={{ nightVision, toggleNightVision: () => setNightVision(v => !v) }}>
      {children}
    </NightVisionContext.Provider>
  );
}

export function useNightVision() {
  return useContext(NightVisionContext);
}
