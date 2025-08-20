import React from "react";
import { Button, type ButtonProps } from "@/renderer/components/ui/button";
import { Loader2 } from "lucide-react";

type LoadingState = "idle" | "loading" | "finished";

type LoadingButtonProps = ButtonProps & {
  icon?: React.ComponentRef<any>;
  loadingState: LoadingState;
};

const LoadingButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  LoadingButtonProps
>(({ className, loadingState = "idle", children, icon, ...props }, ref) => {
  return (
    <Button disabled={loadingState === "loading"} ref={ref} {...props}>
      <>
        {loadingState === "loading" ? (
          <Loader2 className="animate-spin" />
        ) : (
          icon
        )}
        {children}
      </>
    </Button>
  );
});

LoadingButton.displayName = "LoadingButton";

export { LoadingButton, LoadingState };
