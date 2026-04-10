# POSFITX: MASTER ARCHITECTURAL & DEVELOPMENT SPECIFICATION

## 1. 🎯 Project Overview & Commercial Vision
**PosFitX** is a premium, commercial-grade AI Health Ecosystem. It transcends a standard fitness tracker by acting as a personalized, AI-driven biometric diagnostic and planning tool. 
* **Target Benchmark:** Exceed the visual quality and functional depth of industry leaders (e.g., MyFitnessPal, Whoop).
* **Primary Objective:** Achieve a "Commercial Portfolio Ready" state to attract high-value freelance clients and establish an architecture capable of future monetization (affiliate product integrations, premium content).
* **Local Development Environment:** http://localhost:808x (typically 8080 or 8081)

---

## 2. 🤖 AI Agent & Developer Directives (CRITICAL)
Any AI assistant modifying this codebase MUST adhere to the following rules:
1. **NO AUTO-COMMITS:** The AI must NEVER stage, commit, or push changes to the repository unless explicitly instructed by the developer. Provide the code and wait for manual implementation/review.
2. **Vibe Coding Support:** The developer utilizes an AI-assisted rapid development workflow. Provide complete, copy-pasteable functional blocks rather than abstract snippets. Anticipate the next logical step in the architecture.
3. **Clean Presentation:** Ensure all auto-generated templates, generic READMEs, and placeholder comments are removed or replaced with professional, PosFitX-specific documentation to maintain a white-label, client-ready repository.

---

## 3. 🎨 UI/UX & Design System (Premium & Adaptive)
The application must feel like a high-end, futuristic health diagnostic tool. Avoid static color hardcoding; utilize a scalable, semantic theme system capable of seamless Light/Dark mode transitions.

* **Core Aesthetic:** "Luxury Cyber-Medical" / Premium Tech-Fitness.
* **Component Styling:**
  * **Surfaces:** Utilize adaptive glassmorphism (frosted glass effects via `backdrop-filter`), layered semantic depths (elevation shadows), and subtle translucent borders.
  * **Interactions:** Implement smooth, 3D-like kinetic transitions using Framer Motion. Elements must react to user touch (e.g., glowing borders on hover, soft scaling, haptic-style visual feedback).
  * **Diagnostic Visuals:** Incorporate "Scanning" laser effects, directional interactive visuals, and high-tech metric displays during active AI assessments.
* **Media & Content:** Replace all text-only standard boxes with premium media containers capable of embedding dynamic, high-resolution imagery, looping exercise GIFs, or YouTube instructional integrations.
* **Monetization Spaces:** UI layouts must dynamically accommodate "Product Promotion Spaces" (e.g., fitness gear, supplements). These must feel like native, highly relevant recommendations rather than intrusive ads. If no core tasks exist, these spaces move to primary focus.

---

## 4. ⚙️ Engineering Guardrails & System Architecture

### A. Scalability & Modularity
* **Component Architecture:** Strictly adhere to atomic design principles. UI elements (cards, buttons, charts) must be highly modular, reusable, and decoupled from business logic.
* **State Management:** Separate UI state from server state. Use custom hooks (e.g., `useWeightHistory`, `useWorkoutHistory`) to isolate Supabase data fetching and AI edge function calls.

### B. Security & Data Integrity
* **JWT & Edge Functions:** All AI generation and sensitive data processing must occur server-side via Supabase Edge Functions with strict JWT authentication and rate-limit handling.
* **No Mock Data:** The application must strictly rely on functional database logic. Eliminate all hardcoded mock arrays and placeholder statistics.
* **Database Triggers:** Ensure PostgreSQL triggers (e.g., `handle_new_user`) are strictly synchronized with the current schema, preventing silent failures on user instantiation.

### C. Functionality & Compatibility
* **Responsive Design:** The UI must be flawlessly responsive, prioritizing a mobile-first layout suitable for gym environments, scaling gracefully to desktop dashboards.
* **Error Handling:** Implement graceful fallbacks and skeleton loaders for all asynchronous operations (e.g., AI plan generation, video fetching). The UI must never crash to a blank screen due to missing or mis-typed data.

### D. Testing & Reviewing
* **Type Safety:** Maintain strict TypeScript compliance. Avoid `any` types. Ensure all database row types match the Supabase schema definitions.
* **Console Hygiene:** Code must execute with zero console errors or warnings in the production build.

---

## 5. 🗺️ Development Roadmap: Past, Present, & Future

### Phase 1: Foundation & Data Integrity (Current Focus)
* **Goal:** Eradicate mock data and establish a true connection with the backend.
* **Tasks:**
  * Fix the broken `handle_new_user` database trigger (remove legacy `email` column reference).
  * Build the `generate-plans` Supabase Edge Function (connecting user profile data -> Lovable AI Gateway/Gemini Flash -> Structured JSON).
  * Build and integrate real data hooks (`useWeightHistory`, `useWorkoutHistory`, `useMealHistory`).
  * Implement dynamic dashboard statistics (e.g., real streak calculations via `daily_tasks` table).

### Phase 2: The Premium Visual Upgrade (Portfolio Readiness)
* **Goal:** Elevate the UI to the "Luxury Cyber-Medical" standard.
* **Tasks:**
  * Refactor Plans/Progress pages to utilize the adaptive glassmorphism design system.
  * Implement dynamic media containers for AI-generated exercises and meals.
  * Integrate the Splash Screen and interactive camera scanning visuals with directional guidance.
  * Implement the Adaptive Light/Dark mode context.

### Phase 3: Ecosystem Expansion (Future Scale)
* **Goal:** Transition from a portfolio piece to a functional, monetizable platform.
* **Tasks:**
  * Develop the dynamic media fetching engine (parsing top-viewed YouTube tutorials based on AI plan output).
  * Activate the Marketplace Integration, replacing fake promo components with live affiliate product feeds.
  * Expand the AI Posture Engine capabilities and historical trend reporting.

---
*Document Version: 1.0 | Core Stack: Vite, React, TS, Tailwind, Supabase, MediaPipe, Framer Motion*