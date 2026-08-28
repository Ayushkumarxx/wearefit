"use client";

import React, { useState, useEffect } from "react";
import { Check, Circle, Sparkles, Footprints, Droplet, Salad, Dumbbell, Utensils, Moon } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { format, subDays, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TodayCompensationTasks() {
  const { selectedDate, getLogForDate, saveDailyLog, togglePrescriptionCompleted, dailyLogs, userProfile } = useHealthStore();
  const log = getLogForDate(selectedDate);

  // Dynamic hours left till midnight
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

  const isLateNight = hoursLeft <= 3; // After ~9 PM

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

  // Time-of-day dynamic tasks (No redundant "X hour left" pill)
  const dynamicTasks: Array<{
    id: string;
    title: string;
    recoveryHp: number;
    icon: React.ReactNode;
    isYesterday?: boolean;
  }> = [];

  // A. TODAY'S IMMEDIATE DEFICITS & ROADMAP TO 100 HP (Time-Aware & Context-Aware):

  // 1. Movement & Athletic Training Roadmap (Daytime vs Nighttime)
  if ((log.steps || 0) < 8000 && (log.workoutMinutes || 0) === 0) {
    if (hoursLeft > 6) {
      dynamicTasks.push({
        id: "today_movement_steps",
        title: "Hit 8,000 Daily Steps (Movement Baseline to 100 HP)",
        recoveryHp: 5,
        icon: <Footprints className="w-4 h-4 text-emerald-600" />,
      });
      dynamicTasks.push({
        id: "today_workout_session",
        title: "30-Min Workout / Athletic Training Session",
        recoveryHp: 5,
        icon: <Dumbbell className="w-4 h-4 text-amber-600" />,
      });
    } else if (!isLateNight) {
      dynamicTasks.push({
        id: "today_evening_walk",
        title: "20-Min Evening Movement Walk (2,500 Steps)",
        recoveryHp: 4,
        icon: <Footprints className="w-4 h-4 text-emerald-600" />,
      });
    }
  } else if ((log.steps || 0) < 5000) {
    if (hoursLeft > 4) {
      dynamicTasks.push({
        id: "today_evening_walk",
        title: "Brisk Movement Walk (3,000 Steps to 100 HP)",
        recoveryHp: 4,
        icon: <Footprints className="w-4 h-4 text-emerald-600" />,
      });
    }
  }

  // 2. Hydration Roadmap
  if ((log.waterLiters || 0) < 2.0) {
    if (isLateNight) {
      dynamicTasks.push({
        id: "today_water_hydrate",
        title: "Sip 250ml Electrolyte Water (Gentle Evening Hydration)",
        recoveryHp: 4,
        icon: <Droplet className="w-4 h-4 text-blue-600" />,
      });
    } else {
      dynamicTasks.push({
        id: "today_water_hydrate",
        title: `Drink ${log.waterLiters === 0 ? "2.0L" : "1.0L"} Electrolyte Mineral Water`,
        recoveryHp: 5,
        icon: <Droplet className="w-4 h-4 text-blue-600" />,
      });
    }
  }

  // 3. Sleep Deficit Today (<6.5h sleep)
  if (log.sleepHours > 0 && log.sleepHours < 6.5) {
    if (hoursLeft > 6) {
      dynamicTasks.push({
        id: "today_sleep_nap",
        title: "20-Min NSDR / Power Nap (Afternoon Energy Boost)",
        recoveryHp: 5,
        icon: <Moon className="w-4 h-4 text-purple-600" />,
      });
      dynamicTasks.push({
        id: "today_sleep_caffeine",
        title: "Zero Afternoon Stimulants (Protect Remaining Deep Sleep)",
        recoveryHp: 4,
        icon: <Moon className="w-4 h-4 text-purple-600" />,
      });
    } else {
      dynamicTasks.push({
        id: "today_sleep_early",
        title: "Wind Down 45m Early Tonight (Target 8.5h Deep Sleep)",
        recoveryHp: 6,
        icon: <Moon className="w-4 h-4 text-purple-600" />,
      });
      dynamicTasks.push({
        id: "today_sleep_cool",
        title: "Zero Blue Light & 19°C Cool Bedroom Reset",
        recoveryHp: 4,
        icon: <Moon className="w-4 h-4 text-purple-600" />,
      });
    }
  }

  // 4. Calorie under-fueling / zero calories
  if (log.calories === 0) {
    dynamicTasks.push({
      id: "today_cal_refuel",
      title: "Fuel with 35g Clean Protein & Whole Foods",
      recoveryHp: 5,
      icon: <Utensils className="w-4 h-4 text-emerald-600" />,
    });
  } else if (log.calories < 1200 || log.calories < baseTargetCalories - 450) {
    if (isLateNight) {
      dynamicTasks.push({
        id: "today_cal_refuel",
        title: "Light Nutrient-Dense Protein / Casein Snack",
        recoveryHp: 5,
        icon: <Utensils className="w-4 h-4 text-emerald-600" />,
      });
    } else {
      dynamicTasks.push({
        id: "today_cal_refuel",
        title: "Caloric Refuel Meal with Clean Whole Foods",
        recoveryHp: 5,
        icon: <Utensils className="w-4 h-4 text-emerald-600" />,
      });
    }
  }

  // 5. Caloric surplus / heavy meal / outside food
  if (log.calories > baseTargetCalories + 350 || log.ateOutside) {
    dynamicTasks.push({
      id: "today_walk_digest",
      title: isLateNight ? "10-Min Gentle Digestion Walk" : "20-Min Post-Meal Glucose Digestion Walk",
      recoveryHp: 5,
      icon: <Footprints className="w-4 h-4 text-emerald-600" />,
    });
  }

  // 6. Ultra-processed antioxidant flush
  if (log.ultraProcessed) {
    dynamicTasks.push({
      id: "today_tea_flush",
      title: "Green Tea / Antioxidant Polyphenol Flush",
      recoveryHp: 5,
      icon: <Salad className="w-4 h-4 text-green-600" />,
    });
  }

  // 7. Heavy Workout / High Step Exertion Recovery (>90m workout or >18k steps)
  if ((log.workoutMinutes || 0) >= 75 || (log.steps || 0) >= 16000) {
    dynamicTasks.push({
      id: "today_heavy_recovery",
      title: "Active Muscle Recovery & Warm Epsom Bath",
      recoveryHp: 5,
      icon: <Dumbbell className="w-4 h-4 text-amber-600" />,
    });
    dynamicTasks.push({
      id: "today_heavy_protein",
      title: "35g Leucine-Rich Protein Refuel for Muscle Repair",
      recoveryHp: 5,
      icon: <Utensils className="w-4 h-4 text-emerald-600" />,
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
        isYesterday: true,
      });
    }

    // Yesterday Dehydration (<1.5L) -> Today 2.5L Hydration
    if (yesterdayLog.waterLiters < 1.5 && !dynamicTasks.some((t) => t.id === "comp_yesterday_water")) {
      dynamicTasks.push({
        id: "comp_yesterday_water",
        title: "Drink 2.5L Water + Mineral Salt (Hydration Flush)",
        recoveryHp: 4,
        icon: <Droplet className="w-4 h-4 text-blue-600" />,
        isYesterday: true,
      });
    }

    // Yesterday Low Protein -> Today 35g Protein Anchor
    if (yesterdayLog.calories > 0 && yesterdayLog.macros && (yesterdayLog.macros.protein || 0) < minProtein && !dynamicTasks.some((t) => t.id === "comp_yesterday_protein")) {
      dynamicTasks.push({
        id: "comp_yesterday_protein",
        title: `Eat 35g Clean Protein on First Meal (Target: ${Math.round(weightKg * 1.5)}g)`,
        recoveryHp: 5,
        icon: <Utensils className="w-4 h-4 text-emerald-600" />,
        isYesterday: true,
      });
    }

    // Yesterday Low Fat -> Today Healthy Fats
    if (yesterdayLog.calories > 0 && yesterdayLog.macros && (yesterdayLog.macros.fat || 0) < 30 && !dynamicTasks.some((t) => t.id === "comp_yesterday_fats")) {
      dynamicTasks.push({
        id: "comp_yesterday_fats",
        title: "Incorporate Healthy Fats Today (Fat Deficit Reset)",
        recoveryHp: 4,
        icon: <Salad className="w-4 h-4 text-green-600" />,
        isYesterday: true,
      });
    }
  }

  // C. CUSTOM ADVISOR TASKS (From 'Should I Eat/Do This?' Advisor):
  const customTasks = (log.activeCustomTasks || []).map((t) => ({
    id: `custom_${t.id}`,
    title: t.title,
    recoveryHp: t.recoveryHp,
    icon: getIcon(t.iconName),
    isCustom: true,
    customTaskId: t.id,
  }));

  const completedList = log.completedPrescriptions || [];

  const handleToggleTask = (task: { id: string; title: string; recoveryHp: number; isCustom?: boolean; customTaskId?: string }) => {
    if (task.isCustom && task.customTaskId) {
      const updatedCustom = (log.activeCustomTasks || []).map((t) =>
        t.id === task.customTaskId ? { ...t, isCompleted: !t.isCompleted } : t
      );
      saveDailyLog(selectedDate, { activeCustomTasks: updatedCustom });
      const willBeCompleted = !taskIsCompleted(task.id);
      if (willBeCompleted) {
        toast.success(`Recovered +${task.recoveryHp} HP! 🌿`, {
          description: `Completed custom task: ${task.title}`,
        });
      } else {
        toast.info("Task marked incomplete", {
          description: "Recovery points deducted.",
        });
      }
      return;
    }

    togglePrescriptionCompleted(selectedDate, task.id);
    const willBeCompleted = !taskIsCompleted(task.id);
    if (willBeCompleted) {
      toast.success(`Recovered +${task.recoveryHp} HP! 🌿`, {
        description: `Fulfilled compensation task: ${task.title}`,
      });
    } else {
      toast.info("Task marked incomplete", {
        description: "Recovery points deducted.",
      });
    }
  };

  const taskIsCompleted = (taskId: string) => {
    if (taskId.startsWith("custom_")) {
      const realId = taskId.replace("custom_", "");
      const found = (log.activeCustomTasks || []).find((t) => t.id === realId);
      return !!found?.isCompleted;
    }
    return completedList.includes(taskId);
  };

  const allAvailableTasks = [...customTasks, ...dynamicTasks].slice(0, 6);

  if (allAvailableTasks.length === 0) {
    return (
      <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-2xs text-center space-y-1.5 select-none">
        <div className="w-8 h-8 rounded-full bg-[#D8EDDE] text-[#0A3D22] flex items-center justify-center mx-auto">
          <Sparkles className="w-4 h-4" />
        </div>
        <h4 className="font-display font-black text-xs text-[#191C1A]">Optimal Balance Maintained</h4>
        <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
          No urgent biological deficits or carryover debt detected for today.
        </p>
      </div>
    );
  }

  const completedCount = allAvailableTasks.filter((t) => taskIsCompleted(t.id)).length;
  const totalPotentialHp = allAvailableTasks.reduce((acc, t) => acc + t.recoveryHp, 0);
  const earnedHp = allAvailableTasks
    .filter((t) => taskIsCompleted(t.id))
    .reduce((acc, t) => acc + t.recoveryHp, 0);

  return (
    <div className="space-y-2.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#D8EDDE] text-[#0A3D22] flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-display font-black text-xs text-[#191C1A]">Today&apos;s Recovery Plan</h3>
            <p className="text-[10px] text-neutral-400 font-semibold">
              {completedCount} of {allAvailableTasks.length} tasks completed
            </p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {allAvailableTasks.map((task) => {
          const isDone = taskIsCompleted(task.id);
          return (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task)}
              className={cn(
                "p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99]",
                isDone
                  ? "bg-[#D8EDDE]/40 border-[#1B6C43]/30 shadow-2xs"
                  : "bg-white hover:bg-neutral-50 border-neutral-200/80 shadow-2xs"
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="shrink-0">{task.icon}</div>
                <div className="space-y-0.5 min-w-0">
                  {(task as any).isYesterday && (
                    <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md inline-block mr-1.5">
                      Yesterday Carryover
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-xs font-bold leading-snug block",
                      isDone ? "text-[#0A3D22] line-through opacity-85" : "text-[#191C1A]"
                    )}
                  >
                    {task.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-black font-mono px-2 py-0.5 rounded-lg border",
                    isDone
                      ? "bg-[#1B6C43] text-white border-[#1B6C43]"
                      : "bg-white text-[#1B6C43] border-[#1B6C43]/30"
                  )}
                >
                  +{task.recoveryHp} HP
                </span>

                <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-[#1B6C43] flex items-center justify-center text-white shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-300 bg-white" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
