import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg",
        outline:
          "border-2 border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        // Sqordia brand variants — solid orange, no gradients
        brand:
          "bg-momentum-orange text-white shadow-md shadow-momentum-orange/20 hover:bg-[#E56000] hover:shadow-lg hover:shadow-momentum-orange/25 hover:-translate-y-0.5 active:translate-y-0",
        "brand-outline":
          "border-2 border-momentum-orange text-momentum-orange bg-transparent hover:bg-momentum-orange hover:text-white",
        "brand-ghost":
          "text-momentum-orange hover:bg-momentum-orange/10",
        "brand-soft":
          "bg-momentum-orange/10 text-momentum-orange hover:bg-momentum-orange/20",
        // Subtle variant for secondary actions
        subtle:
          "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        // Success variant
        success:
          "bg-green-600 text-white shadow-md shadow-green-600/25 hover:bg-green-700 hover:shadow-lg",
      },
      size: {
        // Mobile-first: 44px touch target, 40px on desktop
        default: "min-h-[44px] sm:min-h-0 h-11 sm:h-10 px-5 py-2",
        sm: "min-h-[44px] sm:min-h-0 h-11 sm:h-9 rounded-lg px-4 text-xs",
        lg: "min-h-[44px] sm:min-h-0 h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        // Icon buttons with touch-friendly sizing
        icon: "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-11 w-11 sm:h-10 sm:w-10 rounded-lg",
        "icon-sm": "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-11 w-11 sm:h-8 sm:w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
