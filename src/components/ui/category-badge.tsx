import { cn } from "@/lib/utils";

const categoryStyles: Record<string, { bg: string; border: string; text: string; shadow: string; glow: string }> = {
  workout: {
    bg: "bg-[hsl(187_100%_50%/0.12)]",
    border: "border-[hsl(187_100%_50%/0.5)]",
    text: "text-[hsl(187_100%_70%)]",
    shadow: "shadow-[0_0_12px_hsl(187_100%_50%/0.4),inset_0_1px_1px_hsl(187_100%_80%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(187_100%_50%/0.6),inset_0_1px_1px_hsl(187_100%_80%/0.25)]",
  },
  meal: {
    bg: "bg-[hsl(260_60%_55%/0.12)]",
    border: "border-[hsl(260_60%_55%/0.5)]",
    text: "text-[hsl(260_60%_75%)]",
    shadow: "shadow-[0_0_12px_hsl(260_60%_55%/0.4),inset_0_1px_1px_hsl(260_60%_80%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(260_60%_55%/0.6),inset_0_1px_1px_hsl(260_60%_80%/0.25)]",
  },
  posture: {
    bg: "bg-[hsl(43_100%_55%/0.12)]",
    border: "border-[hsl(43_100%_55%/0.5)]",
    text: "text-[hsl(43_100%_70%)]",
    shadow: "shadow-[0_0_12px_hsl(43_100%_55%/0.4),inset_0_1px_1px_hsl(43_100%_80%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(43_100%_55%/0.6),inset_0_1px_1px_hsl(43_100%_80%/0.25)]",
  },
  sleep: {
    bg: "bg-[hsl(230_60%_50%/0.12)]",
    border: "border-[hsl(230_60%_50%/0.5)]",
    text: "text-[hsl(230_60%_75%)]",
    shadow: "shadow-[0_0_12px_hsl(230_60%_50%/0.35),inset_0_1px_1px_hsl(230_60%_80%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(230_60%_50%/0.5),inset_0_1px_1px_hsl(230_60%_80%/0.25)]",
  },
  hydration: {
    bg: "bg-[hsl(200_90%_50%/0.12)]",
    border: "border-[hsl(200_90%_50%/0.5)]",
    text: "text-[hsl(200_90%_70%)]",
    shadow: "shadow-[0_0_12px_hsl(200_90%_50%/0.4),inset_0_1px_1px_hsl(200_90%_80%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(200_90%_50%/0.6),inset_0_1px_1px_hsl(200_90%_80%/0.25)]",
  },
  health: {
    bg: "bg-[hsl(160_80%_45%/0.12)]",
    border: "border-[hsl(160_80%_45%/0.5)]",
    text: "text-[hsl(160_80%_65%)]",
    shadow: "shadow-[0_0_12px_hsl(160_80%_45%/0.4),inset_0_1px_1px_hsl(160_80%_70%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(160_80%_45%/0.6),inset_0_1px_1px_hsl(160_80%_70%/0.25)]",
  },
  fun: {
    bg: "bg-[hsl(330_81%_60%/0.12)]",
    border: "border-[hsl(330_81%_60%/0.5)]",
    text: "text-[hsl(330_81%_75%)]",
    shadow: "shadow-[0_0_12px_hsl(330_81%_60%/0.4),inset_0_1px_1px_hsl(330_81%_80%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(330_81%_60%/0.6),inset_0_1px_1px_hsl(330_81%_80%/0.25)]",
  },
  social: {
    bg: "bg-[hsl(280_70%_55%/0.12)]",
    border: "border-[hsl(280_70%_55%/0.5)]",
    text: "text-[hsl(280_70%_75%)]",
    shadow: "shadow-[0_0_12px_hsl(280_70%_55%/0.4),inset_0_1px_1px_hsl(280_70%_80%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(280_70%_55%/0.6),inset_0_1px_1px_hsl(280_70%_80%/0.25)]",
  },
  gaming: {
    bg: "bg-[hsl(150_100%_40%/0.12)]",
    border: "border-[hsl(150_100%_40%/0.5)]",
    text: "text-[hsl(150_100%_60%)]",
    shadow: "shadow-[0_0_12px_hsl(150_100%_40%/0.4),inset_0_1px_1px_hsl(150_100%_65%/0.15)]",
    glow: "hover:shadow-[0_0_20px_hsl(150_100%_40%/0.6),inset_0_1px_1px_hsl(150_100%_65%/0.25)]",
  },
  other: {
    bg: "bg-[hsl(215_15%_40%/0.12)]",
    border: "border-[hsl(215_15%_40%/0.4)]",
    text: "text-[hsl(215_15%_65%)]",
    shadow: "shadow-[0_0_8px_hsl(215_15%_40%/0.25),inset_0_1px_1px_hsl(215_15%_60%/0.1)]",
    glow: "hover:shadow-[0_0_14px_hsl(215_15%_40%/0.4),inset_0_1px_1px_hsl(215_15%_60%/0.2)]",
  },
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export default function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const style = categoryStyles[category] || categoryStyles.other;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        "backdrop-blur-md transition-all duration-300 select-none",
        style.bg,
        style.border,
        style.text,
        style.shadow,
        style.glow,
        className
      )}
    >
      {category}
    </span>
  );
}
