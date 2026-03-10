import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface NightVisionContextType {
  nightVision: boolean;
  toggleNightVision: () => void;
}

const NightVisionContext = createContext<NightVisionContextType>({
  nightVision: false,
  toggleNightVision: () => {},
});

export function NightVisionProvider({ children }: { children: ReactNode }) {
  const [nightVision, setNightVision] = useState(() => {
    try { return localStorage.getItem("alnitar_night_vision") === "true"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("night-vision", nightVision);
    localStorage.setItem("alnitar_night_vision", String(nightVision));
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
