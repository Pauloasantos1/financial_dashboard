# Financial Dashboard

A unified investment dashboard built with React + FastAPI (+ Electron wrapper) to track assets in one place.

## What it does today
- Add and manage assets across: stocks, funds, crypto, savings/cash, real estate, and bonds.
- View portfolio totals: market value, cost basis, gain/loss, and return %.
- Pull live pricing for supported assets.
- Pull relevant news per asset (prioritizes current-day items when available).

## Tech stack
- Frontend: React + Vite + TypeScript + Zustand
- Backend: FastAPI + Python
- Desktop shell: Electron

## Project structure
- `frontend/` React app
- `backend/` FastAPI API
- `electron/` Electron launcher

## Run locally
From project root: `/Users/paulosantos/Desktop/Github Projects/finance/financial_dashboard`

### Option A: start everything together
```bash
npm run start
```
This runs backend + frontend + Electron together.

### Option B: run web app only (recommended during development)
Terminal 1:
```bash
npm run start:backend
```
Terminal 2:
```bash
npm run start:frontend
```
Then open the URL printed by Vite (usually `http://localhost:5173`).

## API routes (current)
- `GET /hello`
- `GET /data`
- `GET /assets`
- `POST /assets`
- `GET /assets/{asset_id}`
- `POST /portfolio/overview` (live pricing + portfolio totals + relevant news)

## Notes
- Live quote/news quality depends on external providers and network availability.
- Some asset classes currently use fallback valuation logic until dedicated data feeds are added.

## Troubleshooting
- If `localhost:5173` hangs, try `http://127.0.0.1:5173`.
- Make sure backend is running on `http://localhost:8000` before using “Refresh Live Data”.
- If port `5173` is busy, Vite may start on `5174` or another port; use the exact URL printed in terminal.
