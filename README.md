# CalcPulse — Modern Responsive Calculator & Workspace

An ultra-modern, responsive, glassmorphic workstation application built with **React**, **Vite**, and **Vanilla CSS**. Designed with rich aesthetics, sleek theme modes, user authentication, interactive calculation history, financial engineering, function graphing, and base-N programmer modes.

---

## ✨ Features

### 1. 🔐 Modern Authentication (Stage 1)
- **Glassmorphic Sign In & Sign Up**: Responsive card with frosted glass backdrop blur, ambient light glow, and tab switching.
- **Instant Demo Access**: 1-click guest authentication with pre-configured personas (`Alex Morgan • Pro Analyst`).
- **Interactive Form Validation**: Live feedback with shake animations and input indicators.
- **Session Persistence**: Remember-me support with `localStorage` syncing.
- **Show/Hide Password**: Quick visibility toggle with icon indicators.

### 2. 🧮 Core Calculator Workspace
- **Responsive Layout**: Designed for mobile screens, tablets, and wide monitors.
- **Standard & Scientific Modes**: Instant switch to access square root (`√`), power (`xʸ`), square (`x²`), reciprocal (`1/x`), and constant (`π`).
- **Tactile Sound Effects**: Synthesized low-latency mechanical click feedback powered by the **Web Audio API** (with 1-click mute toggle).
- **Physical Keyboard Shortcuts**:
  - `0 - 9`: Number input
  - `.`: Decimal point
  - `+`, `-`, `*`, `/`: Binary arithmetic operations
  - `Enter` or `=`: Calculate result
  - `Backspace`: Delete previous digit
  - `Escape`: Clear all (AC)
  - `%`: Percentage calculation
- **Auto-Scaling Typography**: Display dynamically adjusts font sizes to prevent number clipping.
- **Clipboard Integration**: 1-click copy for current results with floating toast notification.

### 3. 🎨 Multi-Theme Design System
- **Frost White**: Pure, frosted glass white mode with high-contrast slate typography, luminous pastel glow, and clean borders.
- **Aurora Dark** (Default): Radiant indigo and pink ambient glow over deep obsidian.
- **Cyber Neon**: Electric cyan, blue, and hot magenta cybernetic styling.
- **Slate Dark**: Subtle deep slate with blue accents for distraction-free sessions.

### 4. 🔬 Advanced Scientific & Memory Suite (Phase 2)
- **Memory Engine**: Instant hardware-style `MC` (Clear), `MR` (Recall), `M+` (Add), `M-` (Subtract), and `MS` (Store) with active `M` memory pill badge in the screen.
- **Trigonometry**: Angle mode switcher between `DEG` (Degrees) and `RAD` (Radians) with precision `sin`, `cos`, and `tan` functions.
- **Extended Functions**: Natural log (`ln`), base-10 log (`log`), exponential (`eˣ`, `10ˣ`), powers & roots (`x²`, `x³`, `xʸ`, `√x`, `∛x`, `1/x`), factorial (`n!`), absolute value (`|x|`), constants (`π`, `e`), and random generator (`rand`).

### 5. 🔄 Multi-Category Unit & Currency Converter (Phase 2)
- **6 Essential Categories**:
  - 💱 **Currency**: Live exchange rates for USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, and CNY.
  - 📏 **Length**: km, m, cm, mm, miles, yards, feet, inches.
  - ⚖️ **Mass & Weight**: Metric tons, kg, g, mg, pounds, ounces.
  - 🌡️ **Temperature**: Celsius (°C), Fahrenheit (°F), Kelvin (K).
  - 💾 **Digital Storage**: Bytes, KB, MB, GB, TB, PB.
  - ⏱️ **Time**: Milliseconds, seconds, minutes, hours, days, weeks.
- **Bidirectional Unit Swap**: 1-click swap button (⇄) with tactile feedback and micro-animation.
- **Send to Calculator**: Instantly transfer converted figures directly into the calculator display.

### 6. 💻 Programmer / Base-N Calculator & Interactive Bitboard (New in Phase 3)
- **Simultaneous 4-Base Readouts**: Live synchronized displays for **HEX** (Hexadecimal), **DEC** (Decimal), **OCT** (Octal), and **BIN** (Binary formatted in 4-bit nibbles).
- **Interactive 32-Bit Bitboard**: Click any individual bit cell ($31 \dots 0$) to toggle its binary state ($0 \leftrightarrow 1$) with instant value updates and auditory click feedback.
- **Word Width Engine**: Support for **QWORD (64-bit)**, **DWORD (32-bit)**, **WORD (16-bit)**, and **BYTE (8-bit)** with automatic bitwise masking.
- **Bitwise Suite**: Dedicated operations for `AND (&)`, `OR (|)`, `XOR (^)`, `NOT (~)`, `Lsh (<<)`, `Rsh (>>)`, and `MOD (%)`.
- **Dynamic Hex Keypad**: Keys `A - F` dynamically enabled or disabled based on active base, with dedicated numeric filtering in BIN and OCT bases.

### 7. 💰 Financial & Investment Suite (New in Phase 3)
- **Loan & EMI Calculator**: Computes Monthly EMI, Total Interest, and Total Payable with interactive Principal vs Interest progress breakdown meters. Built-in presets for Auto Loans, 30-Yr Mortgages, and Personal Loans.
- **Compound Interest & Wealth SIP**: Projections for initial deposits, monthly contributions, annual return rates, and compounding frequencies (monthly, quarterly, annually).
- **Tip & Bill Splitter**: Quick tip percentages (10%, 15%, 18%, 20%, 25%, custom) and guest counter stepper, showing per-person bill and per-person tip.
- **Send to Calculator**: 1-click transfer button transports any calculated financial figure directly into the main calculator.

### 8. 📈 Interactive 2D Function Grapher & Plotter (New in Phase 3)
- **Cartesian Canvas Engine**: High-DPI 2D canvas with grid lines, numeric axis markers, and neon curve glowing.
- **Safe Dynamic Math Evaluator**: Supports trigonometric functions (`sin`, `cos`, `tan`), polynomials, radicals (`sqrt`), exponentials (`exp`), logarithms, and rational curves.
- **Coordinate Crosshair Inspection**: Real-time cursor tracker with coordinate badge displays exact $(x, f(x))$ values.
- **Interactive View Controls**: Pan and drag navigation, Zoom In (`+`), Zoom Out (`-`), and origin reset controls.
- **Sample Value Table**: Collapsible discrete table of values with 1-click values transfer to the active calculator display.

### 9. 📜 Calculation Tape & Quick Statistics Engine (New in Phase 3)
- **Live Search**: Instant text filtering for mathematical expressions and results.
- **Single Item Deletion**: Delete individual entries directly from the drawer tape.
- **Quick Numerical Statistics**: Live computation of Count ($N$), Sum ($\Sigma$), Mean / Average ($\mu$), Min, and Max across the calculation session with 1-click transfer to keypad.
- **CSV & Tape Export**: Export full calculation tape to CSV spreadsheet or copy formatted text tape.

### 10. 📐 Matrix Studio & Linear Algebra Engine (New in Phase 4)
- **Dynamic Matrix Grids**: Configurable dimensions for Matrix A and Matrix B (from $1\times 1$ up to $4\times 4$) with live glowing bracket layout.
- **Matrix Operations**: Matrix addition ($A + B$), subtraction ($A - B$), matrix multiplication ($A \times B$), and scalar multiplication ($k \cdot A$).
- **Unary Transformations**:
  - Determinant ($\det(A)$) for square matrices with singularity validation.
  - Matrix Inverse ($A^{-1}$) via Gauss-Jordan elimination.
  - Transpose ($A^T$) and Trace ($\operatorname{tr}(A)$).
- **Matrix Utilities**: Swap $A \leftrightarrow B$, 1-click result loading back into Matrix A or B, identity presets, random generators, and "Send to Calculator".

### 11. 🧮 Polynomial & Linear Systems Equation Solver (New in Phase 4)
- **Quadratic Equations ($ax^2 + bx + c = 0$)**: Instant discriminant ($\Delta = b^2 - 4ac$), real distinct roots, repeated root, or complex conjugate roots ($u \pm vi$), along with parabola vertex $(h, k)$ and curve concavity.
- **Cubic Equations ($ax^3 + bx^2 + cx + d = 0$)**: Solves all three roots (real and complex) using Cardano's analytical method.
- **$2 \times 2$ & $3 \times 3$ Linear System Solvers**: Solves multi-variable systems in $(x, y)$ and $(x, y, z)$ using Cramer's determinant rule and Gaussian elimination with automatic singularity and inconsistency detection.
- **Result Transfer**: 1-click button to pipe any calculated root or variable directly into the main calculator.

### 12. 📊 Statistical Analysis & Linear Regression Lab (Phase 4)
- **Descriptive Statistics**: Analyzes datasets with sample count ($n$), sum ($\Sigma x$), mean ($\mu$), median, mode, sample and population standard deviations ($s, \sigma$), variance ($s^2, \sigma^2$), range, quartiles ($Q_1, Q_3$), and IQR.
- **Bivariate Linear Regression**: Evaluates $(x, y)$ coordinate pairs, determines best-fit equation ($y = mx + c$), Pearson correlation ($r$), and coefficient of determination ($R^2$).
- **Interactive Predictor Tool**: Enter arbitrary $x$ coordinates to estimate predicted $\hat{y}$ values and send results into the calculator.

### 13. ♾️ Calculus & Numerical Quadrature Suite (New in Phase 5)
- **Numerical Definite Integration ($\int_a^b f(x)\,dx$)**:
  - **Simpson's 1/3 Rule**: Fourth-order parabolic quadrature with even subinterval subdivisions ($n = 4 \dots 1000$).
  - **Trapezoidal & Midpoint Rules**: Linear interpolation with estimated error $|S_n - T_n|/3$ and Mean Value Theorem average $\bar{f} = \frac{1}{b-a}\int_a^b f(x)dx$.
  - **Riemann Area Visualizer (SVG)**: Real-time dynamic SVG graph rendering the region under $f(x)$ bounded between $x = a$ and $x = b$ with ambient neon glow.
  - **Built-in Presets**: Standard Normal Gaussian distribution ($\int_0^{1.5} e^{-x^2}dx$), Cubic polynomial ($\int_0^3 (x^3 - 3x + 2)dx$), Half Sine wave ($\int_0^\pi \sin(x)dx$), and Arctan ($\int_0^1 \frac{1}{1+x^2}dx = \frac{\pi}{4}$).
- **Differential & Curvature Engine**:
  - **Central Finite Difference 5-Point Stencil**: Computes high-precision first derivative $f'(x_0) = \frac{-f(x+2h) + 8f(x+h) - 8f(x-h) + f(x-2h)}{12h}$.
  - **Second Derivative & Concavity**: Evaluates $f''(x_0)$, identifying concave up ($\cup$), concave down ($\cap$), or inflection points ($\sim$).
  - **Tangent & Normal Lines**: Generates exact Cartesian equations ($y = mx + c$) for tangent lines and perpendicular normal lines.
  - **Curvature & Osculating Radius**: Computes differential curvature $\kappa = \frac{|f''(x_0)|}{(1 + f'(x_0)^2)^{3/2}}$ and radius of curvature $R = 1/\kappa$.
- **Numerical Root Finding Suite**:
  - **Newton-Raphson Method ($x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}$)**: Rapid quadratic convergence with configurable initial guess $x_0$, tolerance $\varepsilon$, and maximum iteration limit.
  - **Bisection Bracket Method**: Interval halving algorithm with sign-change validation across $[a, b]$.
  - **Step-by-Step Convergence Trace**: Interactive audit table recording estimate $x_k$, evaluation $f(x_k)$, derivative $f'(x_k)$, and step delta $|\Delta x_k|$.

### 14. 🧭 Complex Numbers & Argand Vector Plane (New in Phase 5)
- **Dual Coordinate Representation**: Seamless rectangular ($a + bi$) and polar ($r \angle \theta^\circ$) coordinates for $z_1$ and $z_2$.
- **Complex Arithmetic Engine**: Complex addition ($z_1 + z_2$), subtraction ($z_1 - z_2$), multiplication ($z_1 \cdot z_2$), and division ($z_1 / z_2$) with singularity protection.
- **Powers & De Moivre Roots**: Computes integer powers $z^n$ and all $n$ distinct complex roots $\sqrt[n]{z} = \sqrt[n]{r}\left(\cos\frac{\theta + 2k\pi}{n} + i\sin\frac{\theta + 2k\pi}{n}\right)$.
- **Interactive Argand Vector Plane (SVG)**: Visual coordinate canvas displaying real ($Re$) and imaginary ($Im$) axes, concentric magnitude rings, and glowing directional vectors for $z_1$ (blue), $z_2$ (magenta), and Result $z_{res}$ (emerald green).

### 15. 📐 Spatial Geometry & Classical/Relativistic Physics Lab (New in Phase 5)
- **2D Planar Shapes**: Circle ($A = \pi r^2, C = 2\pi r$), Ellipse (Ramanujan perimeter approximation and eccentricity), Triangle (Heron's formula, inradius $r = A/s$, and circumradius $R$), Trapezoid, and Regular $n$-sided polygon.
- **3D Spatial Solids**: Sphere, Right Circular Cylinder, Right Circular Cone, Torus (donut ring), Rectangular Cuboid, and Square Pyramid with live volume and surface area breakdowns.
- **Ballistic Projectile Motion**: Computes Flight Time ($T$), Maximum Height ($H$), Horizontal Range ($R$), initial velocity components, and dynamic trajectory parabola curve. Presets for Earth ($9.81\text{ m/s}^2$), Moon ($1.62$), Mars ($3.72$), and Jupiter ($24.79$).
- **Energy & Relativity**: Kinetic Energy ($E_k = \frac{1}{2}mv^2$), Gravitational Potential Energy ($U = mgh$), linear momentum ($p = mv$), and relativistic Lorentz factor ($\gamma = 1/\sqrt{1 - v^2/c^2}$).
- **Wave & Circuit Analysis**: Ohm's Law and Power ($P = VI$), LC Resonant Frequency ($f_0 = \frac{1}{2\pi\sqrt{LC}}$).
- **Direct Calculator Interconnect**: 1-click "Send to Calc" pipes any computed value into the main keypad display.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/adityakaldhone09/calculator.git
   cd calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Launch backend API server:
   ```bash
   npm run server
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack
- **Framework**: React 19
- **Bundler & Tooling**: Vite 8
- **Styling**: Vanilla CSS Design Tokens & Glassmorphism
- **Backend API**: Express 5 & Node.js
- **Icons**: Lucide React
- **Audio**: Web Audio API (zero external assets)

