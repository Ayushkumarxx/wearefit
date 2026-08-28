"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Sparkles, Footprints, Droplet, Salad, Dumbbell, Utensils, Moon } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { format, subDays, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TodayCompensationTasks() {
  const { selectedDate, getLogForDate, saveDailyLog, togglePrescriptionCompleted, dailyLogs, userProfile } = useHealthStore();
  const log = getLogForDate(selectedDate);

  // Dynamic hours left till midnight / HP reset
  const [hoursLeft, setHoursLeft] = useState<number>(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
  });

  useEffect(() => {
    const updateHours = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setHoursLeft(Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60))));
    };
    updateHours();
    const interval = setInterval(updateHours, 60000);
    return () => clearInterval(interval);
  }, []);

  const baseTargetCalories = userProfile?.dailyCalorieTarget || 2000;
  const weightKg = userProfile?.weightKg || 70;
  const minProtein = Math.round(weightKg * 0.8);

  // Check Yesterday's Log for Biological Carryover Debt
  const prevDate = format(subDays(parseISO(selectedDate), 1), "yyyy-MM-dd");
  const yesterdayLog = dailyLogs[prevDate];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Footprints":
        return <Footprints className="w-4 h-4 text-emerald-600" />;
      case "Salad":
        return <Salad className="w-4 h-4 text-green-600" />;
      case "Droplet":
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case "Dumbbell":
        return <Dumbbell className="w-4 h-4 text-amber-600" />;
      case "Moon":
        return <Moon className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  // Dynamic deficit tasks based on today's logged state & yesterday's carryover debt
  const dynamicTasks: Array<{ id: string; title: string; recoveryHp: number; icon: React.ReactNode }> = [];

  // A. TODAY'S IMMEDIATE DEFICITS:
  // 1. Dehydration recovery
  if (log.waterLiters < 2.0) {
    dynamicTasks.push({
      id: "today_water_hydrate",
      title: `Drink 2.0L Electrolyte Water (${hoursLeft}h left)`,
      recoveryHp: 4,
      icon: <Droplet className="w-4 h-4 text-blue-600" />,
    });
  }

  // 2. Calorie under-fueling / deficit
  if (log.calories > 0 && (log.calories < 1200 || log.calories < baseTargetCalories - 450)) {
    dynamicTasks.push({
      id: "today_cal_refuel",
      title: `Caloric Refuel Meal / Clean Carbs (${hoursLeft}h left)`,
      recoveryHp: 5,
      icon: <Utensils className="w-4 h-4 text-emerald-600" />,
    });
  }

  // 3. Protein deficit
  if (log.calories > 0 && log.macros && (log.macros.protein || 0) < minProtein) {
    dynamicTasks.push({
      id: "today_protein_boost",
      title: `High-Protein Refuel Snack/Shake (${hoursLeft}h left)`,
      recoveryHp: 5,
      icon: <Utensils className="w-4 h-4 text-emerald-600" />,
    });
  }

  // 4. Healthy fat deficit
  if (log.calories > 0 && log.macros && (log.macros.fat || 0) < 30) {
    dynamicTasks.push({
      id: "today_healthy_fats",
      title: `Healthy Fats Boost (Nuts / Avocado) (${hoursLeft}h left)`,
      recoveryHp: 4,
      icon: <Salad className="w-4 h-4 text-green-600" />,
    });
  }

  // 5. Caloric surplus / heavy meal
  if (log.calories > baseTargetCalories + 350) {
    dynamicTasks.push({
      id: "today_walk_digest",
      title: `20-Min Digestion Walk (${hoursLeft}h left)`,
      recoveryHp: 4,
      icon: <Footprints className="w-4 h-4 text-emerald-600" />,
    });
  }

  // 6. Outside food digestion walk
  if (log.ateOutside && !dynamicTasks.some((t) => t.id === "today_walk_digest")) {
    dynamicTasks.push({
      id: "today_walk_digest",
      title: `20-Min Digestion Walk (${hoursLeft}h left)`,
      recoveryHp: 4,
      icon: <Footprints className="w-4 h-4 text-emerald-600" />,
    });
  }

  // 7. Ultra-processed antioxidant flush
  if (log.ultraProcessed) {
    dynamicTasks.push({
      id: "today_tea_flush",
      title: "Green Tea / Antioxidant Flush",
      recoveryHp: 5,
      icon: <Salad className="w-4 h-4 text-green-600" />,
    });
  }

  // 8. Low step count movement task
  if (log.steps < 3500) {
    dynamicTasks.push({
      id: "today_evening_walk",
      title: "Brisk Movement Walk (2,500 Steps)",
      recoveryHp: 4,
      icon: <Footprints className="w-4 h-4 text-emerald-600" />,
    });
  }

  // B. YESTERDAY'S CARRYOVER RECOVERY DEBT (If yesterday had deficits):
  if (yesterdayLog) {
    // Yesterday Sleep Debt -> Today Sleep Catchup
    if (yesterdayLog.sleepHours < 6.5 && !dynamicTasks.some((t) => t.id === "comp_yesterday_sleep")) {
      dynamicTasks.push({
        id: "comp_yesterday_sleep",
        title: "8.5h Deep Sleep Catchup Tonight (Yesterday's Deficit)",
        recoveryHp: 5,
        icon: <Moon className="w-4 h-4 text-purple-600" />,
      });
    }

    // Yesterday Junk / Outside Meal -> Today Clean Whole Foods
    if ((yesterdayLog.ultraProcessed || yesterdayLog.ateOutside || yesterdayLog.healthyEatingScore <= 5) && !dynamicTasks.some((t) => t.id === "comp_yesterday_clean_food")) {
      dynamicTasks.push({
        id: "comp_yesterday_clean_food",
        title: "100% Clean Whole Foods Reset (Yesterday's Deficit)",
        recoveryHp: 5,
        icon: <Salad className="w-4 h-4 text-green-600" />,
      });
    }

    // Yesterday Sedentary -> Today Step Goal
    if (yesterdayLog.steps < 3500 && !dynamicTasks.some((t) => t.id === "comp_yesterday_steps")) {
      dynamicTasks.push({
        id: "comp_yesterday_steps",
        title: "Hit 7,500 Steps Today (Yesterday's Movement Debt)",
        recoveryHp: 4,
        icon: <Footprints className="w-4 h-4 text-emerald-600" />,
      });
    }

    // Yesterday Under-fueling -> Today Refuel
    if (yesterdayLog.calories > 0 && yesterdayLog.calories < 1300 && !dynamicTasks.some((t) => t.id === "comp_yesterday_refuel")) {
      dynamicTasks.push({
        id: "comp_yesterday_refuel",
        title: "Metabolic Refuel Intake Today (Yesterday's Caloric Deficit)",
        recoveryHp: 5,
        icon: <Utensils className="w-4 h-4 text-emerald-600" />,
      });
    }

    // Yesterday Low Protein -> Today Protein Target
    if (yesterdayLog.calories > 0 && yesterdayLog.macros && (yesterdayLog.macros.protein || 0) < minProtein && !dynamicTasks.some((t) => t.id === "comp_yesterday_protein")) {
      dynamicTasks.push({
        id: "comp_yesterday_protein",
        title: "Target Adequate Protein Today (Yesterday's Protein Deficit)",
        recoveryHp: 5,
        icon: <Utensils className="w-4 h-4 text-emerald-600" />,
      });
    }

    // Yesterday Low Fat -> Today Healthy Fats
    if (yesterdayLog.calories > 0 && yesterdayLog.macros && (yesterdayLog.macros.fat || 0) < 30 && !dynamicTasks.some((t) => t.id === "comp_yesterday_fats")) {
      dynamicTasks.push({
        id: "comp_yesterday_fats",
        title: "Incorporate Healthy Fats Today (Yesterday's Fat Deficit)",
        recoveryHp: 4,
        icon: <Salad className="w-4 h-4 text-green-600" />,
      });
    }
  }

  // Custom tasks added from "Should I...?" Advisor
  const customTasks = log.activeCustomTasks || [];

  if (dynamicTasks.length === 0 && customTasks.length === 0) {
    return null;
  }

  const completedList = log.completedPrescriptions || [];

  const handleToggleDynamicTask = (taskId: string, recoveryHp: number) => {
    const isAlreadyCompleted = completedList.includes(taskId);
    togglePrescriptionCompleted(selectedDate, taskId);

    if (!isAlreadyCompleted) {
      toast.success(`Recovered +${recoveryHp} HP! 🌿`, {
        description: "Task completed! Health points restored on receipt.",
      });
    }
  };

  const handleToggleCustomTask = (taskId: string, recoveryHp: number) => {
    const updated = customTasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const targetTask = customTasks.find((t) => t.id === taskId);
    const willBeCompleted = !targetTask?.isCompleted;

    saveDailyLog(selectedDate, { activeCustomTasks: updated });

    if (willBeCompleted) {
      toast.success(`Recovered +${recoveryHp} HP! 🌿`, {
        description: "Task checked! Points restored on receipt.",
      });
    }
  };

  return (
    <div className="px-5 space-y-2.5">
      {/* Clean Header */}
      <div className="flex items-center gap-1.5 text-[#1B6C43] pt-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-xs font-black uppercase tracking-wider">
          Today's Plan to Recover
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {/* Dynamic Log Tasks */}
        {dynamicTasks.map((task) => {
          const isCompleted = completedList.includes(task.id);

          return (
            <div
              key={task.id}
              onClick={() => handleToggleDynamicTask(task.id, task.recoveryHp)}
              className={cn(
                "p-3 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 shadow-2xs",
                isCompleted
                  ? "bg-[#D8EDDE]/70 border-[#1B6C43]/30 text-neutral-500"
                  : "bg-white border-neutral-200/80 hover:border-neutral-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  {task.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-bold leading-tight",
                    isCompleted ? "line-through text-neutral-400" : "text-[#191C1A]"
                  )}
                >
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-lg transition-colors",
                    isCompleted
                      ? "bg-[#1B6C43] text-white"
                      : "bg-[#D8EDDE] text-[#0A3D22]"
                  )}
                >
                  +{task.recoveryHp} HP
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1B6C43]" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-300" />
                )}
              </div>
            </div>
          );
        })}

        {/* Custom Added Tasks */}
        {customTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggleCustomTask(task.id, task.recoveryHp)}
            className={cn(
              "p-3 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 shadow-2xs",
              task.isCompleted
                ? "bg-[#D8EDDE]/70 border-[#1B6C43]/30 text-neutral-500"
                : "bg-white border-neutral-200/80 hover:border-neutral-300"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                {getIcon(task.iconName)}
              </div>
              <span
                className={cn(
                  "text-xs font-bold leading-tight",
                  task.isCompleted ? "line-through text-neutral-400" : "text-[#191C1A]"
                )}
              >
                {task.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-lg transition-colors",
                  task.isCompleted
                    ? "bg-[#1B6C43] text-white"
                    : "bg-[#D8EDDE] text-[#0A3D22]"
                )}
              >
                +{task.recoveryHp} HP
              </span>

              {task.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[#1B6C43]" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-300" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
