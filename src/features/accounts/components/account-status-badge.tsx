import { Badge } from "@/components/ui/badge";
import { getAccountStatus } from "@/features/accounts/status";
import type { YouTubeAccount } from "@/types/api";

export function AccountStatusBadge({ account }: { account: YouTubeAccount }) {
  const status = getAccountStatus(account);
  return (
    <Badge tone={status.tone} dot>
      {status.label}
    </Badge>
  );
}
