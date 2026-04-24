# HACKaMINeD

## Overview

HACKaMINeD is a Point-of-Sale (POS) tool and revenue dashboard created for the Petpooja Hackathon. It enhances standard restaurant systems with voice-based ordering, automatic upselling, and deep sales analytics.

---

## Features

### AI Voice Agent
- Take customer orders using a LLaMA 3.3 model instead of manual input
- Remember cart contents and handle order changes across the conversation
- Automatically suggest high-margin items based on what is in the cart
- Native browser speech synthesis for fast spoken responses
- Speech-to-text processing that understands mixed Hindi and English (Hinglish)

### Revenue Intelligence
- Calculate profit margins in real time
- Categorize menu items based on past sales data and profitability
- Highlight highly profitable items that need more promotion
- Warn about items that sell well but have low profit margins
- Create smart combo suggestions based on items frequently bought together

### Petpooja Integrations
- Suggest small price increases during busy hours to protect margins
- Track how fast items sell to warn before ingredients run out
- Generate promotional WhatsApp messages with one click to boost sales

### Tech Stack
- Frontend: React, Vite, Recharts
- Backend: FastAPI, SQLAlchemy, SQLite
- AI: Groq Cloud, Whisper-Large-v3, LLaMA 3.3 70B

---

## Setup & Installation

### Backend
- Requires Python 3.10+ and a Groq API Key
- Navigate to the `backend` folder and create a virtual environment
- Run `pip install -r requirements.txt` to install Python packages
- Run `python seed.py` to generate the test data
- Add your Groq API Key to a `.env` file
- Start the server with `uvicorn main:app --reload` (runs on port 8000)

### Frontend
- Requires Node.js and npm
- Navigate to the `frontend` folder
- Run `npm install` to install JavaScript packages
- Start the development server with `npm run dev` (runs on port 5173)

---
*Developed for the Hackamined Petpooja Hackathon by Manan Suri, Dhaval Khandelwal and Sambhav Jain.*
