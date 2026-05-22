import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { useMeme, useRefreshMeme } from "../hooks/useMeme";

const header = (
  <span>
    <i className="pi pi-image" style={{ marginRight: "0.5rem" }} />
    Daily Meme
  </span>
);

export function MemeSection() {
  const { data, isLoading, isFetching, isError, error } = useMeme();
  const refresh = useRefreshMeme();

  return (
    <Card title={header} className="section-card">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
        {isLoading ? (
          <Skeleton height="280px" />
        ) : isError ? (
          <Message severity="error" text={(error as Error)?.message ?? "Failed to load meme"} />
        ) : data ? (
          <>
            <img
              src={data.imageUrl}
              alt={data.title}
              className="meme-image"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <strong>{data.title}</strong>
              <div className="muted">
                u/{data.author}
                {data.usedFallback ? <span className="fallback-tag"> · cached fallback</span> : null}
              </div>
            </div>
          </>
        ) : null}
        <div style={{ marginTop: "auto" }}>
          <Button
            icon="pi pi-refresh"
            label="New meme"
            loading={isFetching}
            onClick={refresh}
            outlined
          />
        </div>
      </div>
    </Card>
  );
}
