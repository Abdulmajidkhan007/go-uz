# Architecture

Core principles, folder structure, package dependencies, and build organization for the Vroom monorepo.

---

## Core Principles

### 1. Dependency Direction: Inward

Dependency flow is strictly toward the center:

```
Apps (mobile, web)
    ↑ ↑
    ├─ api (with React Query hooks)
    ├─ config
    ├─ theme
    └─ ui
        ↑
        ├─ types
        ├─ constants
        ├─ utils
        ├─ validation
        └─ assets
```

**Rules:**
- **No circular imports.** Each layer depends only on layers below it.
- **Apps depend only on packages.** Packages never import app code.
- **@vroom/api is the only gateway to the backend.** Apps talk to the API through the ApiClient interface and React Query hooks.
- **Shared packages export types, not implementations.** If a package exports a function, it must be pure (no I/O, no state mutation).

### 2. Server State vs. View State

- **Server state (cache):** Data fetched from the API—trips, deliveries, user profile, payment methods. Managed by TanStack React Query v5.
  - Single source of truth is the React Query cache.
  - Mutations invalidate related cache entries.
  - Queries refetch with configurable stale times and polling intervals.
  
- **View state:** Local UI state—form drafts, UI toggles, tab selection, modal visibility. Managed by Zustand.
  - Local to a feature (e.g., ride booking form state).
  - Never persisted to the backend directly; user must explicitly submit.
  - Can be reset on navigation or dismissal.

**No blending:** A component doesn't write to TripStatus directly; it dispatches a cancellation mutation through React Query, and the cache updates automatically.

### 3. Mock/HTTP Swap Seam

The API client is swappable at **one point:**

```ts
// packages/api/src/client.ts
export function createApiClient(cfg: ApiClientConfig): ApiClient {
  if (cfg.mode === 'mock') {
    return createMockClient();   // In-memory, time-based state machine
  }
  return createHttpClient(cfg.baseUrl ?? '');  // Real backend
}
```

**Benefits:**
- **Consumers never know the difference.** Apps depend only on `ApiClient` interface and React Query hooks.
- **Changing modes is a one-line env var.** Set `VROOM_API_MODE=http` and `VROOM_API_BASE_URL=https://api.example.com`.
- **No adapter patterns needed.** The interface is the same; just return a different implementation.
- **Development & testing are zero-friction.** Mock mode works offline and reproduces deterministically.

### 4. Platform-Agnostic Packages

Packages in `/packages/*` contain **no platform-specific imports:**

- **No React Native or React DOM in packages.** Only pure TypeScript and cross-platform libraries (zod, zustand, react-query).
- **Theme tokens are numbers and strings.** Apps render using platform primitives (View + StyleSheet for mobile, div + CSS for web).
- **UI hooks are headless.** They manage state; apps apply presentation.
- **No file I/O or platform-specific APIs in packages.** Config loading is the app's responsibility.

This allows the same package exports to be consumed by mobile, web, admin, or any future consumer.

### 5. Strict TypeScript

All code compiles with strict compiler settings:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "verbatimModuleSyntax": true,
  "moduleResolution": "Bundler"
}
```

**Benefits:**
- **Branded IDs prevent type confusion.** A `UserId` can never be passed where a `TripId` is expected.
- **Discriminated unions force exhaustive case matching.** Missing a case on `TripStatus.kind` is a compile error.
- **No implicit `any`.** All types are explicit.
- **Prevents accidental export of internal types.** Re-exports are intentional.

---

## Folder Structure

### Root

```
vroom/
├── packages/               # Built, shared workspaces
├── apps/                   # Mobile & web (TBD)
├── .github/workflows/      # CI/CD
├── node_modules/           # pnpm installs here
├── .env.example            # Environment template
├── tsconfig.base.json      # Root TypeScript config
├── tsconfig.json           # Root TypeScript config (references base)
├── pnpm-workspace.yaml     # Workspace definition
├── turbo.json              # Turborepo task graph
├── package.json            # Root package definition
├── pnpm-lock.yaml          # Lockfile
├── .prettierrc              # Prettier config
├── eslint.config.mjs       # ESLint config
└── docs/                   # Documentation
```

### Packages

Each shared package follows a consistent structure:

```
packages/my-package/
├── src/
│   ├── index.ts            # Barrel export
│   ├── [feature].ts        # Implementation files
│   └── ...
├── package.json            # Package metadata
├── tsconfig.json           # Local TypeScript config
└── README.md               # (Optional) package-specific docs
```

All exports go through `src/index.ts` (barrel export). Internal files use relative imports or are not exported.

**Package.json conventions:**
```json
{
  "name": "@vroom/package-name",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

### Apps

(TBD, but the structure will be:)

```
apps/mobile/
├── src/
│   ├── app/                # Expo Router / file-based routing
│   ├── components/         # Feature-scoped and shared components
│   ├── hooks/              # Local hooks (integrate @vroom/ui hooks)
│   ├── stores/             # Zustand stores
│   ├── main.tsx            # Entry point
│   └── ...
├── app.json                # Expo config
├── package.json
└── tsconfig.json

apps/web/
├── src/
│   ├── routes/             # React Router route definitions
│   ├── components/         # Feature-scoped and shared components
│   ├── hooks/              # Local hooks
│   ├── stores/             # Zustand stores
│   ├── main.tsx            # Entry point
│   ├── index.html          # HTML template
│   └── ...
├── vite.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## Package Responsibility Table

| Package | Exports | Depends On | Consumed By |
|---------|---------|-----------|-------------|
| **@vroom/types** | Domain entities (User, Trip, Delivery, etc.), branded IDs, state machines (TripStatus, DeliveryStatus, etc.), interfaces (ApiClient, etc.) | — | All packages & apps |
| **@vroom/constants** | Feature flags, navigation config, label lookup maps, as-const enums | — | All packages & apps |
| **@vroom/utils** | Pure functions: money (format, parse), geo (haversine distance), dates, Result<T,E>, branded ID builders, formatters | — | All packages & apps |
| **@vroom/validation** | Zod schemas for all inputs (auth, ride, delivery, payment, profile, support) | zod | @vroom/api, apps |
| **@vroom/config** | loadConfig(rawEnv) → typed AppConfig, schema, API mode enum | @vroom/validation | Apps (at boot) |
| **@vroom/theme** | Design tokens (palette, spacing, typography), semantic colors (light/dark), ThemeTokens composite type | — | Web & mobile apps |
| **@vroom/assets** | SVG logomark/wordmark strings, illustration registry (canonical keys) | — | Web & mobile apps, docs |
| **@vroom/api** | ApiClient interface, createApiClient factory, mock & http implementations, React Query hooks (createApiHooks), error types, fixtures | @vroom/types, @vroom/constants, @vroom/utils, @vroom/validation, @tanstack/react-query | Apps, tests |
| **@vroom/ui** | Platform-agnostic React hooks (useDisclosure, useStepper, useAsyncStatus, etc.), style descriptors | @vroom/types, @vroom/constants, @vroom/utils | Web & mobile apps |

---

## Build Waves

Turborepo executes tasks in dependency order. Builds happen in waves:

### Wave 1: Root-level tasks

```bash
pnpm install
```

### Wave 2: Core packages (no interdependencies)

Parallel:
- `packages/types` → typecheck, build
- `packages/constants` → typecheck, build
- `packages/utils` → typecheck, build
- `packages/validation` → typecheck, build
- `packages/theme` → typecheck, build
- `packages/assets` → typecheck, build

### Wave 3: Packages that depend on Wave 2

Parallel:
- `packages/config` → typecheck, build (depends on validation)
- `packages/ui` → typecheck, build (depends on types, constants, utils)

### Wave 4: Packages that depend on Wave 3

Parallel:
- `packages/api` → typecheck, build (depends on types, constants, utils, validation)

### Wave 5: Apps

Parallel:
- `apps/mobile` → typecheck, dev/build (depends on all packages)
- `apps/web` → typecheck, dev/build (depends on all packages)

Turborepo caches each step, so re-runs only build what changed.

---

## TypeScript Configuration

### Base Config (`tsconfig.base.json`)

The root config defines:
- Strict compiler flags
- Path aliases for all packages
- Module resolution strategy

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "composite": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@vroom/types": ["packages/types/src"],
      "@vroom/types/*": ["packages/types/src/*"],
      "@vroom/validation": ["packages/validation/src"],
      "@vroom/validation/*": ["packages/validation/src/*"],
      "@vroom/api": ["packages/api/src"],
      "@vroom/api/*": ["packages/api/src/*"],
      "@vroom/ui": ["packages/ui/src"],
      "@vroom/ui/*": ["packages/ui/src/*"],
      "@vroom/theme": ["packages/theme/src"],
      "@vroom/theme/*": ["packages/theme/src/*"],
      "@vroom/utils": ["packages/utils/src"],
      "@vroom/utils/*": ["packages/utils/src/*"],
      "@vroom/constants": ["packages/constants/src"],
      "@vroom/constants/*": ["packages/constants/src/*"],
      "@vroom/config": ["packages/config/src"],
      "@vroom/config/*": ["packages/config/src/*"],
      "@vroom/assets": ["packages/assets/src"],
      "@vroom/assets/*": ["packages/assets/src/*"]
    }
  }
}
```

### Local Configs

Each package has a minimal `tsconfig.json` that references the base:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

---

## Key Design Decisions

### Why Branded IDs?

```ts
type UserId = Brand<string, 'UserId'>;
type TripId = Brand<string, 'TripId'>;

const userId: UserId = crypto.randomUUID() as UserId;
const tripId: TripId = crypto.randomUUID() as TripId;

// Compile error: cannot pass UserId where TripId expected
api.getTrip(userId);  // ❌ TypeScript error
api.getTrip(tripId);  // ✓ OK
```

Branded IDs prevent accidental type confusion at compile time, which is common in large codebases.

### Why Discriminated Unions for Status?

```ts
type Trip =
  | { kind: 'requested' }
  | { kind: 'matching' }
  | { kind: 'driver_assigned'; driver: Driver; vehicle: Vehicle }
  | { kind: 'in_progress'; driver: Driver; vehicle: Vehicle }
  | { kind: 'completed' }
  | { kind: 'cancelled'; cancelledBy: 'rider' | 'driver' | 'system'; reason: string };

// TypeScript forces you to handle every state
function renderTrip(trip: Trip): ReactNode {
  switch (trip.kind) {
    case 'requested':
      return <WaitingForDriver />;
    case 'driver_assigned':
      // `trip.driver` and `trip.vehicle` are guaranteed to exist
      return <DriverArriving driver={trip.driver} vehicle={trip.vehicle} />;
    // ... etc
  }
}
```

This prevents accessing `trip.driver` on a trip that has no driver, and forces UI logic to be exhaustive.

### Why React Query for Server State?

- **Automatic cache invalidation** after mutations.
- **Built-in polling** and stale-time management.
- **Optimistic updates** with rollback on error.
- **Background refetch** while screen is visible.
- **DevTools** for debugging cache state.

### Why Zustand for View State?

- **Minimal boilerplate** compared to Redux or Context API.
- **No provider hell.** Create a store, subscribe, done.
- **Easy to test.** Mock store creation in tests.
- **Scales well.** Multiple independent stores or one global store.

### Why Separate Packages?

- **Dependency clarity.** Which packages does my app actually use?
- **Versioning isolation.** Update @vroom/api independently of @vroom/theme.
- **Testing in isolation.** Mock dependencies, test the package alone.
- **Reuse across apps.** Mobile, web, admin all import the same @vroom/types.
- **Build speed.** Turborepo caches per-package, not per-file.

---

## Environment & Deployment

### Development

```bash
# Copy template
cp .env.example .env

# Fill in values (defaults to mock)
VROOM_API_MODE=mock

# Run dev servers
pnpm dev
```

### Production

```bash
# .env for production
VROOM_API_MODE=http
VROOM_API_BASE_URL=https://api.vroom.example.com

# Build
pnpm build

# Mobile: EAS build (see build-and-deploy.md)
# Web: Deploy dist/ to CDN + configure SPA redirects
```

See [build-and-deploy.md](build-and-deploy.md) for detailed deployment steps.

---

## Common Tasks

### Adding a New Domain Entity

1. Define the type in `packages/types/src/[domain].ts`
2. Export from `packages/types/src/index.ts`
3. Add constants (labels, statuses) to `packages/constants/src/[domain].ts`
4. Add validation schema to `packages/validation/src/[domain].ts`
5. Add API contracts and hooks to `packages/api/src/contracts/[domain].ts` and `packages/api/src/query/hooks.ts`
6. Implement mock fixture in `packages/api/src/mock/fixtures.ts`

### Adding a New API Endpoint

1. Define request/response types in `packages/api/src/contracts/[domain].ts`
2. Add method to `ApiClient` interface in `packages/api/src/client.ts`
3. Implement in `createMockClient` (mock) and `createHttpClient` (http)
4. Add React Query hook to `createApiHooks` in `packages/api/src/query/hooks.ts`
5. Export hook from `packages/api/src/query/index.ts`

### Adding a New UI Component

In the app (mobile or web), not in packages:

1. Create `src/components/[feature]/[ComponentName].tsx`
2. Use `@vroom/ui` hooks for headless logic
3. Use `@vroom/theme` tokens for styling
4. Import domain types from `@vroom/types`

---

## Continuous Integration

The repository includes GitHub Actions workflows (in `.github/workflows/`) for:

- **Typecheck:** Run `pnpm typecheck` on all packages.
- **Lint:** Run `pnpm lint` with ESLint.
- **Format check:** Verify code matches Prettier formatting.
- **Build:** Run `pnpm build` to ensure no breaking changes.

All checks must pass before merging to main.

---

## Further Reading

- [domain-model.md](domain-model.md) — Entity definitions and state machine diagrams
- [navigation.md](navigation.md) — Mobile and web navigation architecture
- [api-contracts.md](api-contracts.md) — API endpoint groups and contracts
- [state-flows.md](state-flows.md) — Data flow from UI to API to cache
- [conventions.md](conventions.md) — Naming, structure, and code patterns
- [build-and-deploy.md](build-and-deploy.md) — Production build and deployment
