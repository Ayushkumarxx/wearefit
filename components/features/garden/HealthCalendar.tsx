"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isAfter, startOfToday, parseISO, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CalendarOff, Lock, TrendingUp, TrendingDown, Edit3, Trees, Sparkles } from "lucide-react";
import { useHealthStore, getTodayString } from "@/context/useHealthStore";
import { DailyReceiptCard } from "@/components/features/dashboard/DailyReceiptCard";
import { TomorrowPrescriptionCard } from "@/components/features/dashboard/TomorrowPrescriptionCard";
import { generateGardenFromLogs } from "@/lib/garden-generator";
import { M3Button } from "@/components/ui/M3Button";
import { cn } from "@/lib/utils";

export function HealthCalendar() {
  const { dailyLogs, getReceiptForDate, setIsEntryModalOpen } = useHealthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // ISOLATED CALENDAR DATE SELECTION (Does NOT alter global Today's date!)
  const [calendarActiveDate, setCalendarActiveDate] = useState<string>(getTodayString());

  const today = startOfToday();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyLeadingSlots = Array.from({ length: startDayOfWeek });

  const selectedDateObj = parseISO(calendarActiveDate);
  const isFutureDate = isAfter(selectedDateObj, today);
  const currentSelectedLog = dailyLogs[calendarActiveDate];
  const hasLogForSelected = Boolean(
    currentSelectedLog &&
      (currentSelectedLog.sleepHours > 0 ||
        currentSelectedLog.calories > 0 ||
        currentSelectedLog.waterLiters > 0)
  );
  const activeDayReceipt = getReceiptForDate(calendarActiveDate);

  // Compute 7-day average for comparative insight (only for valid logged days)
  const validLogs = Object.values(dailyLogs).filter(
    (l) => l.sleepHours > 0 || l.calories > 0 || l.waterLiters > 0
  );
  const avgScore =
    validLogs.length > 0
      ? Math.round(
          validLogs.reduce((acc, l) => acc + (getReceiptForDate(l.date).totalScore || 75), 0) /
            validLogs.length
        )
      : 80;

  const scoreDiff = activeDayReceipt.totalScore - avgScore;
  const scoreDiffPct = Math.round((Math.abs(scoreDiff) / (avgScore || 1)) * 100);

  const getDayScoreData = (dateStr: string) => {
    const log = dailyLogs[dateStr];
    if (!log) return null;
    const hasCore = log.sleepHours > 0 || log.calories > 0 || log.waterLiters > 0;
    if (!hasCore) return null;
    return getReceiptForDate(dateStr);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Calendar Grid Card */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-base text-[#191C1A]">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl">
            <button
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty Leading Days */}
          {emptyLeadingSlots.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Actual Month Days */}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isDayFuture = isAfter(day, today);
            const isSelected = dateStr === calendarActiveDate;
            const scoreData = getDayScoreData(dateStr);
            const hasData = !!scoreData;

            return (
              <button
                key={dateStr}
                onClick={() => setCalendarActiveDate(dateStr)}
                disabled={isDayFuture}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all relative select-none cursor-pointer",
                  isDayFuture && "opacity-30 cursor-not-allowed",
                  isSelected && "ring-2 ring-[#1B6C43] ring-offset-2 scale-105 z-10",
                  !isSelected && !isDayFuture && "hover:bg-neutral-100",
                  hasData
                    ? scoreData.totalScore >= 80
                      ? "bg-[#D8EDDE] text-[#0A3D22]"
                      : scoreData.totalScore >= 65
                      ? "bg-[#FFF4D9] text-[#78350F]"
                      : "bg-[#FFE8E6] text-[#90000A]"
                    : "bg-neutral-50 text-neutral-600"
                )}
              >
                <span className="text-[11px] font-bold">{format(day, "d")}</span>

                {hasData ? (
                  <span className="font-mono text-[9px] font-black leading-none">
                    {scoreData.totalScore}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mb-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] font-bold text-neutral-500 px-1">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B6C43]" />
            <span>&ge;80 HP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>65-79 HP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A]" />
            <span>&lt;65 HP</span>
          </div>
        </div>
      </div>

      {/* Selected Calendar Date Inspection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {format(selectedDateObj, "EEEE, MMMM d, yyyy")}
          </span>
          {hasLogForSelected && (
            <button
              onClick={() => setIsEntryModalOpen(true, "manual", calendarActiveDate)}
              className="text-xs font-bold text-[#1B6C43] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Day Log</span>
            </button>
          )}
        </div>

        {/* Case 1: Future Date */}
        {isFutureDate ? (
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#191C1A]">Future Date</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              No data logged yet. You will be able to log your health metrics when this day arrives.
            </p>
          </div>
        ) : !hasLogForSelected ? (
          /* Case 2: Past Date with No Log Data */
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <CalendarOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#191C1A]">No Health Log Recorded</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                There is no health data recorded for this date.
              </p>
            </div>
            <M3Button
              size="md"
              variant="tonal"
              onClick={() => setIsEntryModalOpen(true, "manual", calendarActiveDate)}
              className="mx-auto"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Data For This Day
            </M3Button>
          </div>
        ) : (
          /* Case 3: Logged Date with Polished Score Circle + Comparative Analysis */
          <div className="space-y-3">
            {/* Polished Comparative Score Card */}
            <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between gap-4">
              {/* Radial Gauge */}
              <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" stroke="#E5EAE5" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke={activeDayReceipt.totalScore >= 80 ? "#1B6C43" : activeDayReceipt.totalScore >= 60 ? "#F59E0B" : "#BA1A1A"}
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (activeDayReceipt.totalScore / 100) * 201}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display font-black text-lg text-[#191C1A] leading-none">
                    {activeDayReceipt.totalScore}
                  </span>
                  <span className="text-[9px] font-bold text-[#1B6C43] mt-0.5">HP</span>
                </div>
              </div>

              {/* Comparative Performance Insight & Mood */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {scoreDiff >= 0 ? (
                    <div className="inline-flex items-center gap-1 text-[#0A3D22] bg-[#D8EDDE] px-2.5 py-0.5 rounded-full font-bold text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-[#1B6C43]" />
                      <span>+{scoreDiffPct}% Above Avg</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[#90000A] bg-[#FFE8E6] px-2.5 py-0.5 rounded-full font-bold text-xs">
                      <TrendingDown className="w-3.5 h-3.5 text-[#BA1A1A]" />
                      <span>-{scoreDiffPct}% Below Avg</span>
                    </div>
                  )}

                  {/* Day Mood Badge */}
                  {dailyLogs[calendarActiveDate]?.mood && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-700">
                      {dailyLogs[calendarActiveDate]?.mood === "motivated"
                        ? "🔥 Motivated"
                        : dailyLogs[calendarActiveDate]?.mood === "good"
                        ? "😊 Good Vitality"
                        : dailyLogs[calendarActiveDate]?.mood === "fatigued"
                        ? "😫 Fatigued"
                        : dailyLogs[calendarActiveDate]?.mood === "unmotivated"
                        ? "😔 Low Drive"
                        : "😐 Balanced"}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 leading-snug">
                  {scoreDiff >= 0
                    ? `Optimal biological recovery (+${scoreDiff} HP above your ${avgScore} HP baseline).`
                    : `Accumulated ${Math.abs(scoreDiff)} HP fatigue debt compared to your ${avgScore} HP baseline.`}
                </p>
              </div>
            </div>

            {/* Garden Growth on This Day: EMOJIS ONLY */}
            {(() => {
              const dayLog = dailyLogs[calendarActiveDate];
              if (!dayLog) return null;
              const gardenItems = generateGardenFromLogs({ [calendarActiveDate]: dayLog });
              if (gardenItems.length === 0) return null;

              const blooms = gardenItems.filter((i) => i.type === "healthy");
              const weeds = gardenItems.filter((i) => i.type === "unhealthy");

              return (
                <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#191C1A] flex items-center gap-1.5">
                      <Trees className="w-3.5 h-3.5 text-[#1B6C43]" />
                      Garden Growth
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold">Sprouted on this date</span>
                  </div>

                  {/* 1. Blossoms Emojis */}
                  {blooms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {blooms.map((item) => (
                        <div
                          key={item.id}
                          className="w-10 h-10 rounded-2xl bg-[#D8EDDE]/60 border border-[#1B6C43]/20 flex items-center justify-center text-xl shadow-2xs"
                          title={item.name}
                        >
                          {item.emoji}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. Weeds Emojis */}
                  {weeds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100">
                      {weeds.map((item) => (
                        <div
                          key={item.id}
                          className="w-10 h-10 rounded-2xl bg-[#FFE8E6]/70 border border-[#BA1A1A]/20 flex items-center justify-center text-xl shadow-2xs"
                          title={item.name}
                        >
                          {item.emoji}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Statement Receipt */}
            <DailyReceiptCard receipt={activeDayReceipt} />

            {/* Tomorrow's Prescription Coupon */}
            <TomorrowPrescriptionCard receipt={activeDayReceipt} />
          </div>
        )}
      </div>
    </div>
  );
}
