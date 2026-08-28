"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RefreshCw, Check, Footprints, HelpCircle, ChevronRight } from "lucide-react";
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

  const topRef = React.useRef<HTMLDivElement | null>(null);
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
    
    // Smoothly scroll to top so user sees the assessment animate in
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    if (!res.isUnrecognized) {
      toast.success("Advisor calculated biological impact!");
    }
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
    } else if (q.includes("burger") || q.includes("pizza") || q.includes("fries") || q.includes("donut") || q.includes("fried")) {
      updates.ateOutside = true;
      updates.ultraProcessed = true;
    }

    // AUTO-SCHEDULE RECOVERY TASK DIRECTLY (Zero extra buttons required!)
    if (activeResponse.suggestedCompensation) {
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
    }

    saveDailyLog(selectedDate, updates);

    const deltaSign = activeResponse.adjustedHPImpact >= 0 ? "+" : "";
    toast.success("Logged & Recovery Fix Auto-Added! 🌿", {
      description: `${activeResponse.question} (${deltaSign}${activeResponse.adjustedHPImpact} HP) logged. Recovery task added to ${activeResponse.actionTiming === "tomorrow" ? "Tomorrow's" : "Today's"} plan.`,
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
    <div ref={topRef} className="p-5 space-y-4 select-none scroll-mt-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="font-display font-black text-2xl text-[#191C1A]">
          &ldquo;Should I...?&rdquo; Advisor
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
          className="absolute right-2 w-8 h-8 rounded-xl bg-[#1B6C43] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#155735] transition-all cursor-pointer shadow-2xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Live Assessment Result Card */}
      <AnimatePresence mode="wait">
        {activeResponse && (
          <motion.div
            key={activeResponse.question}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-4 text-center"
          >
            {activeResponse.isUnrecognized ? (
              <div className="space-y-3 py-2">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto shadow-2xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#191C1A]">
                    {activeResponse.headline}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {activeResponse.reasoning}
                  </p>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                    Try Asking:
                  </span>
                  {[
                    "Should I eat a burger tonight?",
                    "Can I have ice cream after dinner?",
                    "Should I skip my workout today?",
                  ].map((q, idx) => (
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
              <>
                {/* Speedometer Gauge Graphic */}
                <div className="flex flex-col items-center">
                  <div className="relative w-[210px] h-[115px] flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 210 115" className="w-full h-full">
                      <defs>
                        <linearGradient id="speedoArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="35%" stopColor="#F59E0B" />
                          <stop offset="70%" stopColor="#EF4444" />
                          <stop offset="100%" stopColor="#991B1B" />
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

                  {/* Impact Pill in Gold */}
                  <div className="mt-2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-black font-mono border border-amber-300/80 bg-amber-50 text-amber-900 shadow-2xs">
                      Impact: {activeResponse.adjustedHPImpact >= 0 ? `+${activeResponse.adjustedHPImpact}` : activeResponse.adjustedHPImpact} HP
                    </span>
                  </div>
                </div>

                {/* Headline & Reasoning */}
                <div className="space-y-0.5">
                  <h3 className="font-display font-black text-base text-[#191C1A] leading-tight">
                    {activeResponse.headline}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                    {activeResponse.reasoning}
                  </p>
                </div>

                {/* Suggested Recovery Compensation Notice */}
                {activeResponse.suggestedCompensation && (
                  <div className="bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/80 flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-neutral-100">
                      <Footprints className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-[#1B6C43] block uppercase tracking-wider">
                        + {activeResponse.actionTiming === "tomorrow" ? "Tomorrow's Action" : "Today's Action"}
                      </span>
                      <p className="text-xs font-bold text-[#191C1A]">
                        {activeResponse.compensationTip}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions: 'I Did This' & 'Reset' */}
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
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Category Chips */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-700">Explore Scenarios</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIZED_ADVICE_QUESTIONS.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border",
                activeCategory === cat.category
                  ? "bg-[#1B6C43] text-white border-[#1B6C43] shadow-xs"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.category}</span>
            </button>
          ))}
        </div>

        {/* Category Questions List */}
        <div className="space-y-1.5">
          {CATEGORIZED_ADVICE_QUESTIONS.find((c) => c.category === activeCategory)?.questions.map(
            (q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                className="w-full p-3 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#1B6C43]/40 text-left text-xs font-semibold text-[#191C1A] flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
              >
                <span>{q}</span>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-[#1B6C43] transition-colors" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
