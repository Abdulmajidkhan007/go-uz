/**
 * @file spacing.ts
 * Spatial and layering tokens for the Vroom design system.
 *
 * Consumption paths
 * -----------------
 * Web (Tailwind):   spread `spacing` into `theme.extend.spacing` and `radius`
 *                   into `theme.extend.borderRadius`; map `zIndex` into
 *                   `theme.extend.zIndex`.
 * Mobile (RN):      use numeric values directly in StyleSheet — RN treats all
 *                   dimensions as logical dp (density-independent pixels).
 *
 * All spacing values follow a strict 4 pt grid so that web px and RN dp
 * remain visually equivalent on standard-density screens.
 */

// ---------------------------------------------------------------------------
// Spacing scale — 4 pt grid (numbers, not strings, so RN can consume directly)
// ---------------------------------------------------------------------------
export const spacing = {
  /** 4 dp / px  — tight internal padding */        xs:   4,
  /** 8 dp / px  — small gap */                     sm:   8,
  /** 12 dp / px — compact element padding */       md:  12,
  /** 16 dp / px — default content padding */       lg:  16,
  /** 20 dp / px — comfortable padding */           xl:  20,
  /** 24 dp / px — section gap */                  '2xl': 24,
  /** 32 dp / px — card padding / large gap */     '3xl': 32,
  /** 40 dp / px — section vertical rhythm */      '4xl': 40,
  /** 48 dp / px — hero / screen padding */        '5xl': 48,
  /** 64 dp / px — generous section separation */  '6xl': 64,
} as const;

// ---------------------------------------------------------------------------
// Border-radius scale
// ---------------------------------------------------------------------------
export const radius = {
  /** 4 px  — subtle rounding (inputs, chips) */     sm:   4,
  /** 8 px  — cards, dropdowns */                    md:   8,
  /** 12 px — sheets, large cards */                 lg:  12,
  /** 20 px — pill buttons, badges */                xl:  20,
  /** 9999  — fully circular (avatars, FABs) */     full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Z-index stack
// Defined as a deliberate ladder so layers never collide accidentally.
// ---------------------------------------------------------------------------
export const zIndex = {
  /** Default document flow */             base:     0,
  /** Dropdowns, autocomplete popups */    dropdown: 100,
  /** Bottom-sheets, drawers */            sheet:    200,
  /** Modal dialogs, overlays */           modal:    300,
  /** Toast / snackbar notifications */   toast:    400,
} as const;

export type Spacing  = typeof spacing;
export type Radius   = typeof radius;
export type ZIndex   = typeof zIndex;
