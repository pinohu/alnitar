# Cursor Prompt – Sky Scanner

## Task

Create or improve the sky scanning interface (Cosmic Camera).

## Features

- Scan UI (upload and/or live camera)
- Constellation overlay and object labels
- Save observation to journal
- Fallback empty/error/loading states
- Recognition adapter interface for future integration

## Reference

Route: `/recognize`. Recognition: `src/lib/recognition.ts`. Components: `CosmicCameraLiveView`, `CameraCaptureView`, `SkyStoryMode`. Save flow: journal service and RegisterGate.
