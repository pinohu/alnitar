import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.alnitar.app",
  appName: "Alnitar",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
