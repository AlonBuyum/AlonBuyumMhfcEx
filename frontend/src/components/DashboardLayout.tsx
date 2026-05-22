import type { ReactNode } from "react";
import { Button } from "primereact/button";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="dashboard-header">
        <h1>
          <i className="pi pi-chart-line" style={{ marginRight: "0.5rem" }} />
          Crypto Advisor
        </h1>
        <div className="dashboard-header-actions">
          <span className="muted">
            Signed in as <strong>{user?.name}</strong>
          </span>
          <Button
            icon="pi pi-sign-out"
            label="Sign out"
            text
            severity="secondary"
            onClick={handleLogout}
          />
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
