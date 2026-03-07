# HACKaMINeD Voice & Revenue Copilot

An AI-powered Point-of-Sale (POS) Copilot and Advanced Revenue Analytics Dashboard built for the Petpooja Hackathon. This project transforms standard restaurant operations by integrating voice-driven ordering, intelligent upsells, and predictive revenue tools.

## 🚀 Key Innovation Features (Hackathon Focus)

1. **AI Voice & Call Simulator (`/api/voice/conversation`)**
   - **Continuous Conversational AI**: Replaces traditional walk-in and phone orders with a LLaMA 3.3 powered intelligent agent.
   - **Contextual Memory**: The AI remembers the running cart, handles modifications, and answers questions accurately across multi-turn conversations.
   - **Automated Upselling**: Intelligently recommends high-margin items during the call based on the customer's current cart.

2. **Advanced Revenue Intelligence Engine**
   - **Contribution Margin Calculation**: Live tracked as `Selling Price - Food Cost`.
   - **Item-Level Profitability Analysis**: The Menu Matrix analyzes thousands of historical data points to classify menu items.
   - **Sales Velocity & Popularity Scoring**: Tracks average daily volume (`volume / active days`) against revenue.
   - **High-Margin / Under-Promoted Detection**: Flags *Puzzle* items and surfaces tools to promote them.
   - **Low-Margin / High-Volume Risk Detection**: Flags *Plowhorse* items that eat into net margins.
   - **Automated Combo Recommendations**: Simple association rule mining (`find pairs of items frequently ordered together`) directly outputs actionable bundles.
   - **Smart Upsell Prioritization Logic**: Recommends combos that maximize Average Order Value.

3. **Petpooja Ecosystem Integrations (Phase 15 Features)**
   - **Price Optimization Recommendations**: Dynamic Surge Pricing allows real-time pricing toggles slightly increasing prices (+5%) on *Plowhorse* items during peak operational hours to protect margins.
   - **Inventory-Linked Performance Signals**: Predictive Inventory & Smart Stock Alerts calculate live sales velocity to predict raw material stock-outs (e.g., "Butter Chicken depletes in 2 days"). Integrates a mock 1-click "Petpooja Supplier Hub Restock".
   - **AI Marketing Campaign Generator**: Single-click "WhatsApp Promo" generation to boost sales for *Puzzle* items (High Margin / Low Volume).

---

## 🛠️ Technology Stack Breakdown

* **Frontend (Presentation & Audio Capture)**:
  * **React & Vite**: Fast, modern component-based UI framework.
  * **Recharts & Lucide-React**: Used for the premium Dashboard data visualizations and iconography.
  * **Web Speech API & MediaRecorder**: Native browser APIs used to capture the user's microphone audio and synthesize the AI's spoken responses (Text-to-Speech) entirely on the client side, eliminating backend latency for TTS.
* **Backend (API & Orchestration)**:
  * **FastAPI (Python)**: High-performance async Python framework. Handles the routing, file uploads (audio blobs), and serves the API predictably.
  * **SQLAlchemy & SQLite**: The ORM and lightweight database storing the `MenuItems`, `Orders`, and `OrderItems`.
* **AI & LLM (Groq Cloud)**:
  * **Groq SDK**: We use Groq because its LPU (Language Processing Unit) architecture provides near-instantaneous inference (hundreds of tokens per second), which is *critical* for real-time voice conversations.
  * **Whisper-Large-v3**: Used to transcribe the incoming audio. It natively understands Hinglish (Hindi + English), which is vital for Indian restaurant contexts.
  * **LLaMA 3.3 70B Versatile**: The core "brain" of the Copilot. It parses the transcripts into structured JSON, manages the conversational state, and generates the text for the AI to speak back.

---

## 🎙️ How the AI Voice Copilot Works (Step-by-Step)

The conversational flow (`/api/voice/conversation`) is designed to mimic a continuous, stateful phone call between a customer and a hyper-intelligent cashier.

1. **Audio Capture**: The user holds the microphone button on the frontend. The React `MediaRecorder` API records the audio and packages it as an `.webm` Blob.
2. **Payload Transmission**: The frontend sends the Audio Blob, the **Chat History** (previous back-and-forth messages), and the **Current Cart** (items already ordered) to the FastAPI backend.
3. **STT (Speech-to-Text)**: FastAPI forwards the audio buffer to the **Groq Whisper API**. Whisper transcribes the speech (even handling thick accents or Hinglish like *"Mujhe do butter chicken chahiye"*) into text.
4. **LLM Intent & State Parsing**: The transcript, Chat History, and Current Cart are injected into a highly-engineered system prompt sent to **LLaMA 3.3 70B**.
   * **The Prompt Rule**: The LLM is instructed to act as a friendly cashier. It reads the user's transcript and *must* output a strict JSON object.
   * **Cumulative Cart**: The LLM analyzes the transcript and either adds new items to the `Current Cart`, modifies them (e.g., "Make it spicy"), or removes them. It is strictly instructed to *never* wipe the cart accidentally during non-ordering banter (e.g., when the user just says "Thank you").
   * **Smart Upselling**: The LLM also looks at the cart and generates a conversational response (`ai_spoken_response`). If appropriate, it injects an upsell (e.g., *"Got it, 2 Butter Chickens. Would you like some Garlic Naan with that?"*).
5. **TTS (Text-to-Speech)**: FastAPI returns the JSON object holding the updated cart and the `ai_spoken_response`. The React frontend instantly updates the visual cart UI, and uses the browser's native `window.speechSynthesis` to read the AI's response aloud to the user.
6. **Checkout**: Once the user says "That's it" or confirms the order, the frontend triggers the `/api/voice/confirm` endpoint, saving the final JSON array into the SQLite database as a real order, and rendering the receipt.

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
*Developed for the Hackamined Petpooja Hackathon by Manan Suri, Dhaval Khandelwal and Sambhav Jain.*
