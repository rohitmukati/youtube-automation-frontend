import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onChange: (offset: number) => void;
  loading?: boolean;
}

export function Pagination({ total, limit, offset, onChange, loading }: PaginationProps) {
  if (total <= limit) return null;
  const from = offset + 1;
  const to = Math.min(offset + limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <p className="text-muted-foreground text-sm">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          disabled={offset === 0 || loading}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          disabled={offset + limit >= total || loading}
          onClick={() => onChange(offset + limit)}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
