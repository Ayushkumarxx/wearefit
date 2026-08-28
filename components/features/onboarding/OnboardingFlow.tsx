"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Sprout,
  ArrowRight,
  ArrowLeft,
  History,
  ShieldAlert,
  ChevronRight,
  Check,
  Target,
  Trophy,
  Zap,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { M3Button } from "@/components/ui/M3Button";
import { useHealthStore } from "@/context/useHealthStore";
import { DisclaimerModal } from "@/components/features/legal/DisclaimerModal";
import { cn } from "@/lib/utils";

export function OnboardingFlow() {
  const [currentSlide, setCurrentSlide] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [name, setName] = useState("Alex");
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [selectedLaunchType, setSelectedLaunchType] = useState<"demo_history" | "clean_start">("demo_history");

  const { setUserProfile, seedDemoHistory, startCleanSlate } = useHealthStore();

  const handleLaunch = () => {
    const profile = {
      name: name.trim() || "Alex",
      weightKg: weightKg || 70,
      heightCm: heightCm || 175,
      gender: "unspecified" as const,
      focusGoal: "energy_vitality" as const,
      dailyCalorieTarget: 2000,
      dailySleepTargetHours: 8,
      dailyStepsTarget: 8000,
      createdAt: new Date().toISOString(),
    };

    if (selectedLaunchType === "clean_start") {
      startCleanSlate(profile);
    } else {
      setUserProfile(profile);
      seedDemoHistory();
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F7F9F6] sm:bg-[#EAEFEA] flex justify-center items-start sm:items-center font-sans antialiased text-[#191C1A] sm:p-4">
      <div className="w-full max-w-[440px] h-[100dvh] sm:min-h-[820px] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[36px] bg-[#F7F9F6] sm:shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:border sm:border-neutral-200/80 flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none relative">
        {/* Top Header & Segmented Progress Bar */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#1B6C43] text-white flex items-center justify-center font-display font-extrabold text-sm shadow-2xs">
                w
              </div>
              <span className="font-display font-black text-sm text-[#191C1A] tracking-tight">wearefit</span>
            </div>

            <span className="text-[11px] font-mono font-bold text-neutral-400 bg-white border border-neutral-200/80 px-2.5 py-0.5 rounded-full">
              {currentSlide} / 5
            </span>
          </div>

          {/* 5-Step Segmented Bar */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step <= currentSlide ? "bg-[#1B6C43]" : "bg-neutral-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Main Slide Carousel Area */}
        <div className="flex-1 flex flex-col justify-center py-2 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* SLIDE 1: 100 HP HEALTH BANK */}
            {currentSlide === 1 && (
              <motion.div
                key="slide1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 text-center"
              >
                {/* Visual Gauge + Mini Receipt */}
                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90 drop-shadow-xs" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="#E5EAE5" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#1B6C43"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="264"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="flex items-baseline justify-center font-display">
                        <span className="text-3xl font-black tracking-tight text-[#191C1A]">100</span>
                        <span className="text-xs font-black text-[#1B6C43] ml-0.5">HP</span>
                      </div>
                      <span className="text-[8px] font-extrabold text-[#0A3D22] bg-[#D8EDDE] px-1.5 py-0.2 rounded-full border border-[#B9DEC3]">
                        Daily Base
                      </span>
                    </div>
                  </div>

                  {/* Statement Slip */}
                  <div className="w-44 bg-white p-2.5 rounded-2xl border border-neutral-200/80 shadow-2xs font-mono text-left space-y-1 text-[10px]">
                    <div className="flex justify-between items-center text-neutral-500 border-b border-dashed border-neutral-200 pb-0.5 font-bold">
                      <span className="text-[#1B6C43]">STATEMENT</span>
                      <span>#TODAY</span>
                    </div>
                    <div className="space-y-0.5 text-neutral-600 font-sans text-[10px]">
                      <div className="flex justify-between">
                        <span>8h Sleep</span>
                        <span className="font-bold text-[#1B6C43] font-mono">+4 HP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Junk Food</span>
                        <span className="font-bold text-[#BA1A1A] font-mono">-9 HP</span>
                      </div>
                    </div>
                    <div className="pt-0.5 border-t border-dashed border-neutral-200 flex justify-between font-bold text-neutral-800 text-[10px]">
                      <span>Final Score</span>
                      <span className="text-[#1B6C43]">95 HP</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 max-w-xs mx-auto">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D8EDDE] text-[#0A3D22] text-[10px] font-extrabold tracking-wide inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Daily Health Points
                  </span>
                  <h2 className="font-display font-extrabold text-2xl text-[#191C1A] leading-tight">
                    100 HP Every Morning
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                    Start every day with 100 HP. Good habits protect your score; cheat meals and late nights deduct points.
                  </p>
                </div>
              </motion.div>
            )}

            {/* SLIDE 2: LIVING MEADOW GARDEN */}
            {currentSlide === 2 && (
              <motion.div
                key="slide2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 text-center"
              >
                <div className="w-full max-w-[270px] h-32 mx-auto rounded-3xl bg-gradient-to-b from-[#E6F4EA] via-[#D8EFE0] to-[#BCD8C5] border border-[#A7CEB4] flex items-center justify-around text-3xl shadow-inner px-4">
                  <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>
                    🌸
                  </motion.span>
                  <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.2 }}>
                    🥦
                  </motion.span>
                  <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.3, delay: 0.4 }}>
                    🌲
                  </motion.span>
                  <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.6, delay: 0.6 }}>
                    🥀
                  </motion.span>
                </div>

                <div className="space-y-1 max-w-xs mx-auto">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D8EDDE] text-[#0A3D22] text-[10px] font-extrabold tracking-wide inline-flex items-center gap-1">
                    <Sprout className="w-3 h-3" />
                    Living Garden
                  </span>
                  <h2 className="font-display font-extrabold text-2xl text-[#191C1A] leading-tight">
                    Your Habits Bloom
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                    Clean food and sleep sprout flora blooms. Bad days sprout weeds that disappear with healthy streaks.
                  </p>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3: ONE BEST THING */}
            {currentSlide === 3 && (
              <motion.div
                key="slide3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 text-center"
              >
                <div className="w-full max-w-[270px] mx-auto bg-white p-3.5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center font-bold shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#191C1A]">Single Daily Habit</h4>
                      <p className="text-[10px] text-neutral-500">100% Single-Ingredient Foods</p>
                    </div>
                  </div>

                  <div className="bg-[#F7F9F6] p-2 rounded-2xl border border-neutral-200/60">
                    <div className="grid grid-cols-7 gap-1 h-7 items-end">
                      {[60, 100, 100, 80, 100, 40, 100].map((h, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${h}%` }}
                          className={cn("w-full rounded-md", h >= 80 ? "bg-[#1B6C43]" : "bg-neutral-300")}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 max-w-xs mx-auto">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF4D9] text-[#78350F] text-[10px] font-extrabold tracking-wide inline-flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    One Best Thing
                  </span>
                  <h2 className="font-display font-extrabold text-2xl text-[#191C1A] leading-tight">
                    Focus on 1 Single Habit
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                    No complicated checklists. Execute your 1 highest-impact habit each day to build steady health momentum.
                  </p>
                </div>
              </motion.div>
            )}

            {/* SLIDE 4: SHOULD I...? DECISION ADVISOR */}
            {currentSlide === 4 && (
              <motion.div
                key="slide4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 text-center"
              >
                <div className="w-full max-w-[270px] mx-auto bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center font-bold">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-[#191C1A]">Should I Eat Pizza?</span>
                    </div>
                    <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-mono">
                      -9 HP
                    </span>
                  </div>

                  <div className="bg-[#F7F9F6] p-2 rounded-xl border border-neutral-200/60 text-[10px] text-neutral-600 leading-snug">
                    💡 <strong>Same-Day Fix:</strong> Take a 15m digestion walk + drink 500ml water to recover +6 HP.
                  </div>
                </div>

                <div className="space-y-1 max-w-xs mx-auto">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF4D9] text-[#78350F] text-[10px] font-extrabold tracking-wide inline-flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Decision Advisor
                  </span>
                  <h2 className="font-display font-extrabold text-2xl text-[#191C1A] leading-tight">
                    Ask Before You Indulge
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                    See exact HP point impact before cheat meals and get instant same-day recovery plans.
                  </p>
                </div>
              </motion.div>
            )}

            {/* SLIDE 5: PROFILE & STARTING MODE */}
            {currentSlide === 5 && (
              <motion.div
                key="slide5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >
                <div className="text-center">
                  <h2 className="font-display font-extrabold text-2xl text-[#191C1A]">
                    Set Up Profile
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    Stored 100% privately on your device.
                  </p>
                </div>

                {/* Name, Weight & Height Inputs */}
                <div className="space-y-2 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-500 block text-left mb-0.5">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl bg-[#F7F9F6] border border-neutral-200 focus:border-[#1B6C43] text-xs font-bold text-[#191C1A] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-neutral-500 block text-left mb-0.5">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        min={35}
                        max={250}
                        value={weightKg}
                        onChange={(e) => setWeightKg(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-xl bg-[#F7F9F6] border border-neutral-200 text-xs font-bold text-center text-[#191C1A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-neutral-500 block text-left mb-0.5">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={240}
                        value={heightCm}
                        onChange={(e) => setHeightCm(Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-xl bg-[#F7F9F6] border border-neutral-200 text-xs font-bold text-center text-[#191C1A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2 Starting Experience Options (7-Day Demo & Clean Start) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block text-left px-0.5">
                    Select Starting Experience
                  </span>

                  <div className="space-y-1.5">
                    {/* Option 1: 7-Day Demo History (Default) */}
                    <div
                      onClick={() => setSelectedLaunchType("demo_history")}
                      className={cn(
                        "p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2.5",
                        selectedLaunchType === "demo_history"
                          ? "bg-[#FFF4D9] border-[#D97706] ring-2 ring-[#D97706]/40 shadow-xs"
                          : "bg-white border-neutral-200/80 hover:bg-neutral-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#78350F]">7-Day Rich Demo Profile</h4>
                          <p className="text-[10px] text-amber-800/80 font-medium">Preloaded with living garden, streak &amp; logs</p>
                        </div>
                      </div>
                      {selectedLaunchType === "demo_history" && (
                        <div className="w-5 h-5 rounded-full bg-[#D97706] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Option 2: Clean Start */}
                    <div
                      onClick={() => setSelectedLaunchType("clean_start")}
                      className={cn(
                        "p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2.5",
                        selectedLaunchType === "clean_start"
                          ? "bg-[#D8EDDE] border-[#1B6C43] ring-2 ring-[#1B6C43]/40 shadow-xs"
                          : "bg-white border-neutral-200/80 hover:bg-neutral-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#B9DEC3] text-[#0A3D22] flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#0A3D22]">Clean Start (Fresh Slate)</h4>
                          <p className="text-[10px] text-emerald-800/80 font-medium">Starts with 0 logs — enter day 1 health data</p>
                        </div>
                      </div>
                      {selectedLaunchType === "clean_start" && (
                        <div className="w-5 h-5 rounded-full bg-[#1B6C43] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Launch Action */}
                <div className="pt-1">
                  <button
                    onClick={handleLaunch}
                    className="w-full h-11 rounded-2xl bg-[#1B6C43] text-white text-xs font-black shadow-md hover:bg-[#155735] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Launch WeAreFit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-1 space-y-1 shrink-0">
          {currentSlide < 5 && (
            <div className="flex items-center gap-2.5">
              {currentSlide > 1 && (
                <M3Button
                  variant="outlined"
                  size="md"
                  onClick={() => setCurrentSlide((prev) => (prev - 1) as any)}
                  className="w-1/3 h-11"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </M3Button>
              )}

              <M3Button
                variant="filled"
                size="md"
                onClick={() => setCurrentSlide((prev) => (prev + 1) as any)}
                className={cn("h-11 shadow-md flex items-center justify-center gap-2", currentSlide === 1 ? "w-full" : "flex-1")}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>{currentSlide === 4 ? "Set Up Profile" : "Next"}</span>
              </M3Button>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer py-0.5"
            >
              <ShieldAlert className="w-3 h-3 text-neutral-400" />
              <span>Health Disclaimer & Terms</span>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Disclaimer Modal Sheet */}
        <DisclaimerModal
          isOpen={isDisclaimerOpen}
          onClose={() => setIsDisclaimerOpen(false)}
        />
      </div>
    </div>
  );
}
