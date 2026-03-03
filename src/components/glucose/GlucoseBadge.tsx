import { cn } from "@/lib/utils";

interface GlucoseBadgeProps {
  value: number;
  isAboveLimit: boolean;
  className?: string;
}

export function GlucoseBadge({ value, isAboveLimit, className }: GlucoseBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isAboveLimit
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700",
        className
      )}
    >
      {value} mg/dL
    </span>
  );
}
