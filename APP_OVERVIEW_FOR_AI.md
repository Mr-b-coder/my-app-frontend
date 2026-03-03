# Acutrack Template Generator — App Overview for AI

This document describes the application at a high level: what it does, how it works, and what can be enabled or disabled. Use it to brief an AI (or a human) on the system.

---

## 1. What the app is

**Acutrack Template Generator** is a web app that lets users define book specifications (trim size, binding type, page count, paper stock, etc.) and **download a ZIP of print-production templates**: cover PDF/PSD/IDML, optional dust jacket PDF, interior PDF, a text summary, and a Book Creation Guide PDF.

- **Frontend:** React 19 + TypeScript + Vite + Tailwind; design system `@acutrack-bookprint/acutrack-ds`. Hosted on Netlify.
- **Backend:** Node.js + Express + TypeScript. Generates PDFs, PSD, IDML, interior PDF, dust jacket PDF, summary, and zips them. Hosted on Render.
- **API base URL:** Configured via `VITE_API_URL` (e.g. `https://my-template-server.onrender.com`). Defaults to `http://localhost:3001` when unset.

---

## 2. How it works (main flow)

1. **User fills the form** (home route `/`):
   - Book title (optional)
   - Trim width & height (inches)
   - **Binding type** (see §4)
   - For Perfect Bind and Case Bind: **Page count**, **Paper stock** (interior PPI)
   - For Case Bind only: **Include dust jacket** (checkbox), **Dust jacket flap width** (3" or 4", button group)

2. **Frontend calculates dimensions** (`calculateCoverDimensions` in `App.tsx`):
   - Uses `constants.ts` (bleed, safety margins, wrap, hinge, etc.) and binding-specific formulas.
   - Produces a `CoverCalculations` object: total cover size, spine width, safety margins, and (for Case Bind + dust jacket) dust jacket total width/height.

3. **User sees**:
   - Book summary (copyable)
   - **Previews** in tabs: **Cover** (binding-specific SVG), **Dust Jacket** (5-panel when enabled), **Interior** (page setup guide)
   - Download options: **Download All**, **Cover only**, **Interior only**

4. **Download** (`handleDownload(packageType)`):
   - Builds a payload from `calculatedDimensions` + form data (including `includeDustJacket`, `dustJacketFlapWidthInches`, etc.).
   - `POST` to backend `POST /api/generate-template` with that payload.

5. **Backend** (`server.ts`):
   - Validates payload (e.g. `totalWidth` present).
   - Adds to ZIP: `summary.txt`, and depending on `packageType`:
     - **Cover package** (`cover` or `all`): `Cover/cover.pdf`, `Cover/cover.psd`, `Cover/cover.idml`; if Case Bind and `includeDustJacket`: `Cover/dust-jacket.pdf`.
     - **Interior package** (`interior` or `all`): `Interior/interior.pdf`.
   - Always tries to add `Book Creation Guide.pdf` from Assets.
   - Returns ZIP as attachment; filename like `Template_CaseBindHardcover_all.zip`.

---

## 3. Routes and main features

| Route        | Purpose |
|-------------|---------|
| `/`         | Main template generator: form, summary, previews (Cover / Dust Jacket / Interior tabs), download buttons, barcode tools, print requirements. |
| `/check-pdf`| **Check PDF** tool: upload PDF or enter PDF URL; backend analyzes (e.g. page count, dimensions) via `POST /api/analyze-pdf`. |

Other features on home:
- **Custom barcode:** ISBN (EAN-13) and optional price (EAN-5); generate and download JPEG or PDF (client-side with jspdf/bwip-js).
- **Data Matrix barcode:** Custom text; download JPEG or PDF.
- **Print Requirements:** Link to download a static PDF (`Print-requirements.pdf`).
- **Theme:** Light/Dark (and favicon follows system preference).

---

## 4. What you can enable or disable (binding and options)

### 4.1 Binding types (single choice)

- **Perfect Bind / Softcover** — spine width from page count and paper PPI; bleed and safety margin.
- **Case Bind / Hardcover** — board, wrap, hinge, spine; optional **dust jacket** (see below).
- **Coil / Wire-O - Softcover** — single sheet; safety margins (top/bottom, binding, outside).
- **Coil / Wire-O - Hardcover** — board, wrap, punch holes; hardcover-specific margins.

**Saddle Stitch** exists in the backend enum but is not a selectable binding in the frontend; it is treated like Perfect Bind for PDF generation.

**What changes when you switch binding:**
- Which fields are shown (e.g. page count and paper stock only for Perfect Bind and Case Bind).
- Formula used for dimensions (see `calculateCoverDimensions` and `constants.ts`).
- Which preview is relevant (cover vs dust jacket vs interior).
- Which backend drawer runs (`drawPerfectBind`, `drawCaseBind`, `drawCoilWire`, etc.).

### 4.2 Case Bind – specific options

- **Include dust jacket** (checkbox):
  - **Off:** No dust jacket UI, no dust jacket in payload, no `Cover/dust-jacket.pdf` in ZIP.
  - **On:** Dust jacket flap width (3" or 4"), dust jacket dimensions computed (same bleed/margin logic as rest of app); `Cover/dust-jacket.pdf` added to cover (or full) package.

- **Dust jacket flap width** (button group, 3" or 4"):
  - Only visible when **Include dust jacket** is on.
  - Fixed fold (turn-around) 0.125" (from `DUST_JACKET_FOLD_INCHES`).

### 4.3 Download package type (per click)

- **Download All Files** — `packageType: 'all'`: cover set (cover + dust jacket if applicable) + interior + summary + guide.
- **Cover Files** — `packageType: 'cover'`: cover set only (+ summary + guide).
- **Book Files** (interior) — `packageType: 'interior'`: interior PDF only (+ summary + guide).

So “enable/disable” for the user is: choice of binding, optional dust jacket (Case Bind only), and which package(s) to download.

---

## 5. Key data structures (for AI)

- **BookCoverFormData:** Form state — bookTitle, pageCount, paperStockPPI, trimWidth, trimHeight, bindingType, includeDustJacket?, dustJacketFlapWidthInches?.
- **CoverCalculations:** Result of dimension math — totalCoverWidth/Height, spineWidth, bleedAmount, safetyMargin, wrapAmount, hingeWidth, frontPanelBoardWidth, boardHeight, etc.; for dust jacket also includeDustJacket, dustJacketFlapWidthInches, dustJacketFoldInches, dustJacketTotalWidth, dustJacketTotalHeight.
- **TemplatePayload:** Sent to `POST /api/generate-template` — packageType, bindingName, dimensions, margins, optional dust jacket fields, bookTitle, etc.

Shared types live in `my-app-frontend/shared/types.ts`. Backend has its own `BindingType` enum and `TemplatePayload` in `server.ts`.

---

## 6. Constants that drive behavior (frontend)

- **Bleed / margins:** `STANDARD_BLEED_AMOUNT_INCHES`, `PERFECT_BIND_SAFETY_MARGIN_INCHES`, `CASE_BIND_WRAP_MARGIN_INCHES`, `CASE_BIND_HINGE_WIDTH_INCHES`, `CASE_BIND_SAFETY_MARGIN_INCHES`, Coil/Wire-O margins, etc.
- **Dust jacket:** `DUST_JACKET_FOLD_INCHES = 0.125`, `DUST_JACKET_FLAP_OPTIONS_INCHES = [3, 4]`.
- **Paper stocks:** `PAPER_STOCK_OPTIONS` (name + PPI) used for spine calculation and display.

Changing these changes dimensions and what the backend receives; the backend uses the same concepts (e.g. standard bleed for dust jacket).

---

## 7. Backend API summary

| Method | Endpoint                | Purpose |
|--------|-------------------------|---------|
| POST   | `/api/generate-template`| Body: TemplatePayload. Generates cover (and optionally dust jacket), interior, summary; returns ZIP. |
| POST   | `/api/analyze-pdf`      | Body: `{ fileBase64? }` or `{ pdfUrl? }`. Returns analysis (e.g. page count, dimensions). Used by Check PDF page. |

CORS is restricted to known frontend origins (Netlify + localhost). Request size limit for analyze-pdf is 1GB (for base64 PDF).

---

## 8. File layout (high level)

- **Frontend:** `my-app-frontend/src/` — `App.tsx` (main form, download, preview tabs), `constants.ts`, `shared/types.ts`, `components/` (TemplatePreview, DustJacketPreview, InteractiveInteriorSetup, etc.), `pages/CheckPdfPage.tsx`.
- **Backend:** `my-app-backend/` — `server.ts` (routes, zip assembly), `pdfGenerator.ts` (cover + dust jacket PDFs), `interiorPdfGenerator.ts`, `psdBuilder.ts`, `idmlBuilder.ts`, `summaryGenerator.ts`, `Assets/`, `template.idml`.

---

## 9. Short “explain to AI” summary

- **What it is:** Book template generator: user picks binding, trim, (for some bindings) page count and paper, optionally dust jacket for Case Bind; app computes dimensions and lets user download a ZIP of cover (and dust jacket), interior, and summary.
- **How it works:** Frontend form → dimension calculation → preview tabs (Cover / Dust Jacket / Interior) → download → backend generates PDFs/PSD/IDML and zips them.
- **Enable/disable:** Binding type (Perfect Bind, Case Bind, Coil Softcover, Coil Hardcover); for Case Bind only, “Include dust jacket” and flap width 3" or 4"; download scope (all, cover only, interior only). No feature flags beyond that—everything is driven by form choices and package type.

Use this overview to give an AI (or new developer) context before asking about specific code paths, formulas, or UI changes.
