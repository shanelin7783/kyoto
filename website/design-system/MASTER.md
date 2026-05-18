# Design system (Kyoto brochure site)

Derived for **travel / tourism brochure**: editorial calm, generous whitespace, readable body text. Aligns with UI UX Pro Max workflow (tourism product, soft organic palette, serif display + geometric sans).

## Tokens (CSS variables in `src/styles/tokens.css`)

| Token | Role |
|-------|------|
| `--color-bg` | Page wash |
| `--color-bg-elevated` | Cards / hero panel |
| `--color-text` | Primary copy |
| `--color-text-muted` | Supporting lines |
| `--color-accent` | CTAs & key accents |
| `--color-accent-soft` | Hover / chips |
| `--font-display` | Hero & section titles |
| `--font-body` | UI copy |

## Patterns

- **Hero**: Gradient veil + large display headline, subhead in muted tone.
- **Day cards**: Rounded `12px`, shadow `0 12px 40px rgba`, border `1px solid` hairline.
- **Links**: Underline on hover, clear focus ring (`outline: 2px solid` + offset).
- **Motion**: Respect `prefers-reduced-motion`; transitions 200–280ms on interactive elements.

## Pre-delivery (static page subset)

- Focus visible on all links and skip link.
- Text contrast target ≥ 4.5:1 on body (light theme).
- No emoji as icons (decorative kanji/locale copy only).
