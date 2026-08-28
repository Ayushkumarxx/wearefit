"use client";

import React, { useState, useEffect } from "react";
import { Clock, Shield } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { selectedDate, dailyLogs, getReceiptForDate, getLogForDate, setIsShieldModalOpen, lastShieldDeployDate } = useHealthStore();

  const formattedDate = (() => {
    try {
      return format(new Date(selectedDate), "EEE, MMM d");
    } catch {
      return "Today";
    }
  })();

  // HP Shield Stats (Counts quality days >= 75 HP since last shield deployment)
  const allLogs = Object.values(dailyLogs);
  const eligibleLogs = lastShieldDeployDate
    ? allLogs.filter((l) => l.date > lastShieldDeployDate)
    : allLogs;
  const qualityDaysCount = eligibleLogs.filter((l) => getReceiptForDate(l.date).totalScore >= 75).length;
  const isUnlocked = qualityDaysCount >= 6;
  const log = getLogForDate(selectedDate);
  const isUsedToday = Boolean(log.hpShieldUsed);

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

      {/* Top Right: HP Shield Button */}
      <button
        onClick={() => setIsShieldModalOpen(true)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
          isUnlocked
            ? "bg-[#D8EDDE] border-[#1B6C43]/40 text-[#0A3D22] hover:bg-[#C2E3CC]"
            : "bg-white border-neutral-200/80 text-neutral-600 hover:bg-neutral-50"
        )}
      >
        <Shield
          className={cn(
            "w-3.5 h-3.5",
            isUnlocked ? "fill-[#1B6C43] text-[#1B6C43]" : "text-amber-700"
          )}
        />
        <span>{isUnlocked ? "1 Shield" : "0 Shields"}</span>
      </button>
    </header>
  );
}
