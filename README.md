# SecAnalyzer — Web-Based Security Analyzer
> University Project | Full-Stack Security Tool | React + Node.js + MongoDB

https://github.com/user-attachments/assets/038b16e3-c8a4-4825-9b0a-5ae83fdfa468


---

## Project Overview

SecAnalyzer is a web application that helps users understand password security and network exposure through an educational, dashboard-style interface.

### Features
| Feature | Description |
|---|---|
| Password Strength Checker | Entropy, charset analysis, crack time estimation, common password detection |
| Network Scanner (Simulation) | Safe mock port scan with service detection and risk indicators |
| User Authentication | JWT-based register/login — no sessions, stateless |
| History Tracking | Logged-in users can save and review past password checks |

---

## Project Structure

```
sec-analyzer/
├── package.json              ← root: run both servers with one command
│
├── backend/
│   ├── server.js             ← Express app entry point
│   ├── package.json
│   ├── .env.example          ← copy to .env and fill in values
│   ├── middleware/
│   │   └── auth.js           ← JWT verification middleware
│   ├── models/
│   │   ├── User.js           ← Mongoose user schema (bcrypt hashed passwords)
│   │   └── History.js        ← Password check history schema
│   └── routes/
│       ├── auth.js           ← POST /register, POST /login, GET /me
│       ├── password.js       ← POST /analyze (open to all)
│       ├── network.js        ← POST /scan (educational simulation)
│       └── history.js        ← GET/POST/DELETE /history (protected)
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx           ← Router setup
        ├── App.css           ← Global dark theme
        ├── index.js          ← React entry point
        ├── hooks/
        │   └── useAuth.js    ← Auth context (login/logout/user state)
        ├── utils/
        │   ├── api.js        ← Axios instance with JWT interceptor
        │   └── passwordAnalyzer.js ← Client-side password analysis logic
        ├── components/
        │   └── Layout.jsx    ← Nav bar + auth modal
        └── pages/
            ├── PasswordPage.jsx ← Password strength analyzer UI
            ├── NetworkPage.jsx  ← Network scanner simulation UI
            └── HistoryPage.jsx  ← Saved history (auth required)
```

---

## Quick Start (Step-by-Step)

### Prerequisites
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (Community Edition) → https://www.mongodb.com/try/download/community
- A terminal (Terminal on Mac, Command Prompt / PowerShell on Windows)

---

### Step 1 — Clone or Download the Project

If using Git:
```bash
git clone <your-repo-url>
cd sec-analyzer
```

Or simply unzip the project folder and open a terminal inside `sec-analyzer/`.

---

### Step 2 — Set Up the Backend

```bash
cd backend
npm install
```

Copy the environment file and edit it:
```bash
cp .env.example .env
```

Open `.env` and set:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sec-analyzer
JWT_SECRET=anyRandomLongStringHere123!
NODE_ENV=development
```

> **MongoDB not installed?** You can skip MongoDB for now.
> The backend will print a warning but still work — password analysis and
> the network scanner don't need a database. Only auth + history require MongoDB.

---

### Step 3 — Set Up the Frontend

Open a **new terminal tab/window**, then:
```bash
cd frontend
npm install
```

---

### Step 4 — Run the Project

**Option A — Two terminals (recommended for beginners):**

Terminal 1 (backend):
```bash
cd backend
npm run dev
# → Server running on http://localhost:5001
```

Terminal 2 (frontend):
```bash
cd frontend
npm start
# → App opens at http://localhost:3000
```

**Option B — Single command from root:**
```bash
# In the root sec-analyzer/ folder
npm install          # installs concurrently
npm run dev          # starts both backend + frontend
```

---

### Step 5 — Open the App

Visit: **http://localhost:3000**

To verify the backend is working:
Visit: **http://localhost:5001/api/health**
→ Should return `{"status":"ok"}`

---

## Example Data & Test Cases

### Password Analyzer

| Password | Expected Result |
|---|---|
| `123456` | CRITICAL — common password detected |
| `hello` | WEAK — too short, no numbers/symbols |
| `Hello123` | FAIR — no symbols, moderate length |
| `Hello@123` | GOOD — mixed charset, reasonable length |
| `T!g3r#Sun$2024Xr` | STRONG — high entropy, all charset types |

### Network Scanner

| Target | Scan Type | Expected |
|---|---|---|
| `192.168.1.1` | Quick | 4 ports, MySQL flagged as high risk |
| `example.com` | Full | 8 ports, Telnet flagged as critical |
| `10.0.0.1` | Vuln | 6 ports, Telnet + SMB as critical |

### Auth Flow

1. Click **Login** in the top nav
2. Enter any email + password (min 6 chars)
3. Click **Register** (first time) or **Login**
4. Analyze a password → click **Save to History**
5. Visit the **History** tab to see saved records

---

## API Endpoints Reference

### Public (no auth needed)
```
GET  /api/health              → server status
POST /api/password/analyze    → analyze password strength
POST /api/network/scan        → run simulated scan
```

### Auth
```
POST /api/auth/register       → create account
POST /api/auth/login          → get JWT token
GET  /api/auth/me             → get current user (JWT required)
```

### History (JWT required)
```
GET    /api/history           → list all user's records
POST   /api/history           → save a new record
DELETE /api/history/:id       → delete one record
DELETE /api/history           → clear all records
```

### Example: Analyze a password with curl
```bash
curl -X POST http://localhost:5001/api/password/analyze \
  -H "Content-Type: application/json" \
  -d '{"password": "Hello@123"}'
```

Expected response:
```json
{
  "score": 65,
  "strength": "GOOD",
  "entropy": 52,
  "crackTimeEstimate": "3 days",
  "isCommonPassword": false,
  "composition": { "uppercase": 1, "lowercase": 4, "numbers": 3, "symbols": 1 },
  "criteria": {
    "hasMinLength": true,
    "hasUppercase": true,
    "hasLowercase": true,
    "hasNumbers": true,
    "hasSymbols": true,
    "hasGoodLength": false
  },
  "feedback": ["Consider 12+ characters for stronger security."]
}
```

---

----------------------------------------------------

### Structure 

**1. Introduction**
> "SecAnalyzer is a full-stack security tool built with React, Node.js, and MongoDB.
> It has three modules: password strength analysis, simulated network scanning,
> and a history dashboard for authenticated users."

**2. Architecture overview**
- Point to the folder structure
- Explain: React frontend → calls Express REST API → reads/writes MongoDB
- Mention: JWT auth, bcrypt password hashing, no plaintext passwords stored

**3. Live Demo — Password Analyzer**
- Type a weak password → show CRITICAL score, crack time "instantly"
- Type a strong password → show STRONG score, entropy jump
- Show the entropy visualization, criteria checklist, recommendations
- Mention: "The entropy formula is `length × log₂(charset_size)` — standard information theory"

**4. Live Demo — Network Scanner**
- Type `192.168.1.1`, select Full Scan, click Run
- Walk through the port results, risk badges, service descriptions
- Emphasize: "This is 100% simulated — no real packets are sent"

**5. Auth + History**
- Register with a test email
- Save a password check
- Show the history tab with masked passwords and metadata

**6. Security practices used**
- bcrypt hashing for stored passwords
- JWT stateless authentication
- Masked passwords in history (never store plain text)
- CORS configured to allow only the frontend origin
- Input validation on all API routes

### Key Technical Points to Mention
- **Entropy calculation**: `H = L × log₂(N)` where L = length, N = charset size
- **Crack time model**: assumes 10 billion guesses/second (GPU benchmark)
- **Common password list**: SHA-1 k-anonymity model (Have I Been Pwned API ready but using local list for MVP)
- **Network simulation**: designed to be safe and legal — zero real scanning

---

## Security Notes (important for your report)

1. **Passwords are never logged or stored** — only analyzed in memory and discarded
2. **History stores masked passwords** (first 3 chars + bullets) — not the original
3. **bcryptjs** with salt rounds 12 is used for user account passwords
4. **JWT tokens expire in 7 days** and are stored in localStorage (acceptable for MVP)
5. **Network scanner performs zero real scanning** — all data is pre-defined mock data

---

## Optional Enhancements (after MVP)

- [ ] Enable Have I Been Pwned API (code is already in `routes/password.js, just uncomment). API is not free..
- [ ] Add rate limiting (`express-rate-limit`) to prevent brute force
- [ ] Add password generator feature
- [ ] Export history as CSV/PDF
- [ ] Add dark/light mode toggle
- [ ] Deploy to Render (backend) + Vercel (frontend) for a live URL

---

## Dependencies Summary

### Backend
| Package | Purpose |
|---|---|
| `express` | Web framework / REST API |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth tokens |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |
| `nodemon` | Auto-restart in development |

### Frontend
| Package | Purpose |
|---|---|
| `react` | UI framework |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client with interceptors |

---

*Built as a university project... All network scanning is simulated —no real intrusive scanning is performed.*
