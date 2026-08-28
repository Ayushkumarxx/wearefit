"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { format } from "date-fns";

export function AppHeader() {
  const { selectedDate } = useHealthStore();
  const [hoursToMidnight, setHoursToMidnight] = useState<number>(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
      setHoursToMidnight(diff);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = (() => {
    try {
      return format(new Date(selectedDate), "EEE, MMM d");
    } catch {
      return "Today";
    }
  })();

  return (
    <header className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0 bg-[#F7F9F6]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-[#1B6C43] text-white flex items-center justify-center font-display font-black text-lg shadow-xs">
          w
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-xl tracking-tight text-[#191C1A]">
              wearefit
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <p className="text-[11px] font-semibold text-neutral-500 -mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Top Right: HP Reset in 5h badge */}
      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-neutral-200/80 shadow-2xs text-[11px] font-bold text-neutral-700">
        <Clock className="w-3.5 h-3.5 text-[#1B6C43]" />
        <span>HP Reset: {hoursToMidnight}h</span>
      </div>
    </header>
  );
}
