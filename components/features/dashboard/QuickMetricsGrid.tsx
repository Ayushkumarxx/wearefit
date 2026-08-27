"use client";

import React from "react";
import { Moon, Flame, Footprints, Salad, Droplet } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { cn } from "@/lib/utils";

export function QuickMetricsGrid() {
  const { selectedDate, getLogForDate, userProfile, setIsEntryModalOpen } = useHealthStore();
  const log = getLogForDate(selectedDate);

  const targetCalories = userProfile?.dailyCalorieTarget || 2000;
  const targetSleep = userProfile?.dailySleepTargetHours || 8;
  const targetSteps = userProfile?.dailyStepsTarget || 8000;

  const getFoodRatingText = (score: number) => {
    if (score >= 9) return "Nutrient Dense";
    if (score >= 7) return "Clean Balanced";
    if (score >= 5) return "Moderate Meal";
    if (score >= 3) return "Refined Meals";
    return "Heavy Surplus";
  };

  const metrics = [
    {
      id: "sleep",
      title: "Sleep Recovery",
      value: log.sleepHours,
      unit: "hrs",
      subtext: `Target ${targetSleep}h`,
      icon: <Moon className="w-4 h-4 text-blue-600" />,
      bg: "bg-blue-50",
      borderHover: "hover:border-blue-300",
    },
    {
      id: "calories",
      title: "Energy In",
      value: log.calories,
      unit: "kcal",
      subtext: `Goal ${targetCalories}`,
      icon: <Flame className="w-4 h-4 text-amber-600" />,
      bg: "bg-amber-50",
      borderHover: "hover:border-amber-300",
    },
    {
      id: "steps",
      title: "Daily Movement",
      value: log.steps.toLocaleString(),
      unit: "steps",
      subtext: `Goal ${targetSteps / 1000}k`,
      icon: <Footprints className="w-4 h-4 text-emerald-600" />,
      bg: "bg-emerald-50",
      borderHover: "hover:border-emerald-300",
    },
    {
      id: "food",
      title: "Food Quality",
      value: `${log.healthyEatingScore}/10`,
      unit: "",
      subtext: getFoodRatingText(log.healthyEatingScore),
      icon: <Salad className="w-4 h-4 text-green-700" />,
      bg: "bg-green-50",
      borderHover: "hover:border-green-300",
    },
    {
      id: "water",
      title: "Hydration",
      value: log.waterLiters,
      unit: "L",
      subtext: "Target 2.5L",
      icon: <Droplet className="w-4 h-4 text-blue-600" />,
      bg: "bg-blue-50",
      borderHover: "hover:border-blue-300",
    },
  ];

  return (
    <div className="px-5 space-y-2.5 select-none">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
          Core Health Metrics
        </span>
        <button
          onClick={() => setIsEntryModalOpen(true, "manual")}
          className="text-xs font-bold text-[#1B6C43] hover:underline cursor-pointer"
        >
          Adjust
        </button>
      </div>

      {/* Balanced, Clean Horizontal Snap Carousel */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            onClick={() => setIsEntryModalOpen(true, "manual")}
            className={cn(
              "w-[145px] shrink-0 bg-white p-3.5 rounded-3xl border border-neutral-200/80 shadow-2xs cursor-pointer transition-all snap-start flex flex-col justify-between space-y-2",
              metric.borderHover
            )}
          >
            <div className="flex items-center justify-between">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", metric.bg)}>
                {metric.icon}
              </div>
              <span className="text-[10px] font-bold text-neutral-400">
                {metric.id === "food" ? "Score" : metric.subtext}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-2xl text-[#191C1A]">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-xs text-neutral-500 font-semibold">{metric.unit}</span>
                )}
              </div>
              <p className="text-[11px] font-bold text-neutral-600 mt-0.5 truncate">
                {metric.id === "food" ? metric.subtext : metric.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
