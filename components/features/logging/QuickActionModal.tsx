"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplet, Plus, Minus, Footprints, Dumbbell, Sparkles } from "lucide-react";
import { useHealthStore, getTodayString } from "@/context/useHealthStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuickActionModal() {
  const { isQuickActionOpen, setIsQuickActionOpen, selectedDate, getLogForDate, saveDailyLog } = useHealthStore();

  const activeDate = selectedDate || getTodayString();
  const currentLog = getLogForDate(activeDate);

  // Fully customizable steppers
  const [customWaterMl, setCustomWaterMl] = useState(250);
  const [customProteinG, setCustomProteinG] = useState(25);
  const [customCarbsG, setCustomCarbsG] = useState(30);
  const [customFatG, setCustomFatG] = useState(15);
  const [customSteps, setCustomSteps] = useState(2000);
  const [customWorkoutMins, setCustomWorkoutMins] = useState(30);
  const [customPenaltyPts, setCustomPenaltyPts] = useState(1);

  if (!isQuickActionOpen) return null;

  // 1. Direct Add Water (Capped at 6.5L)
  const handleAddWater = (ml: number) => {
    const litersToAdd = ml / 1000;
    const newWater = Number(Math.min(6.5, currentLog.waterLiters + litersToAdd).toFixed(2));
    saveDailyLog(activeDate, { waterLiters: newWater });
    toast.success(`+${ml}ml Water Added! 💧`, {
      description: `Today's total: ${newWater} L`,
    });
  };

  // 2. Direct Add Macro (Capped at 6000 kcal)
  const handleAddMacro = (type: "protein" | "carbs" | "fat", grams: number) => {
    const caloriesPerGram = type === "fat" ? 9 : 4;
    const addedCalories = grams * caloriesPerGram;

    const currentMacros = currentLog.macros || { carbs: 0, protein: 0, fat: 0 };
    saveDailyLog(activeDate, {
      calories: Math.min(6000, currentLog.calories + addedCalories),
      macros: {
        ...currentMacros,
        [type]: (currentMacros[type] || 0) + grams,
      },
    });

    toast.success(`+${grams}g ${type.charAt(0).toUpperCase() + type.slice(1)} Added! 🥗`, {
      description: `+${addedCalories} kcal logged on today's statement`,
    });
  };

  // 3. Direct Add Steps (Capped at 35,000 steps)
  const handleAddSteps = (steps: number) => {
    const newSteps = Math.min(35000, currentLog.steps + steps);
    saveDailyLog(activeDate, { steps: newSteps });
    toast.success(`+${steps.toLocaleString()} Steps Added! 👟`, {
      description: `Today's total: ${newSteps.toLocaleString()} steps`,
    });
  };

  // 4. Direct Add Workout (Capped at 240 mins)
  const handleAddWorkout = (minutes: number) => {
    const newMinutes = Math.min(240, currentLog.workoutMinutes + minutes);
    saveDailyLog(activeDate, { workoutMinutes: newMinutes });
    toast.success(`+${minutes}m Workout Added! 🏋️`, {
      description: `Today's total: ${newMinutes} mins`,
    });
  };

  // 5. Outside Food Penalty Action (-X Quality Points)
  const handleLogBadFood = (penaltyPoints: number) => {
    const newScore = Math.max(1, currentLog.healthyEatingScore - penaltyPoints);
    saveDailyLog(activeDate, {
      healthyEatingScore: newScore,
      ateOutside: true,
      ultraProcessed: true,
    });
    toast.error(`Had Junk Meal 🍕 (-${penaltyPoints} Pts)`, {
      description: `Clean Eating Quality dropped to ${newScore}/10. Biological deduction applied.`,
    });
  };

  return (
    <AnimatePresence>
      {isQuickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQuickActionOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md max-h-[92vh] bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl z-10 flex flex-col justify-between overflow-hidden text-[#191C1A] select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-[#1B6C43] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[#191C1A]">Quick Add Boosters</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold">Categorized Fast Logging</p>
                </div>
              </div>

              <button
                onClick={() => setIsQuickActionOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Categorized Quick Action Sections */}
            <div className="my-3 flex-1 overflow-y-auto space-y-4 pr-0.5">
              {/* CATEGORY 1: HYDRATION & RECOVERY */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Hydration & Recovery
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                <div className="bg-[#F0F8FF] p-3.5 rounded-2xl border border-blue-200 shadow-2xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-black text-blue-950 block leading-none truncate">Hydration</span>
                      <span className="text-[10px] text-blue-600 font-semibold block leading-none truncate">
                        {Math.round(currentLog.waterLiters * 1000)}ml total
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-blue-200 shadow-2xs">
                      <button
                        onClick={() => setCustomWaterMl((prev) => Math.max(50, prev - 50))}
                        className="w-5 h-5 rounded-md hover:bg-blue-50 text-xs font-black text-blue-800 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-xs font-black text-blue-900 min-w-[44px] text-center">
                        {customWaterMl}ml
                      </span>
                      <button
                        onClick={() => setCustomWaterMl((prev) => Math.min(1500, prev + 50))}
                        className="w-5 h-5 rounded-md hover:bg-blue-50 text-xs font-black text-blue-800 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddWater(customWaterMl)}
                      disabled={currentLog.waterLiters >= 5.0}
                      className={cn(
                        "px-3 py-1.5 font-black text-xs rounded-xl shadow-2xs transition-all",
                        currentLog.waterLiters >= 5.0
                          ? "bg-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer"
                      )}
                    >
                      {currentLog.waterLiters >= 5.0 ? "Max" : "+ Add"}
                    </button>
                  </div>
                </div>
              </div>

              {/* CATEGORY 2: MACRONUTRIENTS & FUEL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Macronutrients & Fuel
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                {/* Protein */}
                <div className="bg-[#EAF5EE] p-3.5 rounded-2xl border border-[#1B6C43]/25 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">🍗</span>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-black text-[#0A3D22] block leading-none truncate">Protein</span>
                      <span className="text-[10px] text-[#1B6C43] font-semibold block leading-none truncate">+{customProteinG * 4} kcal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-[#1B6C43]/20 shadow-2xs">
                      <button
                        onClick={() => setCustomProteinG((p) => Math.max(5, p - 5))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-xs font-black text-[#0A3D22] min-w-[32px] text-center">
                        {customProteinG}g
                      </span>
                      <button
                        onClick={() => setCustomProteinG((p) => Math.min(100, p + 5))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddMacro("protein", customProteinG)}
                      className="px-3 py-1.5 bg-[#1B6C43] hover:bg-[#155735] text-white font-black text-xs rounded-xl shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-[#FFF4D9] p-3.5 rounded-2xl border border-[#FFE7A3] flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">🍚</span>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-black text-[#78350F] block leading-none truncate">Carbohydrates</span>
                      <span className="text-[10px] text-amber-700 font-semibold block leading-none truncate">+{customCarbsG * 4} kcal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-[#FFE7A3] shadow-2xs">
                      <button
                        onClick={() => setCustomCarbsG((c) => Math.max(5, c - 5))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-xs font-black text-[#78350F] min-w-[32px] text-center">
                        {customCarbsG}g
                      </span>
                      <button
                        onClick={() => setCustomCarbsG((c) => Math.min(150, c + 5))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddMacro("carbs", customCarbsG)}
                      className="px-3 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs rounded-xl shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Fats */}
                <div className="bg-neutral-100 p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">🥑</span>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-black text-neutral-800 block leading-none truncate">Healthy Fats</span>
                      <span className="text-[10px] text-neutral-500 font-semibold block leading-none truncate">+{customFatG * 9} kcal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-neutral-200 shadow-2xs">
                      <button
                        onClick={() => setCustomFatG((f) => Math.max(5, f - 5))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-xs font-black text-neutral-800 min-w-[32px] text-center">
                        {customFatG}g
                      </span>
                      <button
                        onClick={() => setCustomFatG((f) => Math.min(80, f + 5))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddMacro("fat", customFatG)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-black text-xs rounded-xl shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* CATEGORY 3: MOVEMENT & WORKOUT */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Movement & Workout
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                {/* Steps */}
                <div className="bg-[#EBF7EE] p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-black text-emerald-950 block leading-none truncate">Quick Walk</span>
                      <span className="text-[10px] text-emerald-700 font-semibold block leading-none truncate">
                        {currentLog.steps.toLocaleString()} steps
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                      <button
                        onClick={() => setCustomSteps((s) => Math.max(500, s - 500))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-xs font-black text-emerald-900 min-w-[38px] text-center">
                        +{(customSteps / 1000).toFixed(1)}k
                      </span>
                      <button
                        onClick={() => setCustomSteps((s) => Math.min(10000, s + 500))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddSteps(customSteps)}
                      disabled={currentLog.steps >= 35000}
                      className={cn(
                        "px-3 py-1.5 font-black text-xs rounded-xl shadow-2xs transition-all",
                        currentLog.steps >= 35000
                          ? "bg-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed"
                          : "bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95 cursor-pointer"
                      )}
                    >
                      {currentLog.steps >= 35000 ? "Max" : "+ Add"}
                    </button>
                  </div>
                </div>

                {/* Workout */}
                <div className="bg-[#FFF8E6] p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-black text-amber-950 block leading-none truncate">Workout</span>
                      <span className="text-[10px] text-amber-700 font-semibold block leading-none truncate">
                        {currentLog.workoutMinutes}m logged
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-amber-200 shadow-2xs">
                      <button
                        onClick={() => setCustomWorkoutMins((w) => Math.max(10, w - 10))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-xs font-black text-amber-900 min-w-[38px] text-center">
                        +{customWorkoutMins}m
                      </span>
                      <button
                        onClick={() => setCustomWorkoutMins((w) => Math.min(120, w + 10))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddWorkout(customWorkoutMins)}
                      disabled={currentLog.workoutMinutes >= 180}
                      className={cn(
                        "px-3 py-1.5 font-black text-xs rounded-xl shadow-2xs transition-all",
                        currentLog.workoutMinutes >= 180
                          ? "bg-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed"
                          : "bg-amber-600 hover:bg-amber-700 text-white active:scale-95 cursor-pointer"
                      )}
                    >
                      {currentLog.workoutMinutes >= 180 ? "Max" : "+ Add"}
                    </button>
                  </div>
                </div>
              </div>

              {/* CATEGORY 4: HABIT & SLIP-UP PENALTY */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Habit Slip-Up Penalty
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                <div className="bg-[#FFF5F5] p-3.5 rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">🍕</span>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-black text-rose-950 block leading-none truncate">Junk Meal</span>
                      <span className="text-[10px] text-rose-600 font-semibold block leading-none truncate">Quality deduction</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-rose-200 shadow-2xs">
                      <button
                        onClick={() => setCustomPenaltyPts((p) => Math.max(1, p - 1))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-xs font-black text-rose-900 min-w-[32px] text-center">
                        -{customPenaltyPts}pt
                      </span>
                      <button
                        onClick={() => setCustomPenaltyPts((p) => Math.min(5, p + 1))}
                        className="w-5 h-5 rounded-md hover:bg-neutral-100 text-xs font-black text-neutral-600 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleLogBadFood(customPenaltyPts)}
                      disabled={currentLog.healthyEatingScore <= 1}
                      className={cn(
                        "px-3 py-1.5 font-black text-xs rounded-xl shadow-2xs transition-all",
                        currentLog.healthyEatingScore <= 1
                          ? "bg-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed"
                          : "bg-rose-600 hover:bg-rose-700 text-white active:scale-95 cursor-pointer"
                      )}
                    >
                      {currentLog.healthyEatingScore <= 1 ? "Min" : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Done Button */}
            <div className="pt-2 shrink-0">
              <button
                onClick={() => setIsQuickActionOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-[#191C1A] hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
