# Project guidance

## Structure and stack

- The deployable Next.js application lives in `web/`.
- The main stack is Next.js, TypeScript, Supabase, DeepSeek, and Vercel.
- Run application commands from `web/` unless a command explicitly targets the repository root.

## Validation

- After code changes, run `npm run lint` from `web/`.
- Before a change is considered ready to ship, run `npm run build` from `web/`.
- Distinguish code failures from environment-only failures such as blocked access to remote fonts.

## Protected local files

- Do not modify or commit `project-docs/`.
- Do not modify, display, or commit `.env.local` or any secret values unless the user explicitly requests it.
- Keep `.DS_Store`, environment files, build output, and other local artifacts out of Git.

## Git and deployment

- Small, low-risk changes may be made directly on `main`.
- Use a feature branch for large, experimental, or high-risk changes.
- Do not push, deploy, or otherwise trigger an external release without explicit user confirmation.
- Keep `main` in a runnable state.
