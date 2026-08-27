"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Sun, Moon, Salad } from "lucide-react";
import { useHealthStore, getTodayString } from "@/context/useHealthStore";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function OneBestThingTab() {
  const { focusCompletedByDate, toggleFocusCompleted, getLogForDate } = useHealthStore();
  const todayStr = getTodayString();
  const isCompletedToday = !!focusCompletedByDate[todayStr];
  const log = getLogForDate(todayStr);

  // Dynamic #1 Best Thing tailored to current condition
  const getTodayBestThing = () => {
    if (log.sleepHours < 6.5) {
      return {
        title: "Prioritize 8.5h Deep Sleep Tonight",
        subtitle: "Shut screens 45 mins before bedtime to clear adenosine debt.",
        icon: <Moon className="w-6 h-6 text-purple-600" />,
      };
    }
    if (log.steps < 4000) {
      return {
        title: "20-Min Morning Sunshine & Walk",
        subtitle: "Morning photons set circadian rhythm & trigger dopamine alignment.",
        icon: <Sun className="w-6 h-6 text-amber-500" />,
      };
    }
    return {
      title: "100% Single-Ingredient Whole Foods",
      subtitle: "Zero refined seed oils or added sugar for today's meals.",
      icon: <Salad className="w-6 h-6 text-emerald-600" />,
    };
  };

  const bestThing = getTodayBestThing();

  const handleToggle = () => {
    toggleFocusCompleted(todayStr);
    if (!isCompletedToday) {
      toast.success("Completed for Today! 🌿", {
        description: "Great execution. Weekly habit momentum updated.",
      });
    }
  };

  // Generate 7-day momentum bar chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayLabel = format(subDays(new Date(), 6 - i), "EEE");
    const done = !!focusCompletedByDate[d];
    return { date: d, dayLabel, done };
  });

  const totalCompletedInWeek = last7Days.filter((d) => d.done).length;
  const completionPercentage = Math.round((totalCompletedInWeek / 7) * 100);

  return (
    <div className="p-5 space-y-4 select-none">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-black text-2xl text-[#191C1A]">
          One Best Thing Today
        </h1>
        <p className="text-xs text-neutral-500">
          The single highest-leverage biological habit to execute today.
        </p>
      </div>

      {/* Hero Today's #1 Best Thing Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={cn(
          "relative bg-white rounded-3xl p-6 border shadow-sm space-y-4 transition-all",
          isCompletedToday
            ? "border-[#1B6C43]/40 bg-gradient-to-b from-[#F2FAF4] to-white"
            : "border-neutral-200/80"
        )}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200">
            {bestThing.icon}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#191C1A] leading-snug">
              {bestThing.title}
            </h2>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/60">
          {bestThing.subtitle}
        </p>

        {/* Action Toggle Button */}
        <button
          onClick={handleToggle}
          className={cn(
            "w-full h-12 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer",
            isCompletedToday
              ? "bg-[#1B6C43] text-white hover:bg-[#155735]"
              : "bg-[#191C1A] text-white hover:bg-neutral-800"
          )}
        >
          {isCompletedToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Completed for Today!</span>
            </>
          ) : (
            <>
              <Circle className="w-4 h-4" />
              <span>I Completed This Today</span>
            </>
          )}
        </button>
      </motion.div>

      {/* 7-Day Habit Momentum Bar Chart (Aligned Flex Header) */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-[#191C1A]">Weekly Habit Momentum</h3>
          </div>

          <span className="font-display font-black text-xs text-[#1B6C43] bg-[#D8EDDE] px-2.5 py-1 rounded-full shrink-0">
            {completionPercentage}% Consistent
          </span>
        </div>

        {/* 7-Day Visual Bars */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {last7Days.map((item, idx) => (
            <div key={item.date} className="flex flex-col items-center gap-1.5">
              <div className="w-full h-24 bg-neutral-100 rounded-2xl p-1 flex items-end justify-center relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: item.done ? "100%" : "20%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, delay: idx * 0.04 }}
                  className={cn(
                    "w-full rounded-xl transition-colors",
                    item.done
                      ? "bg-gradient-to-t from-[#0A3D22] to-[#1B6C43]"
                      : "bg-neutral-200"
                  )}
                />
                {item.done && (
                  <CheckCircle2 className="w-3 h-3 text-white absolute bottom-1.5" />
                )}
              </div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase">
                {item.dayLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
