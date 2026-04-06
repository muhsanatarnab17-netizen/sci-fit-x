/**
 * UI Component Variants
 * Extracted from components to satisfy react-refresh/only-export-components ESLint rule
 * Prevents re-renders due to module inference issues
 */

import { cva, type VariantProps } from "class-variance-authority";

// Badge variants with neon drop-shadow support for Dark Biotech aesthetics
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_12px_hsl(187_100%_50%/0.5)]",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_0_12px_hsl(260_80%_55%/0.5)]",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-primary/30 hover:border-primary/60",
        neon: "border-transparent bg-neon-green text-black hover:bg-neon-green/90 shadow-[0_0_15px_hsl(160_80%_45%/0.6)]",
        neon_orange: "border-transparent bg-neon-orange text-black hover:bg-neon-orange/90 shadow-[0_0_15px_hsl(25_100%_50%/0.6)]",
        neon_purple: "border-transparent bg-neon-purple text-white hover:bg-neon-purple/90 shadow-[0_0_15px_hsl(260_80%_55%/0.6)]",
        neon_pink: "border-transparent bg-neon-pink text-white hover:bg-neon-pink/90 shadow-[0_0_15px_hsl(330_81%_60%/0.6)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

// Button variants with size and styling for glassmorphism + neon
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_hsl(187_100%_50%/0.4)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass border border-primary/20 hover:border-primary/50 text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

// Form field styling for consistency across input, select, textarea
export const formFieldVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-input/50 focus-visible:border-primary/50",
        neon: "border-neon-green/30 focus-visible:border-neon-green shadow-[0_0_10px_hsl(160_80%_45%/0.2)] focus-visible:shadow-[0_0_15px_hsl(160_80%_45%/0.4)]",
        glass: "glass border-primary/20 focus-visible:border-primary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type FormFieldVariants = VariantProps<typeof formFieldVariants>;

// Toggle variants - inline-flex with state-based styling
export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;

// Navigation menu trigger style - group-based hover and state styling
export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

export type NavigationMenuTriggerStyleVariants = VariantProps<typeof navigationMenuTriggerStyle>;

// Reusable glow and shadow effects
export const glassEffects = {
  cyan: "shadow-[0_4px_25px_hsl(187_100%_50%/0.25)]",
  green: "shadow-[0_4px_25px_hsl(160_80%_45%/0.25)]",
  orange: "shadow-[0_4px_25px_hsl(25_100%_50%/0.25)]",
  purple: "shadow-[0_4px_25px_hsl(260_80%_55%/0.25)]",
  pink: "shadow-[0_4px_25px_hsl(330_81%_60%/0.25)]",
};
