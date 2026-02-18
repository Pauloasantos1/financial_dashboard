import { useMemo, useState } from "react";
import { useAppStore } from "../state/store";
import type { Asset, AssetType } from "../models/asset";

type PortfolioTotals = {
  cost_basis: number;
  market_value: number;
  gain_loss: number;
  gain_loss_pct: number | null;
};

type EnrichedAsset = {
  id: string;
  asset_type: string;
  symbol: string;
  quantity: number;
  cost_basis: number;
  account?: string;
  current_price: number | null;
  market_value: number;
  gain_loss: number;
  gain_loss_pct: number | null;
  pricing_source: string;
  notes?: string;
};

type NewsItem = {
  title: string;
  link: string;
  published_at: string;
  source: string;
};

type OverviewResponse = {
  as_of: string;
  totals: PortfolioTotals;
  assets: EnrichedAsset[];
  news_by_symbol: Record<string, NewsItem[]>;
};

const ASSET_TYPES: AssetType[] = ["stock", "fund", "Crypto", "real_estate", "hysa", "cash", "bond"];

const API_BASE = "http://localhost:8000";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const pct = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

function formatPct(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "-";
  return pct.format(value / 100);
}

function makeAsset(input: {
  assetType: AssetType;
  symbol: string;
  quantity: number;
  costBasis: number;
  account: string;
}): Asset {
  const base = {
    id: crypto.randomUUID(),
    assetType: input.assetType,
    symbol: input.symbol.toUpperCase(),
    quantity: input.quantity,
    costBasis: input.costBasis,
    account: input.account,
  };

  if (input.assetType === "real_estate") {
    return {
      ...base,
      assetType: "real_estate",
      quantity: 1,
      meta: {
        currentEstimate: input.costBasis,
        mortgageBalance: 0,
        mortgageRate: 0,
      },
    };
  }

  if (input.assetType === "bond") {
    return {
      ...base,
      assetType: "bond",
      meta: {
        coupon: 0,
        maturityDate: new Date(),
        parValue: input.costBasis,
      },
    };
  }

  return base as Asset;
}

export default function Portfolio() {
  const { assets, addAsset, removeAsset } = useAppStore();

  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [costBasis, setCostBasis] = useState("");
  const [account, setAccount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);

  const canSubmit = useMemo(() => {
    return symbol.trim() && Number(quantity) > 0 && Number(costBasis) >= 0;
  }, [symbol, quantity, costBasis]);

  async function refreshOverview() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/portfolio/overview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: assets.map((a) => ({
            id: a.id,
            asset_type: a.assetType,
            symbol: a.symbol,
            quantity: a.quantity,
            cost_basis: a.costBasis,
            account: a.account,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error ${response.status}`);
      }

      const payload = (await response.json()) as OverviewResponse;
      setOverview(payload);
    } catch {
      setError("Could not fetch live pricing/news. Ensure backend is running on localhost:8000.");
    } finally {
      setLoading(false);
    }
  }

  function onAddAsset(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    addAsset(
      makeAsset({
        assetType,
        symbol: symbol.trim(),
        quantity: Number(quantity),
        costBasis: Number(costBasis),
        account: account.trim(),
      })
    );

    setSymbol("");
    setQuantity("1");
    setCostBasis("");
    setAccount("");
  }

  const displayedAssets = overview?.assets ?? [];

  return (
    <main className="portfolio-page">
      <section className="hero">
        <h1>Unified Investment Dashboard</h1>
        <p>Track stocks, crypto, savings, real estate, and more in one place with live pricing and relevant news.</p>
      </section>

      <section className="card">
        <h2>Add Asset</h2>
        <form className="asset-form" onSubmit={onAddAsset}>
          <select value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)}>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Ticker / Name (AAPL, BTC, House1)" />
          <input value={quantity} type="number" min="0" step="0.0001" onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" />
          <input value={costBasis} type="number" min="0" step="0.01" onChange={(e) => setCostBasis(e.target.value)} placeholder="Cost basis per unit" />
          <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account (optional)" />
          <button type="submit" disabled={!canSubmit}>Add</button>
        </form>
      </section>

      <section className="card">
        <div className="actions">
          <h2>Portfolio</h2>
          <button onClick={refreshOverview} disabled={loading || assets.length === 0}>
            {loading ? "Refreshing..." : "Refresh Live Data"}
          </button>
        </div>

        {assets.length === 0 ? <p>Add your first asset to get started.</p> : null}

        {overview ? (
          <div className="totals-grid">
            <article>
              <span>Market Value</span>
              <strong>{usd.format(overview.totals.market_value)}</strong>
            </article>
            <article>
              <span>Cost Basis</span>
              <strong>{usd.format(overview.totals.cost_basis)}</strong>
            </article>
            <article>
              <span>Gain / Loss</span>
              <strong className={overview.totals.gain_loss >= 0 ? "pos" : "neg"}>{usd.format(overview.totals.gain_loss)}</strong>
            </article>
            <article>
              <span>Return</span>
              <strong className={overview.totals.gain_loss >= 0 ? "pos" : "neg"}>{formatPct(overview.totals.gain_loss_pct)}</strong>
            </article>
          </div>
        ) : null}

        {error ? <p className="error">{error}</p> : null}

        {displayedAssets.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Live Price</th>
                  <th>Value</th>
                  <th>P/L</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedAssets.map((item) => (
                  <tr key={item.id}>
                    <td>{item.symbol}</td>
                    <td>{item.asset_type}</td>
                    <td>{item.quantity}</td>
                    <td>{item.current_price !== null ? usd.format(item.current_price) : "-"}</td>
                    <td>{usd.format(item.market_value)}</td>
                    <td className={item.gain_loss >= 0 ? "pos" : "neg"}>{usd.format(item.gain_loss)}</td>
                    <td>
                      <button onClick={() => removeAsset(item.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {overview ? (
        <section className="card">
          <h2>Today’s Relevant News</h2>
          <div className="news-grid">
            {Object.entries(overview.news_by_symbol).map(([assetSymbol, items]) => (
              <article key={assetSymbol} className="news-column">
                <h3>{assetSymbol}</h3>
                {items.length === 0 ? <p>No fresh items found today.</p> : null}
                {items.map((item) => (
                  <a key={`${assetSymbol}-${item.link}`} href={item.link} target="_blank" rel="noreferrer">
                    <strong>{item.title}</strong>
                    <span>{item.source}</span>
                  </a>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
