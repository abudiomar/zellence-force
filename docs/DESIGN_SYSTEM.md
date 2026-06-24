# Zellence — Design System & Brand Guide

A reference for the colors, typography, fonts, and theming used across the Zellence landing pages and app. Derived from [app/(front)/layout.tsx](<../app/(front)/layout.tsx>), [app/layout.tsx](../app/layout.tsx), [app/globals.css](../app/globals.css), and [tailwind.config.js](../tailwind.config.js).

**Brand essence:** Warm, premium, gold-on-cream by day and gold-on-charcoal by night. Arabic-native (RTL-aware) AI automation for Gulf teams.

---

## 1. Theme System (Light / Dark Mode)

Theming is driven by [`next-themes`](../app/layout.tsx) using the `class` strategy (`darkMode: ["class"]` in [tailwind.config.js](../tailwind.config.js)).

- **Default:** `system` (follows OS preference), with `enableSystem`.
- **Implementation:** semantic CSS custom properties defined as HSL triplets in [app/globals.css](../app/globals.css), under `:root` (light) and `.dark` (dark).
- Tailwind maps each token to a utility color (e.g. `bg-background`, `text-foreground`, `bg-primary`) in [tailwind.config.js](../tailwind.config.js).

> **Note on the landing pages:** The front-end marketing pages (Navbar, Footer, Hero, etc.) largely use **hardcoded hex brand colors** rather than the semantic tokens — they present a fixed light/cream aesthetic with dark accent surfaces (e.g. the charcoal navbar). The semantic light/dark token system is primarily consumed by the **dashboard / app** UI. See §6.

### Semantic Tokens

| Token                  | Light (`:root`)                     | Dark (`.dark`)                        | Tailwind utility          |
| ---------------------- | ----------------------------------- | ------------------------------------- | ------------------------- |
| `--background`         | `40 33% 97%` — warm cream `#FAF8F4` | `30 10% 8%` — warm charcoal `#161514` | `bg-background`           |
| `--foreground`         | `30 15% 12%` — warm near-black      | `40 20% 92%` — cream white            | `text-foreground`         |
| `--card`               | `0 0% 100%` — pure white            | `30 8% 12%` — dark warm gray          | `bg-card`                 |
| `--card-foreground`    | `30 15% 12%`                        | `40 20% 92%`                          | `text-card-foreground`    |
| `--popover`            | `0 0% 100%`                         | `30 8% 10%`                           | `bg-popover`              |
| `--primary`            | `38 72% 42%` — rich gold `#CDA028`  | `40 68% 52%` — bright gold `#D4AD37`  | `bg-primary`              |
| `--primary-foreground` | `0 0% 100%` — white on gold         | `30 10% 8%` — dark on gold            | `text-primary-foreground` |
| `--secondary`          | `40 20% 93%` — warm light gray      | `30 5% 18%`                           | `bg-secondary`            |
| `--muted`              | `40 20% 93%`                        | `30 5% 16%`                           | `bg-muted`                |
| `--muted-foreground`   | `30 8% 48%` — warm mid-gray         | `30 8% 60%`                           | `text-muted-foreground`   |
| `--accent`             | `38 72% 42%` (unified w/ primary)   | `40 68% 52%`                          | `bg-accent`               |
| `--border`             | `35 18% 88%` — warm border          | `30 5% 20%`                           | `border-border`           |
| `--input`              | `35 18% 88%`                        | `30 5% 22%`                           | `border-input`            |
| `--ring`               | `38 72% 42%` — gold focus ring      | `40 68% 52%`                          | `ring-ring`               |
| `--radius`             | `0.65rem`                           | —                                     | `rounded-lg`              |

### Status / Feedback Colors

| Token           | Light         | Dark          | Utility          |
| --------------- | ------------- | ------------- | ---------------- |
| `--destructive` | `0 72% 51%`   | `0 62% 45%`   | `bg-destructive` |
| `--success`     | `142 60% 35%` | `142 55% 42%` | `bg-success`     |
| `--warning`     | `38 90% 50%`  | `38 85% 55%`  | `bg-warning`     |
| `--info`        | `210 70% 48%` | `210 65% 55%` | `bg-info`        |

### Chart Palette (gold-complementary)

| Token       | Light                     | Dark                 |
| ----------- | ------------------------- | -------------------- |
| `--chart-1` | `38 72% 42%` (gold)       | `40 68% 52%`         |
| `--chart-2` | `173 58% 39%` (teal)      | `160 55% 45%`        |
| `--chart-3` | `20 70% 52%` (terracotta) | `20 65% 55%`         |
| `--chart-4` | `43 74% 66%` (light gold) | `43 70% 60%`         |
| `--chart-5` | `30 50% 45%` (warm brown) | `340 60% 55%` (pink) |

### Sidebar Tokens

Dedicated sidebar surface tokens exist (`--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`) for the dashboard navigation, all keyed to the cream/gold (light) and charcoal/gold (dark) palettes.

---

## 2. Brand Color Palette (Landing Pages)

The marketing pages use a curated set of hardcoded hex values. These are the brand's "true" colors. Grouped by role:

### Gold / Accent (the signature)

| Hex                                        | Usage                                                   |
| ------------------------------------------ | ------------------------------------------------------- |
| `#D9B756` / `#d9b56c`                      | Logo wordmark gold (navbar / footer)                    |
| `#CDA028`                                  | Rich gold — hover state for primary CTA                 |
| `#b77805`                                  | Deep amber-gold — links, icons, footer CTA gradient end |
| `#c69a30` / `#c6...`                       | Gradient start (footer CTA), mid-gold                   |
| `#d4a84b`                                  | Sparkle / decorative gold accent                        |
| `#A67C00`, `#8E6C12`, `#7D5E00`            | Darker bronze-gold shades                               |
| `#F5D46A`, `#e9bd68`, `#e3c88a`, `#e9c98b` | Light/highlight golds                                   |

### Dark / Charcoal Surfaces

| Hex                             | Usage                                                 |
| ------------------------------- | ----------------------------------------------------- |
| `#171513`                       | Navbar background, dark surface, primary-on-gold text |
| `#2a2621`, `#342E25`, `#3B342A` | Dark warm borders / elevated dark surfaces            |
| `#1a1a1a`                       | Near-black                                            |

### Cream / Light Surfaces

| Hex                                        | Usage                            |
| ------------------------------------------ | -------------------------------- |
| `#fdf6ea`                                  | Footer background (warm cream)   |
| `#FAF8F3` / `#FFFDF8` / `#fffaf0`          | Page / section cream backgrounds |
| `#ffffff`                                  | White cards                      |
| `#E5D9C1`, `#E8DEC9`, `#D8C79D`, `#D8D0C2` | Warm sand borders / dividers     |

### Neutral Text (slate)

| Hex                                        | Usage                         |
| ------------------------------------------ | ----------------------------- |
| `#0f172a`                                  | Headings (slate-900) on light |
| `#645D51`, `#746B5E`, `#5B554B`, `#6D6253` | Warm gray body text           |
| `#94a3b8`                                  | Muted slate (slate-400)       |

> Footer / body also use Tailwind's built-in `slate-200/400/500` utilities for secondary text and borders.

### Supporting Accents (illustrations / badges)

| Hex                                        | Usage                      |
| ------------------------------------------ | -------------------------- |
| `#10b981`, `#11867a`, `#2b877c`, `#3b9e8f` | Teal / emerald accents     |
| `#c55432`, `#b24f2f`, `#f8dfd4`            | Terracotta / coral accents |

---

## 3. Typography & Fonts

Fonts are loaded via `next/font/google` in [app/layout.tsx](../app/layout.tsx) and exposed as CSS variables, then wired into Tailwind's `fontFamily` in [tailwind.config.js](../tailwind.config.js).

| Role                   | Font                 | CSS variable              | Tailwind class                                | Notes                                                             |
| ---------------------- | -------------------- | ------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| Body / UI              | **DM Sans**          | `--font-body`             | `font-sans` (default)                         | Latin subset, `display: swap`                                     |
| Headings / display     | **Playfair Display** | `--font-heading`          | `font-heading`                                | Serif, used for headlines & logo                                  |
| Arabic (dashboard RTL) | **Noto Sans Arabic** | `--font-dashboard-arabic` | — (applied via `.dashboard-shell[dir="rtl"]`) | Loaded in [app/dashboard/layout.tsx](../app/dashboard/layout.tsx) |

The `<body>` applies `font-sans` (DM Sans) globally. Body font feature settings: `"kern" 1, "liga" 1, "rlig" 1, "calt" 1` with `text-rendering: optimizeLegibility`.

### Type Scale (utility classes from [app/globals.css](../app/globals.css))

| Class              | Size / Weight                                 | Font               |
| ------------------ | --------------------------------------------- | ------------------ |
| `.text-display`    | `text-4xl` bold, tracking-tight               | heading (Playfair) |
| `.text-heading-1`  | `text-3xl` bold, tracking-tight               | heading            |
| `.text-heading-2`  | `text-2xl` semibold, tracking-tight           | heading            |
| `.text-heading-3`  | `text-xl` semibold, tracking-tight            | heading            |
| `.text-body-large` | `text-lg` normal, leading-relaxed             | body               |
| `.text-body`       | `text-base` normal                            | body               |
| `.text-body-small` | `text-sm` normal                              | body               |
| `.text-caption`    | `text-xs` medium, tracking-wide               | body               |
| `.text-overline`   | `text-xs` semibold, uppercase, tracking-wider | body               |

### Landing-page text conventions

- **Logo wordmark:** `font-heading`, `font-bold`, `tracking-widest`, uppercase ("ZELLENCE"), gold.
- **Nav links:** `text-sm`, `font-medium`, `text-white/80` → hover `text-white`.
- **Body copy:** `text-sm`, `leading-relaxed`, warm slate (`text-slate-500`).
- **Section headings (footer):** `text-sm`, `font-bold`, `#0f172a`.
- **Bottom-bar legal:** `text-xs`, `text-slate-400`.

---

## 4. Shape, Elevation & Motion

### Radii

- Base radius `--radius: 0.65rem` → `rounded-lg`; derived `md = radius − 2px`, `sm = radius − 4px`.
- Landing components favor `rounded-full` (navbar pill, buttons, icon chips) and `rounded-2xl` / `rounded-xl` (cards, badges).

### Surface elevation utilities ([app/globals.css](../app/globals.css))

| Class               | Shadow                         |
| ------------------- | ------------------------------ |
| `.surface-elevated` | `0 1px 3px / 0 1px 2px` subtle |
| `.surface-raised`   | `0 2px 8px / 0 1px 2px`        |
| `.surface-floating` | `0 8px 24px / 0 2px 6px`       |

Landing pages also use custom warm-tinted shadows, e.g. navbar `shadow-[0_24px_70px_-42px_rgba(23,21,19,0.85)]` and gold CTA `shadow-[0_6px_20px_-6px_rgba(183,120,5,0.5)]`.

### Motion

| Animation                 | Behavior                                                |
| ------------------------- | ------------------------------------------------------- |
| `.animate-fade-in-up`     | `fadeInUp` 300ms ease-out (opacity + 8px translate)     |
| `.table-row-stagger > tr` | `fadeInRow` 200ms, staggered 30ms→600ms per row         |
| `.shimmer`                | warm muted gradient sweep, 1.6s loop (skeleton loaders) |

CTAs use hover lift (`hover:-translate-y-0.5`) with deepened shadow.

---

## 5. Component Catalog

The UI primitive library lives in [components/ui/](../components/ui/). Components are built on **Radix UI** primitives and styled with **Tailwind + `class-variance-authority` (cva)** variants, composed via the `cn()` helper ([lib/utils](../lib/utils.ts)). They consume **semantic tokens** (so they theme automatically) — distinct from the landing pages, which use fixed brand hex (§2).

### Button — [button.tsx](../components/ui/button.tsx)

Base: `inline-flex`, `rounded-md`, `text-sm font-medium`, 200ms transition, `active:scale-[0.98]`, gold focus ring (`ring-ring`, offset 2). SVG icons auto-sized to `size-4`.

| Variant       | Style                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| `default`     | gold `bg-primary/90` -> hover `bg-primary` + white text, subtle border  |
| `accent`      | solid `bg-accent` (gold)                                                |
| `destructive` | `bg-destructive` -> hover `/90`                                         |
| `outline`     | bordered, transparent -> hover gold border + `bg-primary/5` + gold text |
| `secondary`   | `bg-secondary` warm gray                                                |
| `ghost`       | transparent -> hover `bg-primary/8` + gold text                         |
| `link`        | gold underline-on-hover                                                 |
| `active`      | gold-tinted pressed/selected state (`bg-primary/10`)                    |

**Sizes:** `default` (h-9), `sm` (h-8, text-xs), `lg` (h-10, px-8), `icon` (size-9). Supports `asChild` (Radix Slot) for wrapping `<Link>`.

> Landing CTAs override the variant with custom gold gradients + `rounded-full` (see Hero, Footer).

### Badge — [badge.tsx](../components/ui/badge.tsx)

`rounded-full`, `text-xs font-semibold`, bordered. Variants: `default` (gold tint), `primary` (solid gold), `secondary`, `destructive` / `success` / `warning` / `info` (all `/15`–`/20` tinted with matching text), `outline`.

### Card — [card.tsx](../components/ui/card.tsx)

`rounded-xl`, `border-border/70`, `bg-card`, subtle shadow -> **hover lifts to `0_8px_24px` shadow** (200ms). Sub-parts: `CardHeader`, `CardTitle` (uses `.text-heading-3`), `CardDescription` (`.text-body-small` muted), `CardContent`, `CardFooter`.

### Input — [input.tsx](../components/ui/input.tsx)

`h-9`, `rounded-md`, `border-input`, translucent `bg-background/50`, shadow-sm. Focus -> `ring-2 ring-primary/30` (gold, soft). Placeholder `text-muted-foreground/80`. Date inputs get themed `[color-scheme:light_dark]` picker styling.

### Textarea — [textarea.tsx](../components/ui/textarea.tsx)

`min-h-[80px]`, otherwise matches Input (border-input, `bg-background/50`, gold focus ring).

### Dialog — [dialog.tsx](../components/ui/dialog.tsx) (Radix)

Overlay `bg-black/80` with fade. Content: centered, `max-w-lg`, `bg-card`, `p-6`, `shadow-lg`, `sm:rounded-lg`, with zoom/slide enter-exit animations. `DialogTitle` `text-lg font-semibold tracking-tight`; `DialogDescription` muted. Close button top-right (X icon, opacity hover).

### Separator — [separator.tsx](../components/ui/separator.tsx) (Radix)

`bg-border`, 1px; horizontal (`h-[1px] w-full`) or vertical (`w-[1px] h-full`).

### Theme Toggle — [theme-toggle.tsx](../components/ui/theme-toggle.tsx)

`outline` icon button with animated Sun<->Moon (rotate/scale swap on `.dark`). Dropdown offers Light / Dark / System via `next-themes`. Labels are i18n-overridable.

### Other primitives in the library

Avatar, Checkbox, Command (⌘K palette), Dropdown Menu, Label, Popover, Radio Group, Scroll Area, Select, Sheet (drawer), Sidebar, Skeleton (uses `.shimmer`), Stacked Navigation, Tabs, Tooltip, and the Data Table stack (`data-table`, `server-data-table`, `data-table-toolbar`, `data-table-faceted-filter`) — all Radix-based and token-styled, used primarily in the dashboard.

### Landing sections — [components/layouts/front/](../components/layouts/front/)

Composed marketing blocks (fixed brand palette, not tokens):

- **Navbar** ([Navbar.tsx](../components/layouts/front/Navbar.tsx)): fixed `rounded-full` pill, charcoal `#171513` bg, gold border `#3B342A`, gold logo `#D9B756`, gold CTA (`#D9B756` -> hover `#CDA028`) with dark text.
- **Footer** ([Footer.tsx](../components/layouts/front/Footer.tsx)): cream `#fdf6ea` bg with decorative gold ring borders, translucent white card, gold gradient primary CTA (`#c69a30` -> `#b77805`), outlined secondary CTA, slate body text.
- **Hero** ([home/Hero.tsx](../components/layouts/front/home/Hero.tsx)): `min-h-[95vh]`, cream bg with `HeroLuxuryBackground`, eyebrow pill badge, Playfair display headline (`text-[4rem]` gold-accented span), gold-gradient pill CTA, soft drop-shadowed product mockup.
- **home/** sections: `Stats`, `Features`, `ProblemSection`, `SolutionOverview`, `TargetAudience`, `Testimonial`, `FAQ`, `CTA`, `FinalCTA`.
- **studio/** `StudioHome`, plus `BookingDialog` (front-facing dialog).

---

## 6. Design Philosophy & Principles

The system is intentionally **token-first for the app, brand-fixed for marketing**. Principles to follow:

1. **Two-layer color model.** App/dashboard UI uses **semantic tokens** (`bg-background`, `text-foreground`, `bg-primary`…) so it themes and goes RTL automatically. Marketing pages use the **fixed brand hex palette** (§2) for a deliberate, art-directed look that does _not_ flip with dark mode. Don't mix the two within one layer.

2. **Gold is an accent, not a fill.** Gold (`primary`/`accent`) is reserved for primary actions, the logo, focus rings, and key highlights. Large gold fills cheapen the premium feel — back gold with cream or charcoal.

3. **Stay warm.** Every neutral is warm-tinted — cream backgrounds, sand borders, warm charcoal, warm-gray text. Avoid pure cool grays; prefer the warm slate/cream neutrals already defined.

4. **Serif for voice, sans for work.** Playfair Display (`font-heading`) carries display headlines, hero copy, and the logo wordmark — it sets the editorial, premium tone. DM Sans (`font-sans`) handles all UI, body, and dense text for legibility. Don't use the serif for UI controls or long body copy.

5. **Use the type scale.** Reach for the `.text-display` -> `.text-overline` utilities (§3) instead of ad-hoc sizes, so hierarchy stays consistent.

6. **Soft, layered elevation.** Depth comes from warm, low-opacity shadows and the `surface-*` / Card hover-lift pattern — not hard borders or heavy drop shadows. Interactive elements lift on hover (`hover:-translate-y-0.5`, scale) and press in (`active:scale-[0.98]`).

7. **Generous, rounded geometry.** Pills (`rounded-full`) for nav and CTAs; `rounded-xl`/`rounded-2xl` for cards. Base radius is `0.65rem`. Avoid sharp corners.

8. **Calm, purposeful motion.** Transitions are ~200–300ms ease-out; entrances use `fadeInUp`, lists stagger (`table-row-stagger`), loaders shimmer warmly. Motion should reward interaction, never distract.

9. **Gold focus, always.** Focus states use the gold ring (`ring-ring` / `ring-primary/30`) with an offset — never remove focus visibility for accessibility.

10. **Arabic-native & RTL-first.** Built for Gulf teams: Noto Sans Arabic for Arabic, `dir="rtl"` support, with numeric/date/email/url inputs forced LTR. Design with mirrored layouts in mind, not as an afterthought.

---

## 7. Usage Guidance

- **App / dashboard UI:** Always use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, etc.) so light/dark mode and RTL work automatically.
- **Marketing / landing pages:** Use the brand hex palette in §2. These are intentionally fixed (predominantly the warm cream + gold + charcoal look) and do not flip with dark mode.
- **Build on the primitives.** Compose from [components/ui/](../components/ui/) and the cva variants before writing new styles; extend via the `className` prop + `cn()`.
- **Gold is the brand.** Reserve gold for primary actions, the logo, and key accents — not large fills.
- **Keep it warm.** Neutrals are warm-tinted (cream, sand, warm charcoal), never pure cool gray. Default to warm slates/creams over neutral grays.
- **RTL / Arabic:** Dashboard supports `dir="rtl"`; Arabic text uses Noto Sans Arabic, with numeric/date/email/url inputs forced to LTR. See [app/globals.css](../app/globals.css) `.dashboard-shell[dir="rtl"]` rules.
