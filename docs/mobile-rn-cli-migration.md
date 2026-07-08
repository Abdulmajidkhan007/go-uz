# Mobile: Expo → bare React Native CLI migration

`apps/mobile` was migrated from **Expo (SDK 53)** to **bare React Native CLI
(RN 0.79.4)**. All Expo packages, config, and env plumbing were removed. The
JS/config/deps layer is complete and typechecks. The steps below cannot run in
CI/cloud (no Android SDK / Xcode) and must be done on a local machine to produce
a runnable app.

## What already changed (committed)

- `package.json`: `main` → `index.js`; RN CLI scripts; Expo deps removed;
  `@react-native-async-storage/async-storage`, `react-native-vector-icons`,
  `react-native-config` added, plus RN CLI / babel / metro / typescript-config
  dev deps.
- `index.js` + `app.json` entry point (app name `vroom`).
- `App.tsx`: dropped `registerRootComponent`; RN `StatusBar` (`barStyle`).
- `navigation/index.tsx`: `react-native-vector-icons/Ionicons`.
- `babel.config.js` / `metro.config.js`: RN CLI presets, monorepo watch folders.
- Env now read via `react-native-config` (`import Config from 'react-native-config'`)
  with **bare** `VROOM_*` / `GOOGLE_MAPS_KEY` names (no `EXPO_PUBLIC_` prefix).
- Added the previously-missing `src/lib/storage.ts` (AsyncStorage-backed zustand
  `StateStorage`).
- Added the previously-missing `src/lib/location.ts` (imported by
  `screens/onboarding.tsx`). It was an Expo-era wrapper absent from the repo;
  reimplemented dependency-free using RN core `PermissionsAndroid` for the
  permission grant. Fetching coordinates needs a native geolocation module
  (e.g. `@react-native-community/geolocation`) wired later — currently returns
  `{ granted: false }` on iOS.
- Deleted `app.config.ts` and `eas.json`.

## 1. Install

From the repo root (pnpm workspace):

```bash
pnpm install
```

## 2. Generate the native `android/` and `ios/` projects

There is no `android/`/`ios/` in the repo. Generate them from a scratch RN
project of the same version and copy them in. Use app name **`vroom`** so it
matches `apps/mobile/app.json`.

```bash
cd /tmp
npx @react-native-community/cli init VroomNative --version 0.79.4 --skip-install
# copy the native folders into the app
cp -R VroomNative/android /home/user/go-uz/apps/mobile/android
cp -R VroomNative/ios     /home/user/go-uz/apps/mobile/ios
```

Then fix identifiers to match the old Expo config:

- **Application id / bundle id**: `com.vroom.app`
  - Android: `android/app/build.gradle` (`namespace`, `applicationId`), and the
    `package`/manifest + Java/Kotlin `MainActivity`/`MainApplication` paths.
  - iOS: Xcode target → `PRODUCT_BUNDLE_IDENTIFIER = com.vroom.app`.
- **Registered component name** must be `vroom`:
  - Android `MainActivity.getMainComponentName()` → `"vroom"`.
  - iOS `AppDelegate` `moduleName` → `"vroom"`.

## 3. Google Maps native key (react-native-maps)

The JS reads the key via `Config.GOOGLE_MAPS_KEY`, but the native SDKs need it
wired too. See the react-native-maps installation guide.

- **Android** — `android/app/src/main/AndroidManifest.xml`, inside `<application>`:
  ```xml
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="${GOOGLE_MAPS_KEY}" />
  ```
  (The `${GOOGLE_MAPS_KEY}` placeholder is resolved by react-native-config's
  gradle integration — see step 5 — or hardcode/inject via manifestPlaceholders.)
- **iOS** — `ios/<app>/AppDelegate.(mm|swift)`:
  ```objc
  #import <GoogleMaps/GoogleMaps.h>
  // in didFinishLaunchingWithOptions, before RN setup:
  [GMSServices provideAPIKey:@"YOUR_KEY"]; // or read from Config
  ```
  and add `pod 'GoogleMaps'` to `ios/Podfile`.

## 4. react-native-vector-icons fonts

The Ionicons glyphs need the font files bundled.

- Easiest: `npx react-native-asset` (picks up fonts from the package).
- Manual:
  - Android — add to `android/app/build.gradle`:
    ```gradle
    apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
    ```
  - iOS — add the font files to the target and list them under `UIAppFonts`
    in `Info.plist` (e.g. `Ionicons.ttf`), then `pod install`.

## 5. react-native-config native setup

So `apps/mobile/.env` is read at build time:

- **Android** — in `android/app/build.gradle`, near the top:
  ```gradle
  apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
  ```
- **iOS** — add a "Build Phase" run script per the react-native-config docs
  (copies `.env` into the build), and `pod install`.

Create `apps/mobile/.env` with the bare keys (see root `.env.example` mobile
section):

```
VROOM_API_MODE=mock
VROOM_API_BASE_URL=
GOOGLE_MAPS_KEY=
VROOM_FIREBASE_API_KEY=
VROOM_FIREBASE_AUTH_DOMAIN=
VROOM_FIREBASE_PROJECT_ID=
VROOM_FIREBASE_APP_ID=
VROOM_FIREBASE_STORAGE_BUCKET=
VROOM_FIREBASE_MESSAGING_SENDER_ID=
```

## 6. Permissions & deep links (carried over from the deleted app.config.ts)

- **Location**
  - Android `AndroidManifest.xml`:
    ```xml
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    ```
  - iOS `Info.plist`:
    - `NSLocationWhenInUseUsageDescription` = "Vroom needs your location to find
      nearby drivers and set your pickup point."
    - `NSLocationAlwaysAndWhenInUseUsageDescription` = "Vroom needs your location
      to track active rides."
- **Deep links** — scheme `vroom` + universal links `https://app.vroom.uz/order`
  and `/track`. The JS side (`src/navigation/linking.ts`) is unchanged; only the
  native intent-filters / associated-domains need setup:
  - Android `AndroidManifest.xml` — `<intent-filter android:autoVerify="true">`
    with `<data android:scheme="vroom"/>` and the two `https` `app.vroom.uz`
    `pathPrefix` entries (`/order`, `/track`), category `BROWSABLE`/`DEFAULT`.
  - iOS — add the `vroom` URL scheme (`CFBundleURLTypes`) and the
    `applinks:app.vroom.uz` Associated Domain.

## 7. Build & run

```bash
cd apps/mobile/ios && pod install && cd -
pnpm --filter @vroom/mobile android   # or: react-native run-android
pnpm --filter @vroom/mobile ios       # or: react-native run-ios
```

## Notes

- Native reanimated is enabled via the babel plugin (kept last in
  `babel.config.js`).
- Metro is configured for the pnpm monorepo (workspace watch folders + both
  `node_modules` paths) and `unstable_enablePackageExports` so `@vroom/api/firebase`
  and the Firebase SDK subpath exports resolve.
