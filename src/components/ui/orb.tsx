import { cn } from "@/lib/utils";

type OrbVariant = "sunset" | "lagoon" | "bloom" | "meadow";

const gradients: Record<OrbVariant, string> = {
  sunset:
    "radial-gradient(circle at 28% 24%, rgba(255,255,255,0.85), transparent 34%), radial-gradient(circle at 72% 78%, var(--orb-c), transparent 62%), linear-gradient(140deg, var(--orb-a), var(--orb-b))",
  lagoon:
    "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.8), transparent 34%), radial-gradient(circle at 75% 80%, #1c3ccf, transparent 60%), linear-gradient(140deg, #8fd3ff, #3f6bff)",
  bloom:
    "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.8), transparent 34%), radial-gradient(circle at 74% 78%, #7a1d5a, transparent 62%), linear-gradient(140deg, #ffc1dc, #d0589a)",
  meadow:
    "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.8), transparent 34%), radial-gradient(circle at 74% 78%, #0b5d3a, transparent 62%), linear-gradient(140deg, #d6f5a8, #2fa56a)",
};

interface OrbProps {
  size?: number | string;
  variant?: OrbVariant;
  className?: string;
  blur?: boolean;
}

export function Orb({ size = 40, variant = "sunset", className, blur }: OrbProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-full", blur && "blur-2xl", className)}
      style={{ width: size, height: size, background: gradients[variant] }}
    />
  );
}
