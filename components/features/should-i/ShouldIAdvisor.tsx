"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RefreshCw, Check, Plus, Footprints, HelpCircle, ChevronRight } from "lucide-react";
import { M3Button } from "@/components/ui/M3Button";
import { useHealthStore } from "@/context/useHealthStore";
import { format, addDays, parseISO } from "date-fns";
import {
  CATEGORIZED_ADVICE_QUESTIONS,
  evaluateShouldIQuestion,
  EnhancedAdviceResult,
} from "@/lib/advice-engine";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ShouldIAdvisor() {
  const {
    selectedDate,
    getLogForDate,
    getReceiptForDate,
    saveDailyLog,
    userProfile,
    addAdvice,
    dailyLogs,
  } = useHealthStore();

  const [customQuestion, setCustomQuestion] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Cheat Meals & Takeout");
  const [activeResponse, setActiveResponse] = useState<EnhancedAdviceResult | null>(null);

  const currentReceipt = getReceiptForDate(selectedDate);
  const currentLog = getLogForDate(selectedDate);

  const recentLogs = Object.values(dailyLogs);
  const avgScore =
    recentLogs.length > 0
      ? recentLogs.reduce((acc, l) => acc + (getReceiptForDate(l.date).totalScore || 75), 0) /
        recentLogs.length
      : 75;

  const handleAsk = (questionText: string) => {
    if (!questionText.trim()) return;

    const res = evaluateShouldIQuestion(
      questionText.trim(),
      currentReceipt.totalScore,
      currentLog,
      userProfile,
      avgScore
    );

    setActiveResponse(res);
    addAdvice(res);
    setCustomQuestion(questionText);
    if (!res.isUnrecognized) {
      toast.success("Advisor calculated dynamic impact!");
    }
  };

  const handleAddCompensationTask = () => {
    if (!activeResponse?.suggestedCompensation) return;

    const isTomorrow = activeResponse.actionTiming === "tomorrow";
    const targetDate = isTomorrow
      ? format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd")
      : selectedDate;

    const targetLog = getLogForDate(targetDate);
    const customTasks = targetLog.activeCustomTasks || [];
    const taskObj = {
      id: `task_${Date.now()}`,
      title: activeResponse.compensationTip || activeResponse.suggestedCompensation.title,
      recoveryHp: Math.max(3, Math.abs(activeResponse.adjustedHPImpact)),
      iconName: (activeResponse.suggestedCompensation.iconName || "Footprints") as any,
      isCompleted: false,
    };

    saveDailyLog(targetDate, {
      activeCustomTasks: [...customTasks.filter((t) => t.title !== taskObj.title), taskObj],
    });

    toast.success(isTomorrow ? "Task Scheduled for Tomorrow's Plan! 🌿" : "Task Added to Today's Plan! 🌿", {
      description: `${taskObj.title} is ready in your ${isTomorrow ? "Tomorrow" : "Today"} plan.`,
    });
  };

  const handleIDidThis = () => {
    if (!activeResponse || activeResponse.isUnrecognized) return;

    const q = activeResponse.question.toLowerCase();
    const existingAdviceActions = currentLog.loggedAdviceActions || [];

    const newAdviceItem = {
      id: `adv_${Date.now()}`,
      title: activeResponse.question,
      pointsDelta: activeResponse.adjustedHPImpact,
      category: (q.includes("workout") || q.includes("run") || q.includes("gym")
        ? "activity"
        : q.includes("water")
        ? "hydration"
        : q.includes("sleep") || q.includes("nap") || q.includes("meditation")
        ? "sleep"
        : "nutrition") as any,
    };

    const updates: Partial<typeof currentLog> = {
      loggedAdviceActions: [...existingAdviceActions, newAdviceItem],
    };

    if (q.includes("workout") || q.includes("weight training") || q.includes("run") || q.includes("gym")) {
      updates.workoutMinutes = (currentLog.workoutMinutes || 0) + 40;
      updates.steps = (currentLog.steps || 0) + 3000;
    } else if (q.includes("water") || q.includes("hydrate")) {
      updates.waterLiters = (currentLog.waterLiters || 1.5) + 0.8;
    }

    saveDailyLog(selectedDate, updates);

    const deltaSign = activeResponse.adjustedHPImpact >= 0 ? "+" : "";
    toast.success("Recorded to Receipt Statement! 🌿", {
      description: `${activeResponse.question} (${deltaSign}${activeResponse.adjustedHPImpact} HP) is now on your receipt.`,
    });
  };

  const calculateNeedleAngle = () => {
    if (!activeResponse || activeResponse.isUnrecognized) return 90;
    if (activeResponse.adjustedHPImpact >= 0) return 35;
    const impactMagnitude = Math.min(18, Math.abs(activeResponse.adjustedHPImpact));
    return 90 + (impactMagnitude / 18) * 65;
  };

  const needleAngle = calculateNeedleAngle();

  return (
    <div className="p-5 space-y-4 select-none">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="font-display font-black text-2xl text-[#191C1A]">
          "Should I...?" Advisor
        </h1>
        <p className="text-xs text-neutral-500">
          Ask before you indulge. See instant biological score impact.
        </p>
      </div>

      {/* Question Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(customQuestion);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="e.g. Should I eat a burger tonight?"
          className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white border border-neutral-300 focus:border-[#1B6C43] text-xs font-semibold text-[#191C1A] outline-none shadow-xs"
        />
        <button
          type="submit"
          disabled={!customQuestion.trim()}
          className="absolute right-1.5 w-9 h-9 rounded-xl bg-[#1B6C43] text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* CATEGORIZED QUESTION TABS (HIDDEN ONCE ANSWER IS ACTIVE) */}
      {!activeResponse && (
        <div className="space-y-3 pt-1">
          {/* Category Horizontal Slider (Zero Scrollbar) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIZED_ADVICE_QUESTIONS.map((cat) => {
              const isSelected = activeCategory === cat.category;
              return (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none",
                    isSelected
                      ? "bg-[#191C1A] text-white shadow-xs"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.category}</span>
                </button>
              );
            })}
          </div>

          {/* Clean One-After-Another Vertical Question List */}
          <div className="space-y-2 pt-1">
            {CATEGORIZED_ADVICE_QUESTIONS.find(
              (c) => c.category === activeCategory
            )?.questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200/80 text-xs font-bold text-[#191C1A] shadow-2xs transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <span>{q}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#1B6C43] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SPEEDOMETER IMPACT CARD OR UNRECOGNIZED NOTICE */}
      <AnimatePresence mode="wait">
        {activeResponse && (
          <motion.div
            key={activeResponse.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-3.5 text-center"
          >
            {activeResponse.isUnrecognized ? (
              /* Case 1: Unrecognized Query Notice */
              <div className="space-y-3 py-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#191C1A]">
                    No Health Impact Found
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 leading-snug">
                    Ask about food (burger, pizza, dessert), workouts, sleep, or drinks!
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  {CATEGORIZED_ADVICE_QUESTIONS[0].questions.slice(0, 3).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(q)}
                      className="w-full p-2.5 rounded-xl bg-neutral-100 text-xs font-semibold text-[#191C1A] hover:bg-neutral-200 cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Case 2: Recognized Query with Semicircle Speedometer */
              <>
                {/* Semicircle Speedometer Arc */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative w-[210px] h-[115px] flex items-end justify-center">
                    <svg className="w-[210px] h-[115px]" viewBox="0 0 210 115">
                      <defs>
                        <linearGradient id="speedoArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="45%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#F43F5E" />
                        </linearGradient>
                      </defs>

                      <path
                        d="M 25 105 A 80 80 0 0 1 185 105"
                        fill="none"
                        stroke="#E5EAE5"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />

                      <path
                        d="M 25 105 A 80 80 0 0 1 185 105"
                        fill="none"
                        stroke="url(#speedoArcGradient)"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />

                      <g transform={`rotate(${needleAngle - 90}, 105, 105)`}>
                        <line
                          x1="105"
                          y1="105"
                          x2="105"
                          y2="34"
                          stroke="#191C1A"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <polygon
                          points="105,26 101,36 109,36"
                          fill="#191C1A"
                        />
                      </g>

                      <circle cx="105" cy="105" r="7" fill="#191C1A" />
                      <circle cx="105" cy="105" r="3" fill="#FFFFFF" />
                    </svg>
                  </div>

                  {/* Impact Pill */}
                  <div className="mt-2">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-black font-mono border",
                        activeResponse.impactBadgeColor
                      )}
                    >
                      Impact: {activeResponse.adjustedHPImpact >= 0 ? `+${activeResponse.adjustedHPImpact}` : activeResponse.adjustedHPImpact} HP ({activeResponse.impactLevel})
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="font-display font-extrabold text-base text-[#191C1A] leading-tight pt-1">
                  {activeResponse.headline}
                </h3>

                {/* Action Row with Clean Timing Tag & Add Task Button */}
                {activeResponse.suggestedCompensation && (
                  <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-neutral-100">
                        <Footprints className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B6C43]">
                          {activeResponse.actionDateLabel}
                        </span>
                        <p className="text-xs font-bold text-[#191C1A] leading-tight">
                          {activeResponse.compensationTip}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleAddCompensationTask}
                      className="px-3 py-1.5 rounded-xl bg-[#1B6C43] text-white text-xs font-bold hover:bg-[#155735] shadow-2xs shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{activeResponse.actionTiming === "tomorrow" ? "Add to Tomorrow" : "Add to Today"}</span>
                    </button>
                  </div>
                )}

                {/* Actions: 'I Did This' & 'Ask Another' */}
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={handleIDidThis}
                    className="flex-1 h-11 rounded-2xl bg-[#1B6C43] hover:bg-[#155735] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>I Did This</span>
                  </button>

                  <button
                    onClick={() => setActiveResponse(null)}
                    className="px-4 h-11 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-xs border border-neutral-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Ask Another</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
