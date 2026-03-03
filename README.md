# Acutrack Template Generator - Frontend

This is the frontend user interface for the Acutrack Template Generator. It's a React application built with Vite and styled with Tailwind CSS. It provides the user forms, interactive previews, and triggers downloads from the backend server.

**Live URL:** [https://acutemplate.netlify.app](https://acutemplate.netlify.app)
**Hosted On:** Netlify

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [How to Run Locally](#how-to-run-locally)
5. [How to Make Changes](#how-to-make-changes)
6. [Deployment](#deployment)

---

<h2 id="features">Features</h2>

- **Dynamic Cover Dimension Calculation:** For Perfect Bind, Case Bind, and Coil/Wire-O.
- **Dust Jacket (Case Bind):** When Case Bind is selected, optional “Include dust jacket” with flap width (3" or 4"). Dust jacket dimensions are computed from trim size, spine, flaps, and bleed. A dedicated **Dust Jacket** preview tab shows the layout (back flap, back cover, spine, front cover, front flap) with distinct colors for flap vs. 0.125" fold; white content area on flaps is centered in the main flap (trim-height-based height, 0.125" inset). Technical guides can show Bleed, Safety, total size, and spine width on the back cover panel; spine label is rotated 90°. A “Download dust jacket” button downloads only the dust jacket PDF.
- **Interactive Previews:** Visual previews for cover, dust jacket (when applicable), and interior layouts.
- **Downloadable Asset Packages:** Generates and downloads ZIP files containing PDF, JSX, IDML, and DOCX templates (and dust jacket PDF when included).
- **Custom Barcode Generator:** Supports ISBN EAN-13 and Data Matrix with JPEG/PDF download options.
- **Responsive UI:** Includes a Light/Dark theme switcher.

<h2 id="tech-stack">Tech Stack</h2>

- **Framework:** React 19 (with TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Core Libraries:**
  - `jspdf`: For generating barcode PDFs on the client-side.
  - `bwip-js`: For rendering barcode images in the browser.

<h2 id="project-structure">Project Structure</h2>
Use code with caution.
Markdown
/my-app-frontend
├── /src
│ ├── /Assets/ # Static assets (logo, guides).
│ ├── /components/ # Reusable React components (Button, Input, DustJacketPreview, etc.).
│ ├── App.tsx # Main application component with all forms, dust jacket calc, summary, download, preview tabs.
│ ├── constants.ts # Application-wide constants (e.g., paper stock options, bleed).
│ └── index.tsx # Entry point for the React application.
├── index.html # Main HTML file for the application.
├── package.json # Project dependencies and scripts.
└── tailwind.config.js # Configuration file for Tailwind CSS.
Generated code
<h2 id="how-to-run-locally">How to Run Locally</h2>

1.  **Navigate into this folder:**
    ```bash
    cd my-app-frontend
    ```
2.  **Install all required packages:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
The app will open in your browser, usually at `http://localhost:5173`. **Note:** For file generation to work, the backend server must also be running locally.

<h2 id="how-to-make-changes">How to Make Changes</h2>

-   **To Change Colors:** Edit the `theme.extend.colors` section in **`tailwind.config.js`**.
-   **To Change the Logo:** Replace the file in **`src/assets/`** and update the `<img>` tag in **`src/App.tsx`**.
-   **To Edit Forms, Buttons, and Page Layout:** The vast majority of the UI is controlled by **`src/App.tsx`**.
-   **To Edit Reusable Components:** Modify the corresponding files in the **`src/components/`** folder. Dust jacket layout and technical guides are in **`src/components/DustJacketPreview.tsx`**.
-   **To Change the Backend Server URL:** The `fetch` request URL is hardcoded in the `handleDownload` function inside **`src/App.tsx`**. Update it if your backend server address changes.

<h2 id="deployment">Deployment</h2>

This frontend is continuously deployed to **Netlify** from the `main` branch of this repository. Netlify automatically detects the Vite configuration.

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

**Required: Backend API URL (Netlify)**  
In Netlify → Site → **Site configuration** → **Environment variables**, add:

| Variable        | Value                          | Scopes   |
|----------------|----------------------------------|----------|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Builds, Deploy previews |

Use your real Render backend URL (no trailing slash). Without this, the live site will try to call `localhost` and you’ll see "Failed to fetch" for template download and Check PDF. After adding or changing it, trigger a **Clear cache and deploy site** (or push a commit) so the new value is baked into the build.

Any push to the `main` branch will trigger a new deployment on Netlify.

---

## Recent changes (Dust Jacket)

- Dust jacket tab and **DustJacketPreview** component: panel layout (back flap, back cover, spine, front cover, front flap) with flap vs. fold (0.125") colors; white content area on flaps sized by trim height, centered in main flap, 0.125" inset; technical guides (Bleed, Safety, total size, spine) on back cover panel; spine label rotated 90°.
- Dust jacket dimensions and summary use trim size; flap width (3" or 4") is user-driven; “Download dust jacket” calls `POST /api/generate-dust-jacket`.
