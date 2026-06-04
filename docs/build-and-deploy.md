# Build and Deploy

Production build and deployment instructions for Expo (mobile) and Vite (web), plus guidance on extending to a real backend and admin portal.

---

## Table of Contents

1. [Mobile (Expo EAS)](#mobile-expo-eas)
2. [Web (Vite)](#web-vite)
3. [Environment Setup](#environment-setup)
4. [Extending to Backend/Admin](#extending-to-backendadmin)

---

## Mobile (Expo EAS)

### Prerequisites

```bash
# Install Expo CLI globally
npm install -g eas-cli@latest

# Verify installation
eas --version
```

### EAS Project Setup

If the project is not yet linked to EAS:

```bash
cd /home/user/go-uz/apps/mobile

# Link to an EAS project (creates eas.json)
eas project:create

# Or configure an existing project:
eas project:init
```

This creates `eas.json` with build profiles.

### eas.json Configuration

Example `apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 8.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "service-account.json",
        "track": "internal"
      }
    }
  }
}
```

**Profiles explained:**
- **preview (APK):** For testing on devices before production. APK is installable directly.
- **production (AAB):** For Play Store submission. Android App Bundle (AAB) is required for store distribution.

### Environment Variables for Build

Set up `.env.local` or environment variables for the build:

```bash
# For mock mode (development/testing)
EXPO_PUBLIC_API_MODE=mock
EXPO_PUBLIC_API_BASE_URL=

# For HTTP mode (production)
# EXPO_PUBLIC_API_MODE=http
# EXPO_PUBLIC_API_BASE_URL=https://api.vroom.example.com
```

**In GitHub Actions or CI/CD:**

```yaml
# .github/workflows/build.yml
name: EAS Build (Android)
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g eas-cli@latest
      - run: pnpm install
      - env:
          EXPO_PUBLIC_API_MODE: mock
        run: eas build -p android --profile preview
      # Or for production:
      # - env:
      #     EXPO_PUBLIC_API_MODE: http
      #     EXPO_PUBLIC_API_BASE_URL: https://api.vroom.example.com
      #   run: eas build -p android --profile production
```

### Build Commands

#### Preview Build (APK, for testing)

```bash
cd /home/user/go-uz/apps/mobile

# Build APK for testing
eas build -p android --profile preview

# Monitor build progress
# Once complete, download APK and install on device:
# adb install path/to/build.apk
```

#### Production Build (AAB, for Play Store)

```bash
cd /home/user/go-uz/apps/mobile

# Build AAB
eas build -p android --profile production

# This creates a signed AAB ready for Google Play Console
```

#### iOS Builds

```bash
# iOS preview (requires Apple Developer account)
eas build -p ios --profile preview

# iOS production (for App Store)
eas build -p ios --profile production
```

### Managing Secrets

For production builds, store API keys and signing credentials securely:

```bash
# Using EAS Secrets (recommended)
eas secret:create

# Set via command line
eas secret:create --name API_BASE_URL --value https://api.vroom.example.com
eas secret:create --name API_MODE --value http

# Use in app.json:
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguard": true
          }
        }
      ]
    ],
    "env": {
      "production": {
        "plugins": [
          [
            "expo-env-setup",
            {
              "API_BASE_URL": "@env:API_BASE_URL"
            }
          ]
        ]
      }
    }
  }
}
```

### Submitting to Google Play

After building the AAB:

```bash
# Automatic submission (requires Play Store credentials)
eas submit -p android --profile production

# Or manual submission:
# 1. Go to Google Play Console: https://play.google.com/console
# 2. Create or select your app
# 3. Internal Testing → Create release
# 4. Upload the AAB
# 5. Review, test, then promote to production track
```

---

## Web (Vite)

### Build Command

```bash
cd /home/user/go-uz/apps/web

# Production build (generates dist/)
pnpm build

# Output:
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-HASH.js
# │   ├── index-HASH.css
# │   └── ...
# └── ...
```

The `dist/` folder is a static site ready for deployment.

### Local Testing Before Deployment

```bash
# Preview the production build locally
pnpm preview

# Open http://localhost:5173 (or next available port)
# Test all features with the same build that will be deployed
```

### Environment Variables

Vite uses `VITE_*` prefix for client-side env vars.

**File: `apps/web/.env.production`**

```bash
VITE_API_MODE=http
VITE_API_BASE_URL=https://api.vroom.example.com
VITE_APP_TITLE=Vroom
```

**File: `apps/web/.env.development`**

```bash
VITE_API_MODE=mock
VITE_API_BASE_URL=
```

These are baked into the bundle at build time, so rebuild for each environment.

### Deploy Targets

#### Option 1: Netlify

**Setup (first time):**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Authenticate
netlify login

# Link project to Netlify
cd /home/user/go-uz/apps/web
netlify init

# Create netlify.toml
cat > netlify.toml << 'EOF'
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Environment variables
[env.production]
  VITE_API_MODE = "http"
  VITE_API_BASE_URL = "https://api.vroom.example.com"
EOF
```

**Deploy:**

```bash
# Preview build
pnpm build
netlify deploy --prod --dir=dist

# Or deploy automatically on git push (configure in Netlify dashboard)
# Settings → Build & Deploy → GitHub → Connect repository
```

#### Option 2: Vercel

**Setup:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /home/user/go-uz/apps/web
vercel

# For production:
vercel --prod
```

**Configure in `vercel.json`:**

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_MODE": "http",
    "VITE_API_BASE_URL": "@API_BASE_URL"
  }
}
```

Then set environment variable in Vercel Dashboard:
- Settings → Environment Variables
- Add `API_BASE_URL = https://api.vroom.example.com`

#### Option 3: AWS S3 + CloudFront

```bash
# Build
pnpm build

# Upload to S3
aws s3 sync dist/ s3://vroom-app-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD \
  --paths "/*"
```

**SPA Redirect Configuration (Critical):**

Ensure all 404s redirect to `index.html` so React Router can handle routing:

- **S3:** Set up routing rules or use CloudFront function
- **Netlify:** Automatic (via netlify.toml)
- **Vercel:** Automatic (via rewrites in vercel.json)

### Monitoring & Analytics

Add monitoring to catch runtime errors:

```ts
// apps/web/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project-id",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## Environment Setup Checklist

### Before Building

- [ ] Node.js 20+ installed (`node --version`)
- [ ] pnpm 9+ installed (`pnpm --version`)
- [ ] `.env` file created (copy from `.env.example`)
- [ ] All packages built: `pnpm build`
- [ ] All tests pass: `pnpm test` (if configured)
- [ ] Code lints: `pnpm lint`
- [ ] Types check: `pnpm typecheck`

### Before Deploying to Production

**Mobile (Expo):**
- [ ] App version updated in `app.json` (e.g., `1.0.0`)
- [ ] App name & description finalized
- [ ] Icons and splash screens in place
- [ ] API endpoint set to production (`EXPO_PUBLIC_API_BASE_URL`)
- [ ] Release notes prepared
- [ ] Test APK verified on device
- [ ] Privacy policy & terms of service drafted

**Web:**
- [ ] Custom domain configured (if not using Vercel/Netlify default)
- [ ] SSL certificate active
- [ ] `index.html` title and meta tags updated
- [ ] Open Graph tags for social sharing added
- [ ] API endpoint set to production (`VITE_API_BASE_URL`)
- [ ] Analytics initialized (e.g., Sentry, Segment)
- [ ] 404 redirect configured for SPA routing

---

## Extending to Backend/Admin

### Phase 1: Real Backend API

Currently, `packages/api` uses a **mock client** with in-memory data and a deterministic ticker. To integrate with a real backend:

#### 1. Implement HTTP Client

```ts
// packages/api/src/http/httpClient.ts
import type { ApiClient, ApiClientConfig } from '../client.js';
import type {
  AuthApi,
  RideApi,
  DeliveryApi,
  // ... etc
} from '../endpoints/index.js';
import { mapHttpErrorToApiError } from './errorMapper.js';

export function createHttpClient(baseUrl: string): ApiClient {
  // Create a fetcher with base URL, auth token, error handling
  const fetcher = createFetcher(baseUrl);

  return {
    authApi: {
      async requestOtp(req) {
        const res = await fetcher.post('/auth/request-otp', req);
        return { ok: true, value: res };
      },
      async verifyOtp(req) {
        const res = await fetcher.post('/auth/verify-otp', req);
        return { ok: true, value: res };
      },
      // ... etc
    },
    rideApi: {
      async rideQuote(req) {
        const res = await fetcher.post('/rides/quote', req);
        return { ok: true, value: res };
      },
      // ... etc
    },
    // ... other API groups
  };
}

// Helper fetcher with auth, error mapping
function createFetcher(baseUrl: string) {
  return {
    async post(path: string, body: unknown) {
      const token = await getAuthToken();  // From secure storage
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw mapHttpErrorToApiError(res);
      }

      return res.json();
    },
  };
}
```

#### 2. Update Config

The app already uses `loadConfig()` which reads `VROOM_API_MODE` and `VROOM_API_BASE_URL`:

```ts
// Already works; just change env vars
const config = loadConfig(process.env);  // or import.meta.env

const client = createApiClient({
  mode: config.apiMode,        // 'http'
  baseUrl: config.apiBaseUrl,  // 'https://api.vroom.example.com'
});
```

#### 3. Define REST/GraphQL API Contracts

Create a shared API specification (OpenAPI/GraphQL schema) that both backend and frontend implement:

```yaml
# api/openapi.yaml
openapi: 3.0.0
info:
  title: Vroom API
  version: 1.0.0
paths:
  /rides/quote:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RideQuoteReq'
      responses:
        200:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FareQuote'

components:
  schemas:
    RideQuoteReq:
      type: object
      properties:
        pickup:
          $ref: '#/components/schemas/GeoPoint'
        dropoff:
          $ref: '#/components/schemas/GeoPoint'
        vehicleClass:
          enum: [ economy, comfort, premium ]
    # ... etc
```

The backend implements these contracts, and `packages/api` types already match.

#### 4. Token Management

Update auth flow to store and refresh tokens:

```ts
// apps/mobile/src/stores/useAuthStore.ts
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create((set) => ({
  session: null,

  async setSession(session: Session) {
    await SecureStore.setItemAsync('session', JSON.stringify(session));
    set({ session });
  },

  async getSession() {
    const stored = await SecureStore.getItemAsync('session');
    return stored ? JSON.parse(stored) : null;
  },

  async clearSession() {
    await SecureStore.deleteItemAsync('session');
    set({ session: null });
  },
}));
```

On app launch, restore session from storage and refresh token if needed.

---

### Phase 2: Admin Portal

Once the backend is live, create an admin app:

```
apps/admin/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Trips.tsx
│   │   ├── Deliveries.tsx
│   │   ├── Payments.tsx
│   │   └── ...
│   ├── hooks/
│   ├── stores/
│   ├── components/
│   └── main.tsx
├── vite.config.ts
├── package.json
└── tsconfig.json
```

**Reuse from packages:**

```ts
// Admin uses the same @vroom/api, @vroom/types, @vroom/theme
import { createApiClient, createApiHooks } from '@vroom/api';
import type { User, Trip, Delivery, Payment } from '@vroom/types';
import { palette, spacing } from '@vroom/theme';

// Only difference: admin needs different auth (service account, API key)
const adminClient = createApiClient({
  mode: 'http',
  baseUrl: 'https://api.vroom.example.com',
  // Optionally: headers: { 'X-Admin-Key': '...' }
});

const api = createApiHooks(adminClient);

// In a dashboard page:
function UserManagement() {
  const { data: users, isLoading, error } = api.useUsers();  // Extended hook
  return <UserTable users={users} />;
}
```

Extend the API interface in `packages/api` with admin-only endpoints:

```ts
// packages/api/src/endpoints/admin.ts
export interface AdminApi {
  listUsers(filter?: { role?: Role }): Promise<Result<User[], ApiError>>;
  updateUser(id: UserId, updates: Partial<User>): Promise<Result<User, ApiError>>;
  suspendUser(id: UserId): Promise<Result<void, ApiError>>;
  listAllTrips(): Promise<Result<Trip[], ApiError>>;
  // ... etc
}

// packages/api/src/client.ts
export interface ApiClient {
  authApi: AuthApi;
  rideApi: RideApi;
  // ... existing
  adminApi?: AdminApi;  // Optional, for admin portal only
}
```

---

### Phase 3: Push Notifications

Once the backend is ready, integrate push notifications:

**Mobile (Firebase Cloud Messaging):**

```bash
cd /home/user/go-uz/apps/mobile
eas secret:create --name FCM_SENDER_ID --value "your-fcm-sender-id"
eas secret:create --name FCM_SERVER_KEY --value "your-fcm-server-key"

pnpm add expo-notifications
```

```ts
// apps/mobile/src/services/notifications.ts
import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications() {
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.projectId,
    })
  ).data;

  // Send token to backend
  await api.notificationsApi.registerPushToken({
    platform: 'android',
    token,
  });

  // Handle incoming notifications
  Notifications.addNotificationResponseListener(({ notification }) => {
    const { tripId, deliveryId } = notification.request.content.data;
    if (tripId) {
      navigation.navigate('ActivityTab', { screen: 'tracking', params: { tripId } });
    }
  });
}
```

**Web (Service Worker + Web Push):**

```ts
// apps/web/src/services/notifications.ts
export async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register('/sw.js');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'your-vapid-public-key',
  });

  // Send subscription to backend
  await api.notificationsApi.registerPushToken({
    platform: 'web',
    subscription: subscription.toJSON(),
  });
}
```

Backend receives tokens and can push via Firebase, AWS SNS, or similar.

---

### Phase 4: Real Maps & Location

Replace demo geo services with real map provider:

**Google Maps:**

```bash
pnpm add @react-native-google-maps/maps  # Mobile
pnpm add @react-google-maps/api           # Web
```

```tsx
// apps/mobile/src/components/Map.tsx
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

function DestinationInput() {
  return (
    <GooglePlacesAutocomplete
      onPress={(data, details) => {
        setDestination({
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng,
        });
      }}
    />
  );
}
```

```tsx
// apps/web/src/components/Map.tsx
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

function LiveMap({ trip }) {
  return (
    <GoogleMap zoom={14} center={trip.route?.[0]}>
      <Polyline path={trip.route} />
      <Marker position={trip.route[-1]} label="You are here" />
    </GoogleMap>
  );
}
```

Backend `GET /geo/autocomplete` can still use the mock implementation, or delegate to Google Places API.

---

## Rollback Procedures

### Mobile (Expo)

If a production build has a critical bug:

```bash
# Build a fix version (bump version in app.json)
eas build -p android --profile production

# Users will be prompted to update on next app launch (via EAS Updates)
# Or push a hotfix via EAS Updates (no rebuild needed):
eas update --branch production
```

### Web

```bash
# Revert to previous deployment
# On Netlify: go to Deploys tab, select previous deploy, click "Publish"
# On Vercel: go to Deployments, select previous, click Redeploy
# On S3: restore previous files from S3 versioning or re-run deploy script
```

---

## Monitoring & Logging

### Error Tracking

```ts
// Both apps
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://...@sentry.io/...",
  environment: import.meta.env.MODE,
});

// Catch React errors
const ErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: <ErrorFallback />,
});
```

### Analytics

```ts
// apps/mobile/src/services/analytics.ts
import { Analytics } from '@react-native-firebase/analytics';

export const logEvent = (name: string, params?: Record<string, any>) => {
  Analytics().logEvent(name, params);
};

// Usage
logEvent('ride_booking', { vehicleClass: 'economy', estimatedFare: 1200 });
```

```ts
// apps/web/src/services/analytics.ts
import * as gtag from 'gtag.js';

export const logEvent = (name: string, params?: Record<string, any>) => {
  gtag.event(name, params);
};
```

### Performance Monitoring

Use Sentry, Firebase Performance, or similar:

```ts
import * as Sentry from "@sentry/react";

const withProfiler = Sentry.withProfiler;

export default withProfiler(MyComponent);
```

---

## Further Reading

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Vite Docs: https://vitejs.dev
- Netlify: https://netlify.com/docs
- Vercel: https://vercel.com/docs
- React Router SPA: https://reactrouter.com/docs
- Sentry: https://sentry.io/docs
