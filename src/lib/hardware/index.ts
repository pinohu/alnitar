/**
 * Hardware adapters — mount (Alpaca), future: camera, focuser.
 */

export type { MountAdapter, MountPosition } from "./mountAdapter";
export { noopMountAdapter } from "./mountAdapter";
export { createAlpacaMount, type AlpacaMountConfig } from "./alpacaMount";
