import { Composer } from "@/features/dashboard/components/composer";
import { ConnectedAccountsCard } from "@/features/dashboard/components/connected-accounts-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { QuotaCard } from "@/features/dashboard/components/quota-card";
import { RecentUploadsCard } from "@/features/dashboard/components/recent-uploads-card";

export function DashboardView() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-8 pt-4 sm:pt-10">
        <h1 className="text-foreground text-center text-[34px] leading-tight font-medium tracking-tight sm:text-[40px]">
          What would you like to publish today?
        </h1>
        <Composer />
        <QuickActions />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <QuotaCard />
        <ConnectedAccountsCard />
        <RecentUploadsCard />
      </section>
    </div>
  );
}
