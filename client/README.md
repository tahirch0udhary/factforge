# FactForge Frontend (React + Vite)

This is the frontend app for FactForge.

## 1. Required Versions

- Node.js: 18.18+ or 20.x LTS recommended
- npm: 9+ recommended
- Vite: 5.4.11 (from package.json)
- React: 18.3.1 (from package.json)

## 2. Install Node.js and npm

If Node is not installed:

1. Go to https://nodejs.org
2. Download and install the LTS version
3. Reopen terminal after installation

macOS options:

1. Install from https://nodejs.org
2. Or install with Homebrew:

```bash
brew install node
```

Verify versions:

```powershell
node --version
npm --version
```

macOS / Linux:

```bash
node --version
npm --version
```

Optional: update npm

```powershell
npm install -g npm
```

macOS / Linux:

```bash
npm install -g npm
```

## 3. Install Frontend Dependencies

From the `client` folder:

```powershell
npm install
```

macOS / Linux:

```bash
npm install
```

## 4. Configure API Base URL

The frontend calls backend at `http://localhost:8000` by default.

If backend runs on a different URL, create a `.env` file in `client`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

You can also set it temporarily in PowerShell:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8000"
```

Temporary value in macOS terminal (zsh/bash):

```bash
export VITE_API_BASE_URL="http://localhost:8000"
```

## 5. Run Frontend Dev Server

```powershell
npm run dev
```

macOS / Linux:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## 6. Build for Production

```powershell
npm run build
```

macOS / Linux:

```bash
npm run build
```

Preview production build:

```powershell
npm run preview
```

macOS / Linux:

```bash
npm run preview
```

## 7. Troubleshooting (Windows)

If PowerShell blocks npm scripts, use:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev
```

## 8. Troubleshooting (macOS)

If `npm` permissions fail on global install:

```bash
sudo npm install -g npm
```

If `brew` is not found, install Homebrew from:

```text
https://brew.sh
```

## 9. Folder Structure

- `src/pages`: route-level pages
- `src/component`: reusable UI components
- `src/context`: auth state and session bootstrap
- `src/services`: API client and endpoint wrappers
