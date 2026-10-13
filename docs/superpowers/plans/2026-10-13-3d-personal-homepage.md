# Personal 3D Homepage Implementation Plan

> **For agentic workers:** Use subagent-driven-development for the frontend implementation and independent reviews; a model worker creates original local geometry; the controller handles visual QA, integration and release. Steps use checkboxes for tracking.

**Goal:** Replace the old blog with the approved Chinese personal homepage, using the supplied photograph as reference for an original stylized 3D portrait.

**Architecture:** A Vite React static app under `web/` renders accessible HTML over a fixed React Three Fiber scene. Public profile data and model path are independent configuration, and the new GLB is fitted by bounding box with a procedural scroll camera. GitHub Pages publishes only `web/dist`, leaving legacy files available in Git history until final replacement.

**Tech Stack:** React 18, TypeScript, Three.js 0.169, React Three Fiber 8, Vite 8; Node 24 and committed npm lockfile. Vite was upgraded after checking dependency advisories; unused optional libraries were omitted.

---

## Task 1: Frontend implementation

Files: `web/package.json`, `web/package-lock.json`, `web/tsconfig*.json`, `web/vite.config.ts`, `web/eslint.config.js`, `web/index.html`, `web/src/main.tsx`, `web/src/App.tsx`, `web/src/styles.css`, `web/src/data/profile.ts`, `web/src/scene/PortraitScene.tsx`, `web/public/portrait-stylized.webp`, `LICENSE`, `NOTICE`, font licenses, `.gitignore`.

- [x] Copy reference build configuration and licensed fonts only. Do not copy the original author's model, HDR, identity, portfolio assets or content. Preserve MIT attribution in root license/notice.
- [x] Implement all approved profile data verbatim where supplied. Render education plus both employers; keep projects and current job description as the requested “待更新”. No full PDF, age, phone or unrelated information.
- [x] Implement the cinematic green homepage, cream typography, subtle grain, thin frame, compact navigation, right-side biography/timeline, clear contact actions, responsive mobile layout. Adapt scene placement to leave text readable and respect reduced motion.
- [x] Add GLB loading configured as `modelUrl: null` while generation is pending; when present, fit by bounding box and animate camera with scroll. Use the local portrait as the visible fallback without describing it as a full 3D model. Handle load rejection, unsupported/lost WebGL, and no-JS content.
- [x] Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build` in `web/`; each exits zero. Verify canvas behavior in a browser in Task 3. Avoid implementation-mirroring unit tests for this presentation migration.
- [x] Commit frontend changes on the feature branch; independent spec and quality reviews must resolve actionable issues before release.

## Task 2: Generate and integrate portrait

Files: private local `site-planning/portrait-reference.jpg`; `web/scripts/generate-portrait.mjs`; final `web/public/models/portrait.glb` and `web/public/portrait-stylized.webp`; profile paths and `NOTICE`.

- [x] Prepare and inspect the reference crop locally; retain the original photograph outside the website.
- [x] Create an original, stylized collectible bust with local Three.js geometry and matte materials. Use the photo as an appearance reference only; no photographic textures. Keep recognizable short dark hair, face proportions, white shirt collar and navy jacket. Inspect front, side and back; fix visible geometry defects before release.
- [x] Render a matching static fallback from the final model. Remove photographic portrait assets from the public website.
- [x] Integrate the actual GLB and styled fallback in profile configuration. Record local asset provenance and the limitation that this is an artistic likeness rather than a scan.

## Task 3: Verification and deployment

Files: `.github/workflows/deploy.yml`, `README.md`, optional public `robots.txt`/`sitemap.xml`; evidence saved outside the repository in `site-planning/`.

- [x] Start `npm run dev -- --host 127.0.0.1` and inspect desktop plus 390-pixel mobile viewport in the real browser. Check Chinese headings, employer dates, scrolling, links, no horizontal overflow, portrait loading, failed-model fallback and reduced-motion behavior. Save screenshots and check browser error logs.
- [x] Repeat typecheck/lint/build after final changes. Search built output for original-author identity and private résumé phone; all must be absent.
- [ ] Configure standard GitHub Pages workflow to build `web/` using `npm ci` and publish only `web/dist`; switch repository Pages from legacy to Actions only after production-ready checks and final model integration.
- [ ] Commit and push the completed change, monitor deployment, verify HTTPS production page and assets, and leave `hello-agents-8-week` unchanged.
- [ ] Report the live URL, actual verification and any material model limitation. Do not claim facial reconstruction; describe the actual stylized model.
