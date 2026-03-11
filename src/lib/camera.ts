/**
 * Sky camera — request rear (environment) camera for pointing at the sky.
 * Use for Cosmic Camera live view and Take Photo. Do not mirror the feed (back camera is natural).
 */

export const SKY_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: "environment",
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

/**
 * Request the rear (environment) camera stream for sky viewing.
 * Mobile: back camera. Desktop: outward-facing webcam when available.
 * Do not mirror the video — rear camera feed is correct for pointing at the sky.
 */
export async function getSkyCameraStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: SKY_VIDEO_CONSTRAINTS,
    audio: false,
  });
}
