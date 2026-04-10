# Design System Specification: The Architectural Curator

## 1. Overview & Creative North Star
The "Architectural Curator" is the guiding philosophy of this design system. In the complex world of requirements management, our goal is to provide a "Digital Sanctuary"—a space where cognitive load is minimized through structural clarity and intentional negative space. 

We break the "standard SaaS" look by moving away from rigid, boxed-in grids. Instead, we use **Asymmetric Breathability** and **Tonal Depth**. By utilizing varying weights of the Manrope and Inter typefaces alongside a sophisticated layering of neutrals, we create an editorial experience that feels less like a database and more like a high-end workspace for critical thinking.

---

## 2. Colors: Tonal Architecture
The palette is rooted in a "Soft Neutral" foundation, punctuated by a singular, authoritative Primary blue.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define major sections. Structural boundaries must be achieved through background shifts. For example, a `surface-container-low` side-panel sitting against a `surface` main content area creates a natural, sophisticated break without the visual "noise" of a line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium paper.
- **Base Layer:** `surface` (#f8f9fa)
- **Recessed Areas:** `surface-container` (#eaeff1) for global navigation or background wrappers.
- **Elevated Content:** `surface-container-lowest` (#ffffff) for primary cards and workspace tiles.
- **Sub-Tier Logic:** If a card needs an inner section, use `surface-container-high` (#e2e9ec) to create a subtle "inset" feel rather than drawing a box.

### The Glass & Gradient Rule
To elevate the professional polish:
- **Floating Elements:** Use `surface-container-lowest` with a 85% opacity and a `24px` backdrop-blur for modals and dropdowns. 
- **Signature CTAs:** Primary actions should use a subtle linear gradient: `primary` (#1353d8) to `primary_dim` (#0047c5) at a 135-degree angle. This adds "soul" and depth to the interaction points.

---

## 3. Typography: The Editorial Scale
We employ a dual-font strategy to balance character with utility. 

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern professional air. Large scales (`display-lg` to `headline-sm`) should use `font-weight: 700` with slight negative letter-spacing (-0.02em) to create an authoritative "Editorial" header look.
*   **Body & Labels (Inter):** The workhorse for requirements. Inter provides maximum legibility at high information densities.
*   **Hierarchy as Navigation:** Use `title-lg` (Inter, 1.375rem) for requirement titles. Use `label-sm` (Inter, 0.6875rem, All Caps, Letter Spacing 0.05em) for metadata like "LAST MODIFIED" or "VERSION 2.1" to create clear distinctions without adding UI chrome.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often heavy and dated. This system prioritizes **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` background. The slight shift from #ffffff to #f1f4f6 is enough to signify a "lift" to the eye.
*   **Ambient Shadows:** Where floating is required (e.g., active drag-and-drop), use: `box-shadow: 0px 12px 32px rgba(43, 52, 55, 0.06)`. Note the color: we use a tinted `on-surface` (#2b3437) at a very low opacity to mimic natural light.
*   **The Ghost Border Fallback:** If high-density data requires a container, use a "Ghost Border": `outline-variant` (#abb3b7) at **15% opacity**.

---

## 5. Components: Precision Elements

### Buttons & Chips
*   **Primary Button:** Gradient-filled (Primary to Primary-Dim), `md` (0.75rem) roundedness. 
*   **Action Chips:** Use `secondary-container` (#d9e3f4) with `on-secondary-container` (#485260) text. Roundness: `full`. No border.
*   **Status Badges:** Use a "Soft Fill" approach. A "High Priority" badge uses `error-container` (#fe8983) at 20% opacity with `on-error-container` (#752121) text.

### Input Fields & Search
*   **Text Inputs:** Use `surface-container-lowest` background with a subtle `outline-variant` Ghost Border. On Focus, the border transforms into a 2px solid `primary` stroke, but only on the bottom edge or as a soft outer glow—never a heavy box.

### Cards & Lists: The No-Divider Rule
*   **Lists:** Forbid 1px dividers between requirement items. Use vertical whitespace (16px - 24px) or a alternating background of `surface` and `surface-container-low`.
*   **Traceability Cards:** Use `md` (0.75rem) rounded corners. Group related requirements using a shared `surface-container` background wrapper rather than individual boxes.

### Requirements-Specific Components
*   **Traceability Link:** A small, `surface-variant` pill with a `label-sm` font.
*   **Version Ghost:** A semi-transparent `tertiary` text string that appears only on hover to maintain a clean interface while keeping history accessible.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme whitespace (32px+) between major functional blocks to signify "calm."
*   **Do** use `on-surface-variant` (#586064) for secondary metadata to create a clear visual hierarchy against primary text.
*   **Do** use `primary` sparingly. It is a "laser pointer," not a "paint brush."

### Don’t:
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#2b3437) to maintain the "Soft Minimalist" aesthetic.
*   **Don't** use standard 4px "web-default" border radii. Use the scale: `0.5rem` (DEFAULT) for buttons and `0.75rem` (md) for cards.
*   **Don't** clutter the view with icons for every action. Use text-based links for a more "Sophisticated Editorial" feel, reserving icons for high-frequency global actions.