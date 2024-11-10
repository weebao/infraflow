import React from "react";
import { cn } from "@/lib/utils";

export const BaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-sm w-fit border border-primary bg-card p-5 ring-sky-500 text-card-foreground transition-all duration-300",
      className,
      selected ? "ring-2" : "",
      "hover:ring-2",
    )}
    {...props}
  />
));
BaseNode.displayName = "BaseNode";
