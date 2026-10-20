import { ConnectedAccountsCard } from "@/features/dashboard/components/connected-accounts-card";
import { DashboardIntro } from "@/features/dashboard/components/dashboard-intro";
import { QuotaCard } from "@/features/dashboard/components/quota-card";
import { RecentUploadsCard } from "@/features/dashboard/components/recent-uploads-card";

export function DashboardView() {
  return (
    <div className="dashboard-ambient flex min-w-0 flex-col gap-8 sm:gap-12">
      <DashboardIntro />

      <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <QuotaCard />
        <ConnectedAccountsCard />
        <RecentUploadsCard />
      </section>
    </div>
  );
}
