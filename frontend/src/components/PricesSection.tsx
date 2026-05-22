import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { usePrices } from "../hooks/usePrices";
import type { CoinPrice } from "../api/dashboard";

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n < 1 ? 4 : 2,
    maximumFractionDigits: n < 1 ? 4 : 2,
  }).format(n);
}

function formatMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

const header = (
  <span>
    <i className="pi pi-dollar" style={{ marginRight: "0.5rem" }} />
    Coin Prices
  </span>
);

function NameCell(coin: CoinPrice) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <img src={coin.image} alt={coin.symbol} width={24} height={24} />
      <span style={{ fontWeight: 600 }}>{coin.name}</span>
      <span className="muted" style={{ textTransform: "uppercase" }}>{coin.symbol}</span>
    </div>
  );
}

function ChangeCell(coin: CoinPrice) {
  const pct = coin.price_change_percentage_24h;
  if (pct === null || pct === undefined) return <span className="muted">—</span>;
  const isUp = pct >= 0;
  return (
    <Tag
      severity={isUp ? "success" : "danger"}
      icon={isUp ? "pi pi-arrow-up" : "pi pi-arrow-down"}
      value={`${pct.toFixed(2)}%`}
    />
  );
}

export function PricesSection() {
  const { data, isLoading, isError, error } = usePrices();

  return (
    <Card title={header} className="section-card">
      {isLoading ? (
        <div>
          <Skeleton height="2.5rem" className="mb-2" />
          <Skeleton height="2.5rem" className="mb-2" />
          <Skeleton height="2.5rem" className="mb-2" />
          <Skeleton height="2.5rem" className="mb-2" />
        </div>
      ) : isError ? (
        <Message severity="error" text={(error as Error)?.message ?? "Failed to load prices"} />
      ) : !data || data.coins.length === 0 ? (
        <Message severity="info" text="No price data available" />
      ) : (
        <DataTable value={data.coins} stripedRows size="small" responsiveLayout="scroll">
          <Column header="Coin" body={NameCell} />
          <Column
            header="Price"
            body={(coin: CoinPrice) => formatUsd(coin.current_price)}
            bodyStyle={{ fontVariantNumeric: "tabular-nums" }}
          />
          <Column header="24h" body={ChangeCell} />
          <Column
            header="Market Cap"
            body={(coin: CoinPrice) => formatMarketCap(coin.market_cap)}
            bodyStyle={{ fontVariantNumeric: "tabular-nums" }}
          />
        </DataTable>
      )}
    </Card>
  );
}
