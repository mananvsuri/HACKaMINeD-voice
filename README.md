# AI-Powered Revenue & Voice Copilot for Restaurants

This project is a full-stack platform designed for restaurants to optimize their menu profitability and automate order-taking using an AI-powered voice assistant. Built with **FastAPI** (Backend) and **React + Vite** (Frontend), and powered by **Groq**'s ultra-fast AI inference platform.

## Features

### 1. Revenue Intelligence Engine
- **Item-Level Profitability Analysis**: Calculates Contribution Margin (Selling Price – Food Cost).
- **Sales Velocity vs Margin Classification**: 
  - Detect high-margin but under-promoted items (Action: Upsell/Promote).
  - Detect low-margin high-volume items (Action: Reprice/Portion Control).
  - Identifies "Star" and "Dog" items.
- **Smart Combo Recommendations**: Uses association rule mining (frequent itemsets) to suggest intelligent combos, increasing Average Order Value (AOV).

### 2. AI Voice Ordering Copilot
- **Natural Language Voice Capture**: Multilingual support (English, Hindi, Hinglish) via **Groq Whisper API**.
- **Intent Recognition & Parsing**: Uses **Groq LLaMA 3 (70B)** to parse fuzzy natural language voice transcripts into a clean, structured JSON order schema.
- **Live Cart Interface**: Watch the AI populate the PoS cart in real-time as the user speaks, handling modifiers (e.g., "extra spicy", "no onions").

---

## Project Structure
- `backend/` - FastAPI python application, SQLite database, and AI service logic.
- `frontend/` - React application utilizing Vite, Recharts, and a custom CSS glassmorphism UI.

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Python 3.9+
- Node.js 18+
- A valid **GROQ API Key** (Get yours at [console.groq.com](https://console.groq.com))

### 1. Backend Setup (FastAPI + Groq)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Virtual Environment:
   ```bash
   # On Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   
   # On Windows
   # python -m venv venv
   # venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(If `requirements.txt` is missing, run: `pip install fastapi uvicorn sqlite-utils sqlalchemy pydantic groq python-dotenv python-multipart`)*

4. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory and add your Groq API key:
   ```text
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Seed the Database** (to power the Revenue intelligence):
   Run the seed script to generate mock menu items and transactional data:
   ```bash
   python seed.py
   ```

6. **Start the Backend Server**:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will start at `http://localhost:8000`.

---

### 2. Frontend Setup (React + Vite)

Open a **new terminal window**.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173` (or the port Vite provides). Open this URL in your browser.

---

## How to Test the Flow

1. **Dashboard**: Navigate to `http://localhost:5173/` to interact with the Profitability Matrix and see the dynamically generated AI combos.
2. **Voice Copilot**: Navigate to `http://localhost:5173/voice`. Click the beautiful animated microphone icon, allow microphone permissions, and speak a natural order! 
   - *Example (Hinglish)*: "Mujhe ek butter chicken aur do garlic naan chahiye, make the chicken extra spicy".
   - The AI will process this over the backend and populate the cart automatically.
