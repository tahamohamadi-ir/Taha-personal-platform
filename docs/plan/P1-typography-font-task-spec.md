# Task Spec — P1 bilingual typography and gateway visual refinement

**Status:** Completed locally; staging re-deploy pending the owner sudo handoff.  

## Goal

Replace the temporary system-font stack with a minimal self-hosted bilingual
font pair and refine the Language Gateway so the two language choices have equal
visual weight while preserving the project's Navy/Turquoise/Gold editorial-tech
direction.

## Decision proposal

- `Vazirmatn Variable` for Persian/Arabic-script text.
- `Inter Variable` for English/Latin-script text.
- Both packages are OFL-1.1 and loaded locally; no remote font request.
- Do not use Exo/Roboto Mono as the primary pair: the generic skill result is
  technology-oriented but does not provide the same Persian readability and
  bilingual consistency.

## In scope

- Add the two font packages and lock them in `apps/web/package-lock.json`.
- Apply locale-aware font stacks in `global.css`.
- Refine gateway glass fallback, language-action parity and identity hierarchy.
- Record the decision in ADR-0019, Manifest, Deferred Validation and Work Log.

## Non-goals

- No remote Google Fonts import, heavy animation, new palette, new logo geometry,
  React island or CMS/API.
- No change to the public copy or route contract.

## Verification

- `npm run check`
- `npm run build`
- `npm audit --audit-level=high`
- Inspect generated CSS for both local `@font-face` families and HTML for the
  corrected bilingual gateway hierarchy.

## Rollback

Revert the task-owned commit; the previous system stack remains the fallback.
