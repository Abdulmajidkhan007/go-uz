# Vroom — Super-App Monorepo (CLAUDE.md)

Ride-hailing + delivery super-app. pnpm/turbo monorepo. Reply to the user in **Uzbek**.

## Layout
- `apps/web` (Vite, pkg name `web`), `apps/admin` (Vite), `apps/mobile` (Expo, pkg `@vroom/mobile`)
- `packages/*`: `types`, `constants`, `config`, `utils`, `validation`, `theme`, `ui`, `api`, `assets`

## Commands (always verify before committing)
- Typecheck all: `pnpm -s typecheck` (12 packages must be green)
- Per-app: `pnpm --filter web build` · `pnpm --filter web dev` · `pnpm --filter @vroom/mobile <script>`
- Single package typecheck: `npx tsc --noEmit -p <path>/tsconfig.json`

## Architecture invariants
- UI/hooks/stores depend ONLY on the `ApiClient` interface (`@vroom/api`). Swapping backends never touches UI.
- Backends: mock/http via `createApiClient({ mode })`; Firebase via the **`@vroom/api/firebase`** subpath (`createFirebaseApiClient`).
- Keep `firebase` OUT of mock/http consumer bundles — it is an optional peer dep, imported only via the subpath. Never re-export it from `@vroom/api`'s root barrel.
- Backend is selected by **env only** (no code change): apps auto-pick Firebase when the Firebase vars are present, else mock/http.
- TS `exactOptionalPropertyTypes` is on: build optional fields with conditional spread (`...(x !== undefined ? { x } : {})`), never assign `undefined`.

## Env conventions
- Web/admin use `VITE_` prefix; mobile uses `EXPO_PUBLIC_`. Both map to bare names via `loadConfig` / `loadFirebaseConfig`.
- Keys: `*_GOOGLE_MAPS_KEY`, `*_VROOM_API_MODE`, `*_VROOM_API_BASE_URL`, `*_VROOM_FIREBASE_*`. See `.env.example`.

## Git workflow
- Develop only on `claude/super-app-monorepo-build-52V73`. Never push to another branch without explicit permission.
- Push with `git push -u origin <branch>`; retry with backoff on network errors.
- Do NOT open a PR unless explicitly asked. Do NOT put the model identifier in commits/PRs/code.

## Backend docs
- Firebase setup + activation: `docs/backend-firebase.md`. Firestore rules: `firebase/firestore.rules`. Sample Cloud Function: `firebase/functions/`.
