/**
 * Mount control adapter — abstract interface for telescope mounts (Alpaca, INDI, etc.).
 * Used by AlignScope and future automation. Implementations talk to local or remote mount servers.
 */

export interface MountPosition {
  rightAscensionHours: number;
  declinationDegrees: number;
  altitudeDegrees?: number;
  azimuthDegrees?: number;
}

export interface MountAdapter {
  /** Human-readable name (e.g. "Alpaca (localhost:11111)") */
  name: string;
  /** Check if the mount is reachable and returns position. */
  isConnected(): Promise<boolean>;
  /** Current pointing position (RA/Dec in hours and degrees). */
  getPosition(): Promise<MountPosition | null>;
  /** Slew to equatorial coordinates (async; returns when slew starts). */
  slewToCoordinates(raHours: number, decDeg: number): Promise<{ ok: boolean; error?: string }>;
  /** Sync mount to coordinates (align without moving). */
  syncToCoordinates(raHours: number, decDeg: number): Promise<{ ok: boolean; error?: string }>;
  /** Abort current slew. */
  abortSlew(): Promise<{ ok: boolean; error?: string }>;
}

/** No-op adapter when no hardware is configured. */
export const noopMountAdapter: MountAdapter = {
  name: "None",
  async isConnected() {
    return false;
  },
  async getPosition() {
    return null;
  },
  async slewToCoordinates() {
    return { ok: false, error: "No mount configured" };
  },
  async syncToCoordinates() {
    return { ok: false, error: "No mount configured" };
  },
  async abortSlew() {
    return { ok: true };
  },
};
