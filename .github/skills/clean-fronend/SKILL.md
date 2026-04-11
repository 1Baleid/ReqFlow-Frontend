---
name: frontend
description: Generates modular, high-fidelity, responsive, and internationalized React UI components. Instructs agents to use React 19, Tailwind CSS v4, Framer Motion, and next-intl, prioritizing "code-based visuals" and strict file separation for reusability. Keywords: react, tailwind, modular, frontend, ui-components, framer-motion, i18n, next-intl, architecture.
---

### Functionality
This skill transforms abstract component requests into production-ready, highly modular frontend code. It enforces a strict technology stack and design philosophy, ensuring that any generated UI element is interactively animated, globally accessible, responsive, and visually stunning. Crucially, it enforces software engineering best practices by preventing hardcoding and requiring the extraction of reusable elements into separate files.

### Detailed Instructions
When this skill is active, the agent must strictly adhere to the following development guidelines regardless of the component being built:

1. **Modularity & Reusability:** Never hardcode repeated UI elements or complex configurations in a single file. Break down the UI into single-responsibility sub-components. Extract Framer Motion variants, utility functions, and shared types into separate, dedicated files (e.g., `src/utils/animations.ts`).
2. **Code-Based Visuals:** Construct all aesthetic elements using pure Tailwind CSS utilities (e.g., `backdrop-blur`, `bg-gradient-to-*`, `mix-blend-mode`). Never rely on or request static SVG or PNG assets for decoration.
3. **Strict Localization (i18n):** Never hardcode user-facing text strings. All text must use `next-intl`. Always implement the `useTranslations` hook tailored to the specific component's namespace and output the necessary JSON key structure.
4. **Modern Stack Usage:** Utilize React 19 patterns and Tailwind 4's advanced styling capabilities exclusively. Avoid deprecated hooks or outdated CSS practices.
5. **Responsive-First Design:** Write all styling mobile-first. Incrementally scale layouts using `md:`, `lg:`, and `xl:` breakpoints. 
6. **Motion & Interaction:** Embed `Framer Motion` to orchestrate smooth interactions. Include contextual mount animations and interactive states appropriate for the component's function.

### Expected Agent Behavior
When requested to build a component, the agent will:
1. Analyze the request to determine the necessary file structure (main component, sub-components, utilities).
2. Generate the code, clearly labeled with distinct file paths (e.g., `// File: src/components/Main.tsx`, `// File: src/lib/variants.ts`).
3. Replace all conceptual text with dynamic translation variables (`t('key')`) and provide the accompanying JSON translation snippet.
4. Apply a modern, code-based visual aesthetic using pure Tailwind classes.
5. Abstract animations into reusable variants and wrap interactive elements in Framer Motion components.