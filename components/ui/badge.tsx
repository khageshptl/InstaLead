import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@prisma/client";

const confidenceStyles: Record<ConfidenceLevel, string> = {
  HIGH: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  LOW: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | ConfidenceLevel;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default"
          ? "bg-secondary text-secondary-foreground border-border"
          : confidenceStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
