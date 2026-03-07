# HACKaMINeD Voice & Revenue Copilot

An AI-powered Point-of-Sale (POS) Copilot and Advanced Revenue Analytics Dashboard built for the Petpooja Hackathon. This project transforms standard restaurant operations by integrating voice-driven ordering, intelligent upsells, and predictive revenue tools.

## 🚀 Key Innovation Features (Hackathon Focus)

1. **AI Voice & Call Simulator (`/api/voice/conversation`)**
   - **Continuous Conversational AI**: Replaces traditional walk-in and phone orders with a LLaMA 3.3 powered intelligent agent.
   - **Contextual Memory**: The AI remembers the running cart, handles modifications, and answers questions accurately across multi-turn conversations.
   - **Automated Upselling**: Intelligently recommends high-margin items during the call based on the customer's current cart.

2. **Advanced Revenue Intelligence Engine**
   - **The Menu Matrix**: Analyzes thousands of historical data points to classify menu items into industry-standard profitability categories: Stars, Plowhorses, Puzzles, and Dogs.
   - **Smart Combos**: Uses association rule algorithms to automatically suggest the most profitable combo offerings based on real ordering behaviors.

3. **Petpooja Ecosystem Integrations (Phase 15 Features)**
   - **AI Marketing Campaign Generator**: Single-click "WhatsApp Promo" generation to boost sales for *Puzzle* items (High Margin / Low Volume).
   - **Predictive Inventory & Smart Stock Alerts**: Calculates live sales velocity to predict raw material stock-outs (e.g., "Butter Chicken depletes in 2 days"). Integrates a mock 1-click "Petpooja Supplier Hub Restock".
   - **Dynamic Surge Pricing**: Real-time pricing toggle to slightly increase prices (+5%) on *Plowhorse* items (Low Margin / High Volume) during peak operational hours.

---

## 🛠️ Technology Stack

* **Frontend**: React, Vite, Recharts, Lucide-React, Web Speech API (for TTS and Speech Recognition).
* **Backend**: FastAPI (Python), SQLAlchemy, SQLite, Uvicorn.
* **AI & LLM**: Groq Cloud API, LLaMA 3.3 70B Versatile.

---

## ⚙️ Build and Installation

### Prerequisites
- Python 3.10+
- Node.js & npm
- A Groq API Key

### 1. Setup the Backend
Navigate to the backend directory, install dependencies, and run the database seeder to inject the mock Indian menu and 250 test orders.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the DB seed script to generate menu analytics
python seed.py

# Create a .env file and add your Groq API Key
echo "GROQ_API_KEY=your_api_key_here" > .env

# Start the FastAPI server
uvicorn main:app --reload
```
*The backend will be running at http://localhost:8000*

### 2. Setup the Frontend
Navigate to the frontend directory, install the packages, and run the Vite server.

```bash
cd frontend
npm install
npm run dev
```
*The React app will be running at http://localhost:5173*

---

## 🎨 System Walkthrough

* **Dashboard (Revenue Engine)**: View the interactive scatter plot categorizing your items. Check the Right sidebar for real-time AI Alerts regarding low stock and marketing opportunities.
* **Walk-In Copilot**: Click the microphone to simulate a POS kiosk receiving a verbal order.
* **Simulate Call**: A multi-turn conversational simulator. Let the browser speak to you, and respond back using the microphone to build an order progressively.
* **Order History**: A complete log of all completed transactions processed by the AI.

## 📁 Repository Structure

```
├── backend/
│   ├── core/
│   │   ├── database.py   # SQLAlchemy setup
│   │   ├── models.py     # SQLite schema definitions
│   │   └── schemas.py    # Pydantic validation models
│   ├── routers/          # FastAPI endpoint routes
│   ├── services/         # Business logic (Groq API, Revenue Math)
│   ├── main.py           # App Entrypoint
│   └── seed.py           # Analytics data generator
└── frontend/
    └── src/
        ├── api/          # Axios API client functions
        ├── components/   # Reusable UI elements
        └── pages/        # Dashboard, Copilots, etc.
```

---
*Developed for the Petpooja Hackathon by Manan Suri.*
