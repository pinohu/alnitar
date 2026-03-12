# Cursor Prompt – Observation Journal

## Task

Allow users to log observations in a clean personal journal flow.

## Features

- Observation entry (timestamp, optional location)
- Object/event tagging
- Notes input
- Optional image/media-ready architecture
- Saved observation list or timeline
- Empty states for first-time users

## Reference

Route: `/journal`. Types: `src/types/domain.ts` (Observation). Services: `src/lib/services/journalService.ts`, adapters in `src/lib/adapters/`.
