# ResumeSummary AI (Resume AI Summarizer & Optimizer)

ResumeSummary AI is an AI-powered web application that helps users generate recruiter-ready professional resume summaries from their existing resumes.

This commit represents the initial project initialization, setting up the workspace configurations, layout shell, and theme utilities.

---

## 🛠️ Project Setup & Configuration (Step 1)

This commit establishes the configuration parameters, environment guidelines, global styling systems, and the application layout shell:

*   **Next.js Workspace Framework**: Configured Next.js (App Router) and TypeScript configurations.
*   **Tailwind CSS Integration**: Set up global styles, Tailwind configuration, and CSS variables.
*   **Theme Engine Provider**: Integrated class-based theme switcher support to toggle dark/light modes.
*   **Base Framework Utilities**: Created helper utilities (`src/lib/utils.ts`), custom Framer Motion animation constants (`src/lib/animations.ts`), and baseline application configurations.

---

## 📂 Initial File Registry

This commit introduces the following base structure files:

*   `package.json` / `package-lock.json` — Dependency management.
*   `next.config.ts` — Next.js compilation configurations.
*   `tsconfig.json` — Strict compiler configuration parameters for TypeScript.
*   `postcss.config.mjs` / `eslint.config.mjs` / `components.json` — Linting and component styling controls.
*   `src/app/globals.css` — Global styles, borders, and variables.
*   `src/app/layout.tsx` — Entry layout wrapper integrating CSS and theme provider.
*   `src/components/common/theme-provider.tsx` — Next-themes system context provider.
*   `src/lib/utils.ts` / `src/lib/animations.ts` / `src/lib/constants.ts` — Baseline helper functions and motion animations.

---

## ⚙️ Getting Started

### 1. Installation
Install the project dependencies:
```bash
npm install
```

### 2. Run Local Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the initialized shell.
