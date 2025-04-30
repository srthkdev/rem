import React from "react";
import { cn } from "@/lib/utils";

interface StandardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function StandardLayout({ children, className }: StandardLayoutProps) {
  return (
    <div className={cn(
      "standard-layout",
      "container max-w-5xl py-8 px-4 md:px-6 mx-auto flex flex-col",
      className
    )}>
      {children}
    </div>
  );
} 