// ---------------------------------------------------------------------------
// Environment schema + ApiMode type
// ---------------------------------------------------------------------------
export { envSchema, firebaseEnvSchema, API_MODES } from './env.js';
export type { ApiMode, EnvInput, FirebaseEnvInput } from './env.js';

// ---------------------------------------------------------------------------
// AppConfig + loadConfig + defaultConfig + Firebase config
// ---------------------------------------------------------------------------
export { loadConfig, defaultConfig, loadFirebaseConfig } from './config.js';
export type { AppConfig, FirebaseConfig } from './config.js';
