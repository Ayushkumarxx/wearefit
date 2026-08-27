"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#F7F9F6] sm:bg-[#EAEFEA] flex justify-center items-start sm:items-center font-sans antialiased text-[#191C1A] sm:p-4">
      {/* Container: Flush with top on mobile (no top gap), centered and rounded on desktop */}
      <div
        className={cn(
          "w-full max-w-[440px] min-h-[100dvh] sm:min-h-[820px] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[36px] bg-[#F7F9F6] sm:shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:border sm:border-neutral-200/80 flex flex-col relative overflow-hidden",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
