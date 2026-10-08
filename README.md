# CalcPulse — Modern Responsive Calculator & Workspace

An ultra-modern, responsive, glassmorphic calculator application built with **React**, **Vite**, and **Vanilla CSS**. Designed with rich aesthetics, sleek theme modes, user authentication, and interactive calculation history.

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

### 3. 📜 Persistent Calculation Tape / History
- **Slide-out History Drawer**: Real-time log of calculations with timestamps.
- **Interactive Restoration**: Click any calculation to load its result back into the active keypad.
- **Copy & Clear**: Copy individual entries or clear the session history with safety confirmation.

### 4. 🎨 Multi-Theme Design System
- **Aurora Dark** (Default): Radiant indigo and pink ambient glow over deep obsidian.
- **Cyber Neon**: Electric cyan, blue, and hot magenta cybernetic styling.
- **Clean Slate**: Subtle deep slate with blue accents for distraction-free sessions.

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

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

---

## 🛠️ Tech Stack
- **Framework**: React 19
- **Bundler & Tooling**: Vite 8
- **Styling**: Vanilla CSS Design Tokens & Glassmorphism
- **Icons**: Lucide React
- **Audio**: Web Audio API (zero external assets)

---

## 📝 Commit History
1. `feat: scaffold React application with Vite, design system tokens, and dependencies`
2. `feat: implement responsive modern authentication with guest demo login and session handling`
3. `feat: implement responsive calculator core layout, interactive keypad, and history panel`
4. `polish: add keyboard shortcuts, theme customization, and UI micro-animations`
