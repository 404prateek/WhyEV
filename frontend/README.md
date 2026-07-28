# WhyEV — Frontend Web Application

The frontend application for **WhyEV**, built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

---

## 🚀 Quick Start (Works on Windows, macOS & Linux)

### 1. Prerequisites
- **Node.js**: `v18.18.0` or higher (Recommended: `v20.x` LTS)
- **npm**: `v9.x` or higher

### 2. Clone & Install
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(On Windows Command Prompt)*:
```cmd
copy .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗 Project Architecture

```
src/
 ├── app/               # Next.js App Router entrypoints (file-based routing)
 ├── views/             # Page view components (Home, Subsidy, Dealers, Recommend, etc.)
 ├── components/
 │    ├── common/       # AuthModal, PermissionModal, AiAgentDrawer
 │    ├── navbar/       # Navbar & Logo
 │    ├── footer/       # Light-themed Footer
 │    ├── buttons/      # Reusable Button component with variants
 │    ├── cards/        # Reusable Card component
 │    └── [modules]/    # Feature specific components (subsidy, dealers, etc.)
 │
 ├── hooks/             # Custom React hooks (useAuth, useAiAgent)
 ├── utils/             # Formatters & helper functions (cn, formatINR)
 ├── services/          # API service layers
 ├── styles/            # CSS design tokens & resets
 └── routes/            # ROUTES constants
```

---

## 🛠 Available Scripts

- `npm run dev` — Starts dev server at `http://localhost:3000`
- `npm run build` — Compiles production build
- `npm run start` — Starts production server

---

## 🌐 Browser Support

Verified across all modern desktop, tablet, and mobile browsers:
- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Apple Safari
