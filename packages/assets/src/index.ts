/**
 * @file index.ts
 * Barrel export for @vroom/assets — platform-neutral brand asset references.
 *
 * This package contains:
 *   - Inline SVG string exports for the Vroom logomark and wordmark (logo.ts)
 *   - A typed illustration registry that maps canonical keys to descriptors,
 *     enabling per-platform resolution of raster/Lottie files (illustrations.ts)
 *
 * What is NOT here
 * ----------------
 * - Binary image data (PNGs, WebPs, Lottie JSON) — add those to the consuming
 *   app's own asset folder and resolve via the IllustrationId key.
 * - React, React Native, or any UI framework imports.
 * - Platform-specific file-system or require() calls.
 *
 * See each source file's JSDoc for platform consumption guidance.
 */

// --- Logo SVG strings ---
export { logoMarkSvg, logoWordmarkSvg, brandColors } from './logo.js';
export type { BrandColors } from './logo.js';

// --- Illustration registry ---
export {
  illustrations,
  illustrationList,
} from './illustrations.js';
export type {
  IllustrationId,
  IllustrationDescriptor,
} from './illustrations.js';
