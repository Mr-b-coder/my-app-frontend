# Book Template V2 – Documentation

This document summarizes the project and recent dust jacket work. For day-to-day use, see **my-app-frontend/README.md** and **my-app-backend/README.md**.

---

## Project overview

- **Frontend:** React (Vite, TypeScript, Tailwind). Forms, cover/dust jacket/interior previews, template and dust jacket download. See `my-app-frontend/README.md`.
- **Backend:** Node/Express/TypeScript. PDF, PSD, IDML, DOCX, and dust jacket PDF generation. See `my-app-backend/README.md`.

---

## Dust jacket (Case Bind) – summary

- **When:** Case Bind + “Include dust jacket” checked; dimensions come from “Get your files” (trim, spine, flap width 3" or 4").
- **Layout:** Single flat layout left → right: **Back flap** | **Back cover** | **Spine** | **Front cover** | **Front flap**. Flap = main width (3" or 4") + 0.125" fold; fold is a separate color from the main flap.
- **Content areas:** Back/front cover = full-height white safety area; flaps = white area width 2.87" (3" flap) or 3.87" (4" flap), height = trim height, centered in the main flap only (fold excluded), then 0.125" inset on all sides.
- **Back cover:** Logo, “BACK COVER” below logo; barcode placeholder (yellow) in bottom-right of white area; (in PDF) bleed/safety/barcode info.
- **Front cover:** Logo, “FRONT COVER” below logo; (in PDF) total size, trim size, spine, flap width, fold 0.125" with descriptions.
- **Frontend preview:** `DustJacketPreview.tsx` – same panel order and colors; optional technical guides (Bleed, Safety, total size, spine) on back cover; spine label rotated 90°.
- **API:** `POST /api/generate-dust-jacket` returns only the dust jacket PDF; full template ZIP (when dust jacket included) also contains this PDF.

---

## Git – push frontend and backend separately

From the **repository root** (`Book Template_V2`):

**Option A – Two commits, one push**

```bash
# Commit frontend only (docs + frontend code)
git add my-app-frontend/
git commit -m "docs(frontend): dust jacket preview, guides, spine rotation, README"

# Commit backend only (docs + backend code)
git add my-app-backend/
git commit -m "docs(backend): dust jacket PDF, fold color, API and README"

# Push both commits
git push origin main
```

**Option B – Push after each commit**

```bash
# Frontend
git add my-app-frontend/
git commit -m "docs(frontend): dust jacket preview, guides, spine rotation, README"
git push origin main

# Backend
git add my-app-backend/
git commit -m "docs(backend): dust jacket PDF, fold color, API and README"
git push origin main
```

**If you also changed root-level files (e.g. this DOCUMENTATION.md):**

```bash
git add DOCUMENTATION.md
git add my-app-frontend/
git commit -m "docs(frontend): dust jacket preview, guides, README; root DOCUMENTATION"
git push origin main

git add my-app-backend/
git commit -m "docs(backend): dust jacket PDF, API, README"
git push origin main
```

Replace `main` with your branch name if different.
