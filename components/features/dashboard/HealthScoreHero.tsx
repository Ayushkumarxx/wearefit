"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sliders, ReceiptText, Activity } from "lucide-react";
import { CircularHealthGauge } from "@/components/ui/CircularHealthGauge";
import { M3Button } from "@/components/ui/M3Button";
import { useHealthStore } from "@/context/useHealthStore";
import { calculateConsecutiveStreak } from "@/lib/streak-calculator";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export function HealthScoreHero() {
  const { selectedDate, getReceiptForDate, setIsEntryModalOpen, setIsReceiptModalOpen, dailyLogs } = useHealthStore();
  const [heroView, setHeroView] = useState<"dial" | "trend">("dial");

  const receipt = getReceiptForDate(selectedDate);
  const currentStreak = calculateConsecutiveStreak(dailyLogs, selectedDate);

  // Generate 7-day Trend history (shows 0 for unlogged days)
  const last7DaysHP = Array.from({ length: 7 }).map((_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayLabel = format(subDays(new Date(), 6 - i), "EEE");
    const hasData = Boolean(dailyLogs[d]);
    const dayReceipt = getReceiptForDate(d);
    const score = hasData ? dayReceipt.totalScore : 0;
    return {
      date: d,
      dayLabel,
      score,
      hasData,
      isToday: i === 6,
    };
  });

  const loggedDays = last7DaysHP.filter((d) => d.hasData);
  const avgWeeklyHP =
    loggedDays.length > 0
      ? Math.round(loggedDays.reduce((acc, d) => acc + d.score, 0) / loggedDays.length)
      : (dailyLogs[selectedDate] ? receipt.totalScore : 0);

  const getStatusBadge = (score: number, hasAnyData: boolean) => {
    if (!hasAnyData || score === 0) return { text: "No Data", color: "bg-neutral-100 text-neutral-500 border border-neutral-200" };
    if (score >= 85) return { text: "Optimal", color: "bg-[#D8EDDE] text-[#0A3D22]" };
    if (score >= 70) return { text: "Balanced", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    if (score >= 55) return { text: "Recovery", color: "bg-amber-50 text-amber-700 border border-amber-200" };
    return { text: "Deficit", color: "bg-rose-50 text-rose-700 border border-rose-200" };
  };

  const statusBadge = getStatusBadge(avgWeeklyHP, loggedDays.length > 0);

  return (
    <div className="flex flex-col items-center px-5 pt-2 pb-5 space-y-3 select-none">
      {/* Segmented View Switcher Pill */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-neutral-200/80 shadow-2xs">
        <button
          onClick={() => setHeroView("dial")}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
            heroView === "dial" ? "bg-white text-[#191C1A] shadow-xs" : "text-neutral-500 hover:text-neutral-800"
          )}
        >
          Today's Dial
        </button>
        <button
          onClick={() => setHeroView("trend")}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
            heroView === "trend" ? "bg-[#1B6C43] text-white shadow-xs" : "text-neutral-500 hover:text-neutral-800"
          )}
        >
          <Activity className="w-3 h-3" />
          <span>7-Day Trend</span>
        </button>
      </div>

      {/* Hero Content Area */}
      <div className="w-full min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {heroView === "dial" ? (
            /* View 1: Clean 100 HP Circular Gauge */
            <motion.div
              key="dial"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center pt-1"
            >
              <CircularHealthGauge
                score={receipt.totalScore}
                streakDays={currentStreak}
                onTap={() => setIsReceiptModalOpen(true, selectedDate)}
              />
            </motion.div>
          ) : (
            /* View 2: Weekly Report Trend */
            <motion.div
              key="trend"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B6C43]">
                    7-Day Trend Report
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-display font-black text-2xl text-[#191C1A]">
                      {avgWeeklyHP} HP
                    </span>
                    <span className="text-xs font-bold text-neutral-500">
                      {loggedDays.length > 0 ? `${loggedDays.length}d Avg` : "No Logs"}
                    </span>
                  </div>
                </div>

                {/* Single Word Color Status Badge */}
                <span className={cn("text-xs font-black px-3 py-1 rounded-full", statusBadge.color)}>
                  {statusBadge.text}
                </span>
              </div>

              {/* 7-Day HP Score Bars */}
              <div className="grid grid-cols-7 gap-2 pt-1">
                {last7DaysHP.map((day, idx) => (
                  <div key={day.date} className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold",
                        day.hasData ? "text-neutral-700" : "text-neutral-300"
                      )}
                    >
                      {day.score}
                    </span>
                    <div className="w-full h-20 bg-neutral-100 rounded-xl p-1 flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: day.hasData ? `${Math.max(15, day.score)}%` : "4%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 25, delay: idx * 0.04 }}
                        className={cn(
                          "w-full rounded-lg transition-colors",
                          !day.hasData
                            ? "bg-neutral-200"
                            : day.isToday
                            ? "bg-gradient-to-t from-[#0A3D22] to-[#1B6C43]"
                            : day.score >= 80
                            ? "bg-[#1B6C43]/80"
                            : day.score >= 60
                            ? "bg-[#F59E0B]"
                            : "bg-[#BA1A1A]"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold",
                        day.isToday ? "text-[#1B6C43] font-black" : "text-neutral-500"
                      )}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Action Buttons */}
      <div className="w-full flex items-center gap-3 pt-1">
        <M3Button
          variant="filled"
          size="md"
          onClick={() => setIsEntryModalOpen(true, "manual")}
          className="flex-1 shadow-sm flex items-center justify-center gap-2"
          icon={<Sliders className="w-4 h-4" />}
        >
          <span>Log Day</span>
        </M3Button>

        <M3Button
          variant="tonal"
          size="md"
          onClick={() => setIsEntryModalOpen(true, "voice")}
          className="flex-1 shadow-xs flex items-center justify-center gap-2 bg-[#C2E8FC] text-[#001D2B] hover:bg-[#B0DEF7]"
          icon={<Mic className="w-4 h-4 text-[#00658F]" />}
        >
          <span>AI Voice</span>
        </M3Button>

        <button
          onClick={() => setIsReceiptModalOpen(true, selectedDate)}
          aria-label="View daily receipt"
          className="h-12 w-12 rounded-full bg-white text-[#191C1A] border border-black/5 shadow-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <ReceiptText className="w-5 h-5 text-[#1B6C43]" />
        </button>
      </div>
    </div>
  );
}
