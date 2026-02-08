

**Vibe AI** is a state-of-the-art AI-powered platform that transforms your ideas into production-ready full-stack web applications in seconds. Built with a focus on premium aesthetics and developer experience, Vibe AI allows you to generate, preview, and export high-quality React + Node.js code seamlessly.

## ✨ Features

-   **Dual-Model Intelligence**: Choose between **Google Gemini 2.0 Flash** (Speed & Efficiency) and **Anthropic Claude 3.5 Sonnet** (Complex Reasoning) for your generations.
-   **Instant Live Preview**: See your changes in real-time with our embedded WebContainer technology.
-   **Full-Stack Generation**: Creates complete project structures including frontend (React, Tailwind) and backend (Node.js).
-   **Smart Context Awareness**: The AI understands your project context and executes multi-step build plans.
-   **Interactive File Explorer**: Navigate and edit generated files directly in the browser.
-   **One-Click Export**: Download your entire project as a ZIP file ready for local development.
-   **Secure API Key Management**: Your API keys are stored locally in your browser for maximum security.

## 🚀 Getting Started

### Prerequisites

-   **Node.js**: Version 18.x or higher installed.
-   **npm**: Package manager (comes with Node.js).
-   **API Keys**: You will need API keys for:
    -   [Google AI Studio (Gemini)](https://aistudio.google.com/)
    -   [Anthropic Console (Claude)](https://console.anthropic.com/) (Optional)

### Installation

Clone the project and install dependencies for both the frontend and backend services.

1.  **Backend Setup**
    ```bash
    cd be
    npm install
    ```

2.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

You need to run both the backend and frontend servers simultaneously. We recommend opening two terminal tabs.

**Terminal 1: Backend Server**
```bash
cd be
npm run dev
```
*The backend will start at `http://localhost:3000` (check console for exact port).*

**Terminal 2: Frontend Application**
```bash
cd frontend
npm run dev
```
*The frontend will start at `http://localhost:5173`.*

---

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, WebContainers
-   **Backend**: Node.js, Express, Google Generative AI SDK, Anthropic SDK
-   **State Management**: React Context, LocalStorage
-   **Styling**: Modern dark UI with glassmorphism and gradient effects

## 📜 Copyright

© 2025 Kushal. All rights reserved.

Generated code includes automatic copyright attribution to ensure your creations are properly marked.
