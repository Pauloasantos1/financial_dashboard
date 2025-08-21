# My Finance Dashboard - PWA + FastAPI + Electron

[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=061925)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-05998B?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-2C2E3B?logo=electron&logoColor=9FEAF9)](https://www.electronjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-000)](LICENSE)

A personal **financial dashboard** that runs as a **PWA** in the browser, a **desktop application** via Electron, and serves **API Data** with FastAPI. Built to track holdings, goals, 
and (eventually) real-time signals.

---
**Flow:** UI (Vite) → calls API (FastAPI) → Electron wraps UI for desktop.  
In dev, Electron loads `http://127.0.0.1:5173`. In prod, it’ll load the built `dist/`.

---

##  Quick note

> Prereqs: Node 22+, Python 3.10+ (or similar)
> Prefer 127.0.0.1 over localhost to avoid IPv6 quirks in dev.

### 1) Clone
```bash
git clone https://github.com/Pauloasantos1/financial_dashboard.git
cd financial_dashboard
```

 ### 2) Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate            # (Windows: venv\Scripts\activate)
pip install -r requirements.txt     # or: pip install fastapi "uvicorn[standard]" python-dotenv requests
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3) Frontend (Vite)
```bash
cd ../frontend
npm install
npm run dev     # http://127.0.0.1:5173
```

### 4) Electron (Desktop)
```bash
npm install
npm start # Runs backend + frontend + electron in one shot (see scripts below)
```

## Root NPM Scripts
| Script | What it does |
|--------|--------------|
| npm start | Starts **backend + frontend + electron** together (dev)|
| npm run start:backend | Runs FastAPI with uvicorn on 127.0.0.1:8000|
| npm run start:frontend | Runs Vite dev server on 127.0.0.1:5173|
| npm run start: electron | Launches electron pointing at Vite dev |


## API (Current Routes)
| Method | Path | Description |
|:--------:|------|-------------|
| Get | /hello?name=Paulo| Simple greeting |
| Get | /data | Returns { "message": "Hello from /data endpoint!"} |


## Environment & Secrets
...ssshhh coming soon! 
