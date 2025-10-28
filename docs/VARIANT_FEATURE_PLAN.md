Variant configuration per store — design & rollout

Goal
Allow each organization to define which attributes are used as product variants, and provide a per-store toggle to enable/disable variants.

What I implemented now
- Migration SQL draft: `migrations/20251028_add_variant_attribute_definitions_and_use_variants.sql`.
- `useProductVariants` updated to prefer server-side ordering and server-returned rows but with safe fallbacks.
- Test skeleton and `vitest` added to `package.json`.
- Docs for key rotation and a feature plan draft.

Phased rollout (recommended)
1) Apply migration (adds `variant_attribute_definitions` table and `use_variants` column). No data destruct.
2) UI: Admin page to manage attribute definitions (per org) and toggle `use_variants`.
3) ProductVariantManager reads definitions and renders inputs dynamically. Keep legacy compatibility (color/size fallback).
4) Optional: normalize variant storage into a values table and migrate old columns.

Next steps I can take (choose):
- Create the admin UI to manage definitions.
- Update ProductVariantManager to render dynamic fields based on definitions (with fallback).
- Write policies for PostgREST to allow org admins to manage their definitions and super_admins to manage all.

Testing & validation
- Unit tests for the hook and UI components.
- Small e2e flow: create definitions → create variants → simulate sale → verify stock.

Risks & considerations
- Ensure policies and permissions are set correctly.
- When definitions change, validate how existing variants map to new definitions.
- Keep migrations non-destructive for safety.
