import { passwordStrength } from "@/features/auth/schemas";
import { cn } from "@/lib/utils";

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = passwordStrength(password);
  const tone = score <= 1 ? "bg-danger" : score === 2 ? "bg-warning" : "bg-success";

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn("bg-muted h-1 flex-1 rounded-full", score >= step && tone)}
          />
        ))}
      </div>
      <span className="text-muted-foreground w-16 text-right text-xs">{label}</span>
    </div>
  );
}
