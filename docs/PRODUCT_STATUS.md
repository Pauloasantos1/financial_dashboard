# Product Status - Financial Dashboard

## Product goal
Give users one page to view their full investment picture (crypto, stocks/funds, cash/savings, real estate, bonds), with live pricing context and relevant market news.

## What is implemented
- Single-page portfolio dashboard UI.
- Asset entry form and local state persistence (Zustand).
- Backend portfolio overview endpoint that enriches assets with:
  - current price (where supported)
  - market value
  - gain/loss and return %
  - relevant news grouped by asset symbol
- Portfolio totals section (cost basis, market value, total P/L, total return).
- Responsive layout for desktop and mobile.

## Current behavior by asset class
- Stocks/Funds: live quote attempt via market data endpoint.
- Crypto: live quote attempt for mapped symbols.
- Cash/HYSA: valued at USD par.
- Real estate/Bonds: temporary fallback to cost-basis valuation until dedicated feeds are connected.

## Known limitations
- External quote/news dependencies can fail or slow down response time.
- Asset data is not yet persisted in a database (currently in-memory/local client state).
- Authentication and multi-user separation are not implemented.

## Recommended next milestones
1. Add persistent backend storage (SQLite/Postgres).
2. Add API-key based market/news providers with stronger reliability.
3. Add auth + user portfolios.
4. Add edit asset flow and performance visualizations.
