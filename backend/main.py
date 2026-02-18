from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any, List, Optional
import os
import xml.etree.ElementTree as ET

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "7"))


class Assets(BaseModel):
    id: str
    asset_type: str
    symbol: str
    quantity: float
    cost_basis: float
    account: Optional[str] = None


class PortfolioNewsItem(BaseModel):
    title: str
    link: str
    published_at: str
    source: str


class EnrichedAsset(BaseModel):
    id: str
    asset_type: str
    symbol: str
    quantity: float
    cost_basis: float
    account: Optional[str] = None
    current_price: Optional[float] = None
    market_value: float
    gain_loss: float
    gain_loss_pct: Optional[float] = None
    pricing_source: str
    notes: Optional[str] = None


class PortfolioOverviewRequest(BaseModel):
    assets: List[Assets]


assets_db: List[Assets] = []

COINGECKO_SYMBOL_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "ADA": "cardano",
    "XRP": "ripple",
    "DOGE": "dogecoin",
    "BNB": "binancecoin",
    "AVAX": "avalanche-2",
    "DOT": "polkadot",
    "LINK": "chainlink",
    "MATIC": "matic-network",
}


@app.get("/assets")
def get_assets():
    return assets_db


@app.post("/assets")
def create_assets(asset: Assets):
    assets_db.append(asset)
    return {"message": "Asset added successfully", "asset": asset}


@app.get("/assets/{asset_id}")
def get_asset(asset_id: str):
    for asset in assets_db:
        if asset.id == asset_id:
            return asset
    return {"error": "Asset not found"}


@app.get("/hello")
def health_check(name: str = "world"):
    return {"message": f"Hello, {name}!"}


@app.get("/data")
def read_data():
    return {"message": "Hello from /data endpoint!"}


def _safe_float(value: Any) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _stock_price(symbol: str) -> Optional[float]:
    normalized = symbol.strip().lower()
    if "." not in normalized:
        normalized = f"{normalized}.us"
    url = f"https://stooq.com/q/l/?s={normalized}&f=sd2t2ohlcv&h&e=csv"
    response = requests.get(url, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    lines = response.text.strip().splitlines()
    if len(lines) < 2:
        return None
    row = lines[1].split(",")
    if len(row) < 7:
        return None
    return _safe_float(row[6])


def _crypto_price(symbol: str) -> Optional[float]:
    coin_id = COINGECKO_SYMBOL_MAP.get(symbol.strip().upper())
    if not coin_id:
        return None
    response = requests.get(
        "https://api.coingecko.com/api/v3/simple/price",
        params={"ids": coin_id, "vs_currencies": "usd"},
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    payload = response.json()
    return _safe_float(payload.get(coin_id, {}).get("usd"))


def _get_price(asset_type: str, symbol: str, cost_basis: float) -> tuple[Optional[float], str, Optional[str]]:
    kind = asset_type.lower()
    if kind in {"stock", "fund"}:
        try:
            price = _stock_price(symbol)
            if price is not None:
                return price, "stooq", None
            return None, "stooq", "No quote found"
        except requests.RequestException:
            return None, "stooq", "Quote service unavailable"
    if kind == "crypto":
        try:
            price = _crypto_price(symbol)
            if price is not None:
                return price, "coingecko", None
            return None, "coingecko", "Unsupported crypto symbol"
        except requests.RequestException:
            return None, "coingecko", "Quote service unavailable"
    if kind in {"cash", "hysa", "savings"}:
        return 1.0, "static", "Cash is valued at par in USD"
    if kind == "real_estate":
        return cost_basis, "user_cost_basis", "Using cost basis until valuation feed is connected"
    if kind == "bond":
        return cost_basis, "user_cost_basis", "Using cost basis until bond quote feed is connected"
    return cost_basis, "user_cost_basis", "Fallback valuation used"


def _parse_google_news_item(item: ET.Element) -> Optional[PortfolioNewsItem]:
    title = item.findtext("title") or ""
    link = item.findtext("link") or ""
    pub = item.findtext("pubDate") or ""
    source = item.findtext("source") or "Google News"
    if not title or not link:
        return None
    return PortfolioNewsItem(title=title, link=link, published_at=pub, source=source)


def _asset_news_query(asset_type: str, symbol: str) -> str:
    kind = asset_type.lower()
    if kind == "crypto":
        return f"{symbol} crypto"
    if kind in {"stock", "fund"}:
        return f"{symbol} stock"
    if kind == "real_estate":
        return f"{symbol} real estate market"
    return f"{symbol} finance"


def _fetch_news_today(query: str, limit: int = 4) -> List[PortfolioNewsItem]:
    response = requests.get(
        "https://news.google.com/rss/search",
        params={"q": query, "hl": "en-US", "gl": "US", "ceid": "US:en"},
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    root = ET.fromstring(response.content)
    items = root.findall(".//item")
    parsed: List[PortfolioNewsItem] = []
    today_utc = datetime.now(timezone.utc).date()

    for item in items:
        parsed_item = _parse_google_news_item(item)
        if not parsed_item:
            continue
        try:
            published_dt = parsedate_to_datetime(parsed_item.published_at).astimezone(timezone.utc)
            if published_dt.date() == today_utc:
                parsed.append(parsed_item)
        except (TypeError, ValueError):
            continue
        if len(parsed) >= limit:
            break

    if parsed:
        return parsed

    for item in items[:limit]:
        parsed_item = _parse_google_news_item(item)
        if parsed_item:
            parsed.append(parsed_item)
    return parsed


@app.post("/portfolio/overview")
def portfolio_overview(payload: PortfolioOverviewRequest):
    enriched_assets: List[EnrichedAsset] = []
    news_by_symbol: dict[str, List[PortfolioNewsItem]] = {}
    total_cost = 0.0
    total_value = 0.0

    for asset in payload.assets:
        current_price, source, notes = _get_price(asset.asset_type, asset.symbol, asset.cost_basis)
        effective_price = current_price if current_price is not None else asset.cost_basis
        market_value = effective_price * asset.quantity
        position_cost = asset.cost_basis * asset.quantity
        gain_loss = market_value - position_cost
        gain_loss_pct = (gain_loss / position_cost * 100) if position_cost > 0 else None

        enriched_assets.append(
            EnrichedAsset(
                id=asset.id,
                asset_type=asset.asset_type,
                symbol=asset.symbol.upper(),
                quantity=asset.quantity,
                cost_basis=asset.cost_basis,
                account=asset.account,
                current_price=current_price,
                market_value=market_value,
                gain_loss=gain_loss,
                gain_loss_pct=gain_loss_pct,
                pricing_source=source,
                notes=notes,
            )
        )

        total_cost += position_cost
        total_value += market_value

        symbol_key = asset.symbol.upper()
        if symbol_key not in news_by_symbol:
            try:
                query = _asset_news_query(asset.asset_type, symbol_key)
                news_by_symbol[symbol_key] = _fetch_news_today(query)
            except requests.RequestException:
                news_by_symbol[symbol_key] = []

    total_gain_loss = total_value - total_cost
    total_gain_loss_pct = (total_gain_loss / total_cost * 100) if total_cost > 0 else None

    return {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "totals": {
            "cost_basis": round(total_cost, 2),
            "market_value": round(total_value, 2),
            "gain_loss": round(total_gain_loss, 2),
            "gain_loss_pct": round(total_gain_loss_pct, 2) if total_gain_loss_pct is not None else None,
        },
        "assets": enriched_assets,
        "news_by_symbol": news_by_symbol,
    }
