"use client";

import React, { useState } from "react";
import { Trees, Calendar, Sparkles } from "lucide-react";
import { LivingGarden } from "@/components/features/garden/LivingGarden";
import { HealthCalendar } from "@/components/features/garden/HealthCalendar";
import { cn } from "@/lib/utils";

export function GardenCalendarTab() {
  const [subView, setSubView] = useState<"garden" | "calendar">("garden");

  return (
    <div className="p-5 space-y-4">
      {/* Subview Pill Switcher */}
      <div className="flex bg-neutral-200/70 p-1 rounded-2xl">
        <button
          onClick={() => setSubView("garden")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
            subView === "garden"
              ? "bg-white text-[#191C1A] shadow-xs"
              : "text-neutral-600 hover:text-neutral-900"
          )}
        >
          <Trees className="w-3.5 h-3.5 text-[#1B6C43]" />
          <span>Living Garden</span>
        </button>

        <button
          onClick={() => setSubView("calendar")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
            subView === "calendar"
              ? "bg-white text-[#191C1A] shadow-xs"
              : "text-neutral-600 hover:text-neutral-900"
          )}
        >
          <Calendar className="w-3.5 h-3.5 text-[#1B6C43]" />
          <span>Health Calendar</span>
        </button>
      </div>

      {/* Render Active Subview */}
      {subView === "garden" ? <LivingGarden /> : <HealthCalendar />}
    </div>
  );
}
