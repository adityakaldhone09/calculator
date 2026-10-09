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

---

## 📝 Commit History
1. `feat: scaffold React application with Vite, design system tokens, and dependencies`
2. `feat: implement responsive modern authentication with guest demo login and session handling`
3. `feat: implement responsive calculator core layout, interactive keypad, and history panel`
4. `polish: add keyboard shortcuts, theme customization, and UI micro-animations`
5. `feat: implement Express backend API with auth, history sync, and Vite proxy`
6. `feat(theme): add Frost White light theme system with adaptive tokens and UI controls`
7. `feat(calc): implement memory engine (MC/MR/M+/M-/MS), DEG/RAD mode, and expanded scientific suite`
8. `feat(converter): introduce multi-category unit and currency converter workspace`
9. `feat(history): add tape search, single-item deletion, CSV/TXT export, and rate endpoints`
10. `feat(calc): implement Programmer mode with live bitboard, Base-N readouts, and bitwise engine`
11. `feat(financial): add comprehensive Financial & Investment workspace with EMI, SIP, and bill splitting`
12. `feat(grapher): introduce interactive 2D function grapher with Cartesian canvas and coordinate tracking`
13. `feat(stats): add tape statistics, multi-workspace navigation, and Phase 3 documentation`
