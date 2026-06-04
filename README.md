# Vroom: Ride-Hailing + Courier Delivery Super-App

Production-grade monorepo for a ride-hailing and parcel delivery super-app. Built with strict TypeScript, pnpm workspaces, and Turborepo.

- **Mobile:** Expo (React Native) with React Navigation and Reanimated
- **Web:** React + Vite + TailwindCSS + Material UI with React Router
- **State:** Zustand (view) + TanStack React Query v5 (server/cache)
- **Shared:** 9 compiled packages (types, constants, utils, validation, config, theme, assets, api, ui)

All packages are built and typecheck-clean. Mobile and web apps are **in progress**.

---

## Monorepo Structure

```
vroom/
├── packages/                          # 9 shared, built packages
│   ├── types/                        # Domain entities, branded IDs, state machines
│   ├── constants/                    # Feature flags, navigation, lookups
│   ├── utils/                        # Pure helpers (money, geo, date, Result)
│   ├── validation/                   # Zod input schemas (single source of truth)
│   ├── config/                       # Platform-agnostic app config loader
│   ├── theme/                        # Design tokens (palette, spacing, typography)
│   ├── assets/                       # SVG logomark, wordmark, illustrations
│   ├── api/                          # ApiClient interface + mock + http, React Query hooks
│   └── ui/                           # Platform-agnostic headless hooks + style descriptors
├── apps/                             # Mobile & web (TBD)
│   ├── mobile/                       # Expo + React Native (in progress)
│   └── web/                          # Vite + React (in progress)
├── .env.example                      # Environment template
├── tsconfig.base.json                # Root TypeScript config (strict mode)
├── package.json                      # Workspace root
├── pnpm-workspace.yaml               # pnpm workspace definition
├── turbo.json                        # Turborepo task config
└── docs/                             # Documentation
```

---

## Package Responsibilities

| Package | Owns | Must Not Own | Depends On | Consumed By |
|---------|------|--------------|-----------|-------------|
| **@vroom/types** | Domain entities (User, Trip, Delivery, Order), branded IDs, discriminated-union state machines (TripStatus, DeliveryStatus, PaymentState), interfaces | Runtime code, exports, utilities | — | All packages & apps |
| **@vroom/constants** | Feature flags, navigation config (DEEP_LINK_SCHEME='vroom', WEB_BASE_PATH='/app'), label maps, as-const lookups | Logic, validation | — | All packages & apps |
| **@vroom/utils** | Pure helpers: money (format, parse), geo (haversine), date, Result<T,E>, branded ID creation, string/number format | I/O, state, React | — | All packages & apps |
| **@vroom/validation** | Zod input schemas (auth, ride, delivery, payment, profile, support) — single source of truth | Execution, persistence | zod | Apps directly, @vroom/api |
| **@vroom/config** | Platform-agnostic loadConfig(rawEnv) → typed AppConfig with apiMode 'mock'\|'http' | React, platform code | @vroom/validation | Apps (at boot) |
| **@vroom/theme** | Design tokens (indigo #5a35f0 primary, amber #ffb300 accent), 4pt spacing, radius, typography, semantic light/dark maps | Platform-specific rendering | — | Web & mobile apps |
| **@vroom/assets** | Original SVG logomark/wordmark, illustration registry (canonical keys → platform-agnostic descriptors) | Binary blobs, platform imports | — | Web & mobile apps, docs |
| **@vroom/api** | ApiClient interface, mock backend (in-memory store + ticker), http stub, React Query hooks (createApiHooks), error discriminated union | App logic, persistence | @vroom/types, @vroom/constants, @vroom/utils, @vroom/validation | Apps + tests |
| **@vroom/ui** | Platform-agnostic React hooks (useDisclosure, useStepper, useAsyncStatus), token-driven style descriptors | Platform rendering, navigation | @vroom/types, @vroom/constants, @vroom/utils | Web & mobile apps |

---

## Quick Start

### Prerequisites

- **Node.js 20+** (check `.nvmrc`)
- **pnpm 9+** (monorepo package manager)
- **.env file** (copy `.env.example` and configure)

### Installation & Development

```bash
# Install dependencies
pnpm install

# Run all dev servers (mobile + web parallel)
pnpm dev

# Type-check all packages and apps
pnpm typecheck

# Build all packages
pnpm build

# Lint all files
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

### Running Mobile (Expo)

```bash
cd apps/mobile

# Start Expo dev server
pnpm dev
# Then press 'i' for iOS or 'a' for Android simulator

# Alternatively, use Expo CLI directly
pnpm expo start

# Build APK for testing
eas build -p android --profile preview

# Build AAB for production
eas build -p android --profile production
```

See [build-and-deploy.md](docs/build-and-deploy.md) for detailed EAS instructions.

### Running Web

```bash
cd apps/web

# Start Vite dev server
pnpm dev
# Opens at http://localhost:5173 (or next available)

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

**Shared (read by @vroom/config):**
- `VROOM_API_MODE` — 'mock' (default) or 'http'
- `VROOM_API_BASE_URL` — Base URL for the real backend (required if mode='http')

**Mobile (Expo — prefixed EXPO_PUBLIC_):**
- `EXPO_PUBLIC_API_MODE`
- `EXPO_PUBLIC_API_BASE_URL`

**Web (Vite — prefixed VITE_):**
- `VITE_API_MODE`
- `VITE_API_BASE_URL`

Mock mode requires no additional setup; all data is in-memory with time-based state progression.

---

## Root Scripts

All scripts run via Turborepo, executing tasks in parallel across all workspaces:

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Start all dev servers (mobile + web) |
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | Type-check all packages and apps (strict mode) |
| `pnpm lint` | Lint all files (ESLint) |
| `pnpm test` | Run tests across all packages and apps (if configured) |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Remove node_modules, dist, .turbo, build artifacts |

---

## Tech Stack

### Language & Build

- **Language:** TypeScript 5.6+ with strict compiler flags
  - `strict: true`
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `verbatimModuleSyntax: true`
  - `moduleResolution: "Bundler"`
- **Monorepo:** pnpm 9+ workspaces + Turborepo 2+
- **Runtime:** Node 20+

### Mobile

- **Framework:** Expo (latest SDK)
- **Runtime:** React Native + TypeScript
- **Navigation:** React Navigation with stack, tab, and modal navigators
- **Animations:** Reanimated 2+
- **Deep-linking:** Configured scheme `vroom://` with path-based routing

### Web

- **Framework:** React 18+ + Vite + TypeScript
- **Styling:** TailwindCSS + Material UI
- **Navigation:** React Router with SPA routing
- **Animations:** Framer Motion

### State Management

- **View State:** Zustand (lightweight, no boilerplate)
- **Server/Cache State:** TanStack React Query v5 (automatic cache, polling, mutations)
- **Forms:** React Hook Form + Zod validation
- **Config:** @vroom/config with environment validation

### Shared Packages

All packages are **zero-dependency** except where noted:

- **@vroom/types** — no dependencies
- **@vroom/constants** — no dependencies
- **@vroom/utils** — no dependencies
- **@vroom/validation** — zod@4+
- **@vroom/config** — @vroom/validation, zod@4+
- **@vroom/theme** — no dependencies
- **@vroom/assets** — no dependencies
- **@vroom/api** — @tanstack/react-query@5, @vroom/{types,constants,utils,validation}
- **@vroom/ui** — no dependencies (React hooks only; no rendering)

---

## Status

### Completed

- [x] **Packages:** All 9 shared packages are built, exported, and typecheck-clean.
- [x] **Domain Model:** Fully typed entities with discriminated-union state machines.
- [x] **API Layer:** Mock client with in-memory store + deterministic ticker; http stub ready for production API.
- [x] **Validation:** Single source of truth for all input schemas (Zod).
- [x] **Design System:** Complete token set (palette, spacing, typography, semantic colors).
- [x] **React Query Hooks:** Full hook factory for all API endpoints with optimistic updates and polling.

### In Progress

- [ ] **apps/mobile** — Expo app with auth flow, ride booking, delivery, tracking, payments, support.
- [ ] **apps/web** — Vite app with the same feature set, responsive design.

### Future

- Backend REST/GraphQL API (real implementation against @vroom/api contracts)
- Admin portal (apps/admin with role-based access)
- Push notifications (FCM/OneSignal)
- Real maps SDK (Google Maps / Mapbox integration)
- Analytics & crash reporting (Segment, Sentry)

---

## Documentation

- [**architecture.md**](docs/architecture.md) — Core principles, dependency graph, package structure, build waves
- [**domain-model.md**](docs/domain-model.md) — Entity definitions and state machine diagrams
- [**navigation.md**](docs/navigation.md) — Mobile (React Navigation) and web (React Router) navigation maps, deep-linking
- [**api-contracts.md**](docs/api-contracts.md) — API endpoint groups, request/response types, hooks list, error handling
- [**state-flows.md**](docs/state-flows.md) — User flows (ride booking, delivery) from UI to API to cache
- [**conventions.md**](docs/conventions.md) — Naming, file size, feature-folder structure, loading/error/empty patterns
- [**build-and-deploy.md**](docs/build-and-deploy.md) — Expo EAS build steps (APK/AAB), web deployment, extending to backend/admin

---

## Contributing

### Code Quality

All code must:
- Pass TypeScript strict mode
- Pass ESLint rules
- Be formatted with Prettier
- Have no circular imports

### Pull Request Workflow

1. Create a feature branch
2. Make changes in packages/ (or apps/ if working on a feature)
3. Run `pnpm typecheck && pnpm lint && pnpm format`
4. Create a pull request with a clear description
5. Ensure all checks pass

### Extending the Monorepo

**Adding a new shared package:**
```bash
mkdir -p packages/my-package/src
# Create package.json, tsconfig.json, src/index.ts
# Add to pnpm-workspace.yaml if not auto-detected
# Update tsconfig.base.json paths
```

**Adding a new app:**
```bash
mkdir -p apps/my-app
# Create package.json, tsconfig.json, src/
# Configure app-specific build (Expo for mobile, Vite for web)
```

---

## License

Private / Internal Use Only

---

## Contact

For questions or issues, reach out to the team or file an issue in the repository.
