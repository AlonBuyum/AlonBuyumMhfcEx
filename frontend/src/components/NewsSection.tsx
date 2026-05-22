import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { useNews } from "../hooks/useNews";

function formatPublishedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const header = (
  <span>
    <i className="pi pi-globe" style={{ marginRight: "0.5rem" }} />
    Market News
  </span>
);

export function NewsSection() {
  const { data, isLoading, isError, error } = useNews();

  return (
    <Card title={header} className="section-card">
      {isLoading ? (
        <div>
          <Skeleton height="2rem" className="mb-2" />
          <Skeleton height="2rem" className="mb-2" />
          <Skeleton height="2rem" className="mb-2" />
          <Skeleton height="2rem" className="mb-2" />
        </div>
      ) : isError ? (
        <Message severity="error" text={(error as Error)?.message ?? "Failed to load news"} />
      ) : !data || data.items.length === 0 ? (
        <Message severity="info" text="No news available right now" />
      ) : (
        <>
          {data.usedFallback ? (
            <div className="fallback-tag">Showing cached fallback (live source unavailable)</div>
          ) : null}
          <div style={{ marginTop: data.usedFallback ? "0.75rem" : 0 }}>
            {data.items.map((item, idx) => (
              <div key={`${item.url}-${idx}`} className="news-item">
                <a className="news-link" href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
                <div className="muted">
                  {item.source} · {formatPublishedAt(item.publishedAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
