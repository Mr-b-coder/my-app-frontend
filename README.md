# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# book-Template
# my-app-frontend


# Acutrack Template Generator - Frontend

This is the frontend user interface for the Acutrack Template Generator. It's a React application built with Vite and styled with Tailwind CSS.

**Live URL:** [https://acutemplate.netlify.app](https://acutemplate.netlify.app)
**Hosted On:** Netlify

---

### 🚀 How to Run Locally

1.  Navigate into this folder: `cd my-app-frontend`
2.  Install all required packages: `npm install`
3.  Start the development server: `npm run dev`

The app will open in your browser, usually at `http://localhost:5173`.

**Note:** For the frontend to work locally, the backend server must also be running.

---

### 🎨 How to Make Common Changes

#### **Changing Colors & Styles**
This project uses **Tailwind CSS**. The main configuration is in `tailwind.config.js`. You can change the primary application colors in the `theme.extend.colors` section of this file.


#### **Editing Page Layout, Forms, and Logic**
The vast majority of the user interface, including all forms, buttons, and state management, is located in one central file:
-   **`src/App.tsx`**: This is the heart of the frontend application.

#### **Reusable Components**
Smaller, reusable UI pieces (like buttons, inputs, icons) are located in:
-   `src/components/`

---