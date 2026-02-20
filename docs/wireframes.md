# Secret Sips — Wireframes & Page Architecture

## Design System

The application uses a **glassmorphism** design language with a dark theme foundation. The color identity centers on a purple-to-pink gradient palette with amber accents for interactive elements.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `oklch(0.13 0.03 280)` | Page background, deep purple-black |
| Card | `oklch(0.18 0.03 280)` | Card surfaces with glass effect |
| Primary | `oklch(0.55 0.25 290)` | Purple accent, buttons, links |
| Accent | `oklch(0.65 0.25 330)` | Pink accent, highlights |
| Muted | `oklch(0.25 0.02 280)` | Subtle backgrounds |
| Foreground | `oklch(0.93 0.01 280)` | Primary text |

### Glass Effects

All cards and interactive surfaces use backdrop-blur with semi-transparent backgrounds, creating a frosted glass appearance. Three levels of glass intensity are defined: `.glass` (subtle), `.glass-strong` (prominent), and `.glass-card` (interactive hover state).

## Page Architecture

### 1. Home (Landing Page)

The landing page serves as the primary entry point with a hero section featuring the tagline "Unlock the Secret Menu" in a large gradient text treatment. Below the hero, a stats bar shows community metrics (recipes, members, AI creations, ratings). The page continues with a trending recipes carousel, feature highlights (AI Mixer, Barista Mode, Import, Community), and a call-to-action section.

### 2. Explore

A full-width recipe grid with a sticky search bar and horizontal category filter chips. Categories include Pretty n Pink, Mad Matchas, Blues Clues, Foam Frenzy, Mocha Magic, Budget Babe Brews, Caramel Dreams, Merry Mocha, and Viral Today. Each recipe is displayed as a glass card with image, name, category badge, vote count, and quick-action buttons for favoriting and viewing.

### 3. Recipe Detail

A single-recipe view with full-bleed image, recipe metadata (calories, caffeine, price, prep time), ingredient list with type badges, step-by-step instructions, and a "Barista Mode" call-to-action button. Community voting is prominently displayed. Related recipes appear at the bottom.

### 4. AI Drink Mixer (Blue Ocean)

An interactive form with sliders and selectors for sweetness level (0-10), caffeine preference, temperature, flavor notes (multi-select chips), dietary needs, budget, and mood. A prominent "Mix My Drink" button triggers AI generation. Results display the created recipe with a confetti animation.

### 5. Barista Mode

A step-by-step ordering guide displayed as numbered cards. Each step shows what to say to the barista, with ingredient details and tips. A progress indicator shows completion. The estimated total price is displayed at the bottom.

### 6. Import Recipe

Three import methods presented as tabs: URL Import (paste a social media link), Image Import (upload or drag-and-drop a photo), and Manual Entry (form-based recipe creation). Each method shows a preview of the extracted/entered recipe before saving.

### 7. Favorites & My Recipes

Grid layouts similar to Explore but filtered to the user's saved/created recipes. My Recipes includes edit and delete actions.

### 8. Profile

User avatar, name, email, role badge, and join date. Token balance prominently displayed. Quick stats for recipes created and favorites saved. Token economy explanation section.

### 9. Pricing

Three-column layout for token packs (one-time) and subscription plans (monthly). Popular options highlighted with gradient ring. Stripe test card info displayed at bottom.

### 10. Admin Panel

Tabbed interface with three sections: Recipes (search, approve/hide, toggle trending, delete), Users (list with role badges), and Tickets (status management, resolve action). Stats dashboard at top showing totals.

### 11. Support

Simple form with ticket type selector, subject input, message textarea, and submit button. FAQ section below with common questions.

## Navigation

The top navigation bar includes: logo/brand, Explore, AI Mixer, Import, Favorites, My Recipes links. Right side shows theme toggle, accessibility settings, and user avatar dropdown (profile, pricing, admin if applicable, logout). Mobile navigation collapses to a hamburger menu.

## Accessibility Modes

Five modes are available via the settings gear icon:

| Mode | Effect |
|---|---|
| WCAG AAA | Maximum contrast, larger text, focus indicators |
| ECO CODE | Reduced animations, dark backgrounds, minimal repaints |
| NEURO CODE | Calm colors, no flashing, reduced motion, muted palette |
| DYSLEXIC MODE | OpenDyslexic font, increased letter/word spacing |
| NO BLUE LIGHT | Warm color temperature, amber-shifted palette |
