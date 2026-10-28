# CalcPulse — Modern Responsive Calculator & Scientific Engineering Workstation

CalcPulse is an ultra-modern, responsive, glassmorphic workstation application built with **React 19**, **Vite 8**, **Express 5**, and **Vanilla CSS**. Designed with rich aesthetics, sleek theme modes, direct workspace access, interactive calculation history tape, financial engineering, 2D function graphing, calculus lab, base-N programmer modes, matrix studio, and complex/physics tools.

---

## 🏗️ Architecture & Production Design

CalcPulse is architected for clean local development and unified single-service cloud production deployment (such as Render Web Services):

- **Unified Single Web Service**: In production, the Express 5 backend server directly serves both the compiled static React 19 frontend assets from `dist/` and the backend REST API endpoints under `/api`.
- **API Precedence & Routing**: All API routes are evaluated first. Any unknown `/api/*` route immediately returns a structured JSON 404 response. Valid client-side Single Page Application (SPA) routes fallback to `index.html` without intercepting API calls or static assets.
- **Port & Host Binding**: Express binds dynamically to `process.env.PORT` (or default `5001`) on `0.0.0.0` as required by Render, container runtimes, and Linux web hosts.
- **Local Development**: Vite proxies `/api` calls to `http://localhost:5001`, allowing hot module reloading for the frontend during development while communicating with the backend.

```
                           +---------------------------+
                           |    Client Browser         |
                           +-------------+-------------+
                                         |
                       Same-Origin HTTP / HTTPS Requests
                                         |
                                         v
                     +---------------------------------------+
                     |  Render Node.js Web Service (Express) |
                     |         Port: $PORT, Bind: 0.0.0.0    |
                     +-------------------+-------------------+
                                         |
                +------------------------+------------------------+
                |                                                 |
                v                                                 v
      /api/* Routes                                        Static Assets / SPA
  - /api/health                                            - /assets/* (JS, CSS)
  - /api/history (Tape)                                    - /favicon.svg, /icons.svg
  - /api/converter/rates                                   - Fallback: index.html
  - /api/financial/* (EMI, Compound)
  - /api/matrix/analyze
  - /api/equations/quadratic
  - Unmatched /api/* -> JSON 404
```

---

## ✨ Verified Features

### 1. ⚡ Direct Workspace Access & Streamlined Architecture
- **Instant Workspace Launch**: Direct entry into calculations without sign-in barriers.
- **Unified Calculation Tape**: Automatic sync with backend tape history and local persistence.
- **Multi-Theme Customization**: 1-click cycling across all 4 glassmorphic themes (Aurora Dark, Cyber Neon, Slate Dark, Frost White).
- **Tactile Audio Engine**: Synthesized mechanical click feedback powered by the **Web Audio API** (zero external audio files).

### 2. 🧮 Core Calculator Workspace
- **Responsive Layout**: Designed for mobile screens, tablets, and wide monitors.
- **Standard & Scientific Modes**: Instant switch to access square root (`√`), power (`xʸ`), square (`x²`), reciprocal (`1/x`), and constant (`π`).
- **Physical Keyboard Shortcuts**:
  - `0 - 9`: Number input
  - `.`: Decimal point
  - `+`, `-`, `*`, `/`: Binary arithmetic operations
  - `Enter` or `=`: Calculate result
  - `Backspace`: Delete previous digit
  - `Escape`: Clear all (AC)
  - `%`: Percentage calculation
- **Auto-Scaling Typography**: Dynamic font adjustment preventing display truncation.
- **Clipboard Integration**: 1-click copy with floating toast alerts.

### 3. 🔬 Advanced Scientific & Memory Suite
- **Hardware Memory Engine**: `MC`, `MR`, `M+`, `M-`, and `MS` with active `M` memory pill badge.
- **Trigonometry**: Angle switcher between `DEG` (Degrees) and `RAD` (Radians) with precision `sin`, `cos`, and `tan`.
- **Extended Math**: Natural log (`ln`), base-10 log (`log`), exponential (`eˣ`, `10ˣ`), powers & roots (`x²`, `x³`, `xʸ`, `√x`, `∛x`, `1/x`), factorial (`n!`), absolute value (`|x|`), constants (`π`, `e`), and random generator (`rand`).

### 4. 🔄 Multi-Category Unit & Currency Converter
- **6 Categories**: Currency (USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY), Length, Mass/Weight, Temperature, Digital Storage, and Time.
- **Bidirectional Unit Swap**: 1-click swap button (⇄) with tactile feedback.
- **Send to Calculator**: Instantly transfer converted figures directly into the calculator display.

### 5. 💻 Programmer / Base-N Calculator & Interactive Bitboard
- **Simultaneous 4-Base Readouts**: Synchronized displays for **HEX**, **DEC**, **OCT**, and **BIN** (formatted in 4-bit nibbles).
- **Interactive 32-Bit Bitboard**: Click any individual bit cell ($31 \dots 0$) to toggle binary states with instant value updates.
- **Word Width Engine**: **QWORD (64-bit)**, **DWORD (32-bit)**, **WORD (16-bit)**, and **BYTE (8-bit)** with bitwise masking.
- **Bitwise Suite**: `AND (&)`, `OR (|)`, `XOR (^)`, `NOT (~)`, `Lsh (<<)`, `Rsh (>>)`, and `MOD (%)`.

### 6. 💰 Financial & Investment Suite
- **Loan & EMI Calculator**: Computes Monthly EMI, Total Interest, and Total Payable with interactive Principal vs Interest meters. Zero-interest and variable interest rates supported safely.
- **Compound Interest & Wealth SIP**: Projections for initial deposits, monthly contributions, annual return rates, and compounding frequencies.
- **Tip & Bill Splitter**: Quick tip percentages (10%, 15%, 18%, 20%, 25%, custom) and guest counter stepper.
- **Send to Calculator**: 1-click transfer button transports calculated figures directly into the main calculator.

### 7. 📈 Interactive 2D Function Grapher & Plotter
- **Cartesian Canvas Engine**: High-DPI 2D canvas with grid lines, numeric axis markers, and neon curve glowing.
- **Hardened Math Evaluator**: Token-whitelisted mathematical parser preventing arbitrary script execution while supporting trigonometric, polynomial, radical, exponential, and rational curves.
- **Coordinate Crosshair Inspection**: Real-time cursor tracker with coordinate badge displays exact $(x, f(x))$ values.
- **Interactive View Controls**: Pan and drag navigation, Zoom In (`+`), Zoom Out (`-`), and origin reset controls.

### 8. 📜 Calculation Tape & History Engine
- **Live Search**: Instant text filtering for mathematical expressions and results.
- **Single Item Deletion**: Delete individual entries directly from the drawer tape.
- **Quick Numerical Statistics**: Live computation of Count ($N$), Sum ($\Sigma$), Mean ($\mu$), Min, and Max across the calculation session.
- **CSV & Tape Export**: Export full calculation tape to CSV spreadsheet or copy formatted text tape.

### 9. 📐 Matrix Studio & Linear Algebra Engine
- **Dynamic Matrix Grids**: Configurable dimensions for Matrix A and Matrix B (from $1\times 1$ up to $4\times 4$).
- **Matrix Operations**: Matrix addition ($A + B$), subtraction ($A - B$), matrix multiplication ($A \times B$), and scalar multiplication ($k \cdot A$).
- **Unary Transformations**: Determinant ($\det(A)$), Inverse ($A^{-1}$), Transpose ($A^T$), and Trace ($\operatorname{tr}(A)$) with singularity protection.

### 10. 🧮 Polynomial & Linear Systems Equation Solver
- **Quadratic Equations ($ax^2 + bx + c = 0$)**: Instant discriminant ($\Delta = b^2 - 4ac$), real distinct roots, repeated root, or complex conjugate roots ($u \pm vi$), along with parabola vertex $(h, k)$.
- **Cubic Equations ($ax^3 + bx^2 + cx + d = 0$)**: Solves all three roots (real and complex) using Cardano's analytical method.
- **$2 \times 2$ & $3 \times 3$ Linear System Solvers**: Solves multi-variable systems in $(x, y)$ and $(x, y, z)$ using Cramer's rule and Gaussian elimination with singularity detection.

### 11. 📊 Statistical Analysis & Linear Regression Lab
- **Descriptive Statistics**: Sample count ($n$), sum ($\Sigma x$), mean ($\mu$), median, mode, standard deviations ($s, \sigma$), variance ($s^2, \sigma^2$), range, quartiles ($Q_1, Q_3$), and IQR.
- **Bivariate Linear Regression**: Evaluates $(x, y)$ coordinate pairs, determines best-fit equation ($y = mx + c$), Pearson correlation ($r$), and coefficient of determination ($R^2$).

### 12. ♾️ Calculus & Numerical Quadrature Suite
- **Numerical Definite Integration ($\int_a^b f(x)\,dx$)**: Simpson's 1/3 Rule, Trapezoidal Rule, Midpoint Rule, and dynamic SVG Riemann visualizer.
- **Differential & Curvature Engine**: Central finite difference 5-point stencil for $f'(x_0)$ and $f''(x_0)$, concavity detection, tangent/normal lines, and curvature radius.
- **Numerical Root Finding Suite**: Newton-Raphson method and Bisection bracket method with convergence trace tables.

### 13. 🧭 Complex Numbers & Argand Vector Plane
- **Dual Representation**: Rectangular ($a + bi$) and polar ($r \angle \theta^\circ$).
- **Complex Arithmetic**: Addition, subtraction, multiplication, division, powers, and roots.
- **Interactive Argand Vector Plane (SVG)**: Visual coordinate canvas displaying real ($Re$) and imaginary ($Im$) axes and glowing directional vectors.

### 14. 📐 Spatial Geometry & Classical/Relativistic Physics Lab
- **2D Planar Shapes**: Circle, Ellipse, Triangle, Trapezoid, and Regular $n$-sided polygon.
- **3D Spatial Solids**: Sphere, Cylinder, Cone, Torus, Cuboid, and Square Pyramid.
- **Ballistic Projectile Motion**: Trajectory flight time, maximum height, horizontal range, with presets for Earth, Moon, Mars, and Jupiter.
- **Energy & Relativity**: Kinetic energy, potential energy, momentum, and Lorentz factor ($\gamma$).
- **Wave & Circuit Analysis**: Ohm's Law and LC resonant frequency.

---

## 📋 Prerequisites & Supported Node Version

- **Node.js**: `>=20.0.0` (Recommended: Node 20 LTS, 22 LTS, or 24 Current)
- **Package Manager**: `npm` (v10+ or v11+)

---

## 🛠️ Local Development & Scripts

### 1. Install dependencies
```bash
npm ci
```

### 2. Development Mode
Run both frontend and backend concurrently in separate terminals or as background processes:

```bash
# Terminal 1: Backend API (runs on http://localhost:5001)
npm run server

# Terminal 2: Frontend Vite dev server (runs on http://localhost:5173 with proxy)
npm run dev
```

### 3. Build & Production Verification
```bash
# Compile React frontend into dist/
npm run build

# Start production Express server (serves frontend + API)
npm start
```

### 4. Linting & Automated Tests
```bash
# Code quality check via oxlint
npm run lint

# Automated test suite (API endpoints, math engine, security checks)
npm test

# Full production server startup & HTTP smoke test
node test/smoke.js
```

---

## ⚙️ Environment Variables Reference

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `5001` (Dev) / `10000` (Render) | Server port. Automatically injected by Render Web Services. |
| `NODE_ENV` | String | `'development'` | Environment mode (`'production'` or `'development'`). |
| `CORS_ORIGIN` | String | `undefined` | Optional comma-separated allowed CORS origins (e.g. `https://example.com`). If not set in production, same-origin requests are permitted. |

---

## 🚀 Render Deployment Guide

### Method A: Blueprint Deployment using `render.yaml` (Recommended)

1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select your repository.
4. Render detects `render.yaml` and sets up the Web Service:
   - **Environment**: Node.js
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. Click **Apply**. Render will automatically build the assets and start the application.

### Method B: Manual Web Service Setup on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the configuration:
   - **Name**: `calcpulse`
   - **Runtime**: `Node`
   - **Branch**: `main`
   - **Region**: Oregon (or preferred region)
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Under **Advanced Settings**:
   - Add Environment Variable: `NODE_ENV` = `production`
   - Set **Health Check Path**: `/api/health`
   - Set **Auto-Deploy**: `Yes`
6. Click **Create Web Service**.

---

## 🏥 Health Check Endpoint & Troubleshooting

### Health Check
- **Endpoint**: `GET /api/health`
- **Response Format**:
  ```json
  {
    "status": "online",
    "service": "CalcPulse Backend API",
    "uptime": 124,
    "timestamp": "2026-10-28T19:15:00.000Z",
    "environment": "production"
  }
  ```

### Common Issues & Troubleshooting
1. **Port Binding / Web Service timeout on Render**:
   - CalcPulse binds to `0.0.0.0` and listens on `process.env.PORT` dynamically. Ensure the start command is `npm start`.
2. **Missing Frontend Build (`CalcPulse client build not found`)**:
   - Ensure your build command includes `npm run build` (`npm ci && npm run build`).
3. **CORS issues on custom domains**:
   - If hosting the API on a separate domain from the frontend, supply `CORS_ORIGIN=https://myfrontend.com` in your service environment variables.

---

## 💾 Data Persistence & Scaling Considerations

The calculation history tape is currently managed in an in-memory server store capped at the last 50 calculations, synchronized with the browser client state and `localStorage`.

- **Current Behavior**: Calculation entries persist across client reloads and can be cleared or deleted item-by-item.
- **Production Ephemeral Container Note**: In Render Free tier or container restarts/scale-to-zero cycles, in-memory backend history resets to seed data. Local browser client tape is preserved in `localStorage`.
- **Scaling Recommendation**: For multi-instance horizontal scaling or durable long-term storage across server deployments, connect a managed persistent store such as a Render PostgreSQL database or Redis instance without relying on local ephemeral disk files.
