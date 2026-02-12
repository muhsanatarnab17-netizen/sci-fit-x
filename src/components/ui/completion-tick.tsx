import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CompletionTickProps {
  completed: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  category?: "workout" | "meal" | "sleep" | "health" | "posture" | "hydration" | "wellness";
}

const categoryColors: Record<string, string> = {
  workout: "border-primary bg-primary",
  meal: "border-secondary bg-secondary",
  sleep: "border-neon-purple bg-neon-purple",
  health: "border-accent bg-accent",
  posture: "border-neon-orange bg-neon-orange",
  hydration: "border-primary bg-primary",
  wellness: "border-neon-pink bg-neon-pink",
};

export default function CompletionTick({
  completed,
  onToggle,
  size = "md",
  disabled = false,
  category = "workout",
}: CompletionTickProps) {
  const [animating, setAnimating] = useState(false);

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const colorClass = categoryColors[category] || categoryColors.workout;

  const handleClick = () => {
    if (disabled) return;
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer",
        sizeClasses[size],
        completed
          ? cn(colorClass, "scale-100")
          : "border-muted-foreground/40 bg-transparent hover:border-primary/60",
        animating && completed && "animate-[tick-bounce_0.6s_ease-out]",
        animating && !completed && "animate-[tick-shrink_0.3s_ease-out]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label={completed ? "Mark incomplete" : "Mark complete"}
    >
      {completed && (
        <Check
          className={cn(
            iconSizes[size],
            "text-background",
            animating && "animate-[tick-check_0.4s_ease-out]"
          )}
          strokeWidth={3}
        />
      )}

      {/* Ripple effect */}
      {animating && completed && (
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-[tick-ripple_0.6s_ease-out_forwards]",
            colorClass,
            "opacity-40"
          )}
        />
      )}
    </button>
  );
}
