import { DashboardLayout } from "../components/DashboardLayout";
import { NewsSection } from "../components/NewsSection";
import { PricesSection } from "../components/PricesSection";
import { MemeSection } from "../components/MemeSection";

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="dashboard-grid">
        <NewsSection />
        <PricesSection />
        <MemeSection />
      </div>
    </DashboardLayout>
  );
}
