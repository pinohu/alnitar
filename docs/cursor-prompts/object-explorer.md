# Cursor Prompt – Object Explorer

## Task

Create or improve the celestial object explorer with filtering and detail pages.

## Features

- Object listing (constellations, DSOs)
- Search and filter by object type
- Object detail pages with scientific metadata
- Educational descriptions and observation tips
- Related objects and visibility guidance
- Save/favorite pattern (extension point)

## Reference

Routes: `/explore`, `/explore/objects`, `/explore/object/dso/:id`. Data: `src/data/constellations.ts`, `src/data/deepSkyObjects.ts`. Types: `src/types/domain.ts`, `src/lib/celestial-explorer/types.ts`.
