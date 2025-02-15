import { Slot, Slottable } from "@radix-ui/react-slot";
import { Icon, Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../lib/utils";
import { buttonVariants } from "./ui/button";
import { VariantProps } from "class-variance-authority";
import { LoadingState } from "./loading-button";

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loadingState?: LoadingState;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loadingState,
      children,
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const loading = loadingState === "loading";
    return (
      <Comp
        ref={ref}
        disabled={loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        <Slottable>{children}</Slottable>
      </Comp>
    );
  }
);

export { LoadingButton };
