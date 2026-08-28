"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, Check, Play, ChevronDown, ChevronUp } from "lucide-react";
import { DailyLog } from "@/types/health";
import { parseVoiceInput, SAMPLE_VOICE_PROMPTS } from "@/lib/ai-voice-parser";
import { calculateHealthScore } from "@/lib/health-calculator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceAILoggerProps {
  currentLog: DailyLog;
  onApplyParsedLog: (updatedFields: Partial<DailyLog>) => void;
}

export function VoiceAILogger({ currentLog, onApplyParsedLog }: VoiceAILoggerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleMicClick = () => {
    toast.info("Voice AI Logger (Preview Concept)", {
      description: "Tap any sample scenario below to expand and apply instant AI parsing.",
    });
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const handleApplyPrompt = (prompt: { title: string; text: string }) => {
    const parsed = parseVoiceInput(prompt.text, currentLog);
    onApplyParsedLog({
      ...parsed.extractedData,
      voiceNoteTranscript: prompt.text,
    });
    const previewLog: DailyLog = {
      ...currentLog,
      ...parsed.extractedData,
      macros: {
        ...currentLog.macros,
        ...(parsed.extractedData.macros || {}),
      },
    };
    const newScore = calculateHealthScore(previewLog).score;
    toast.success("Voice AI Statement Applied! 🌿", {
      description: `Auto-calculated biological statement (${newScore} HP)`,
    });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Concept Header Card */}
      <div className="bg-gradient-to-b from-[#F0F7FA] to-white border border-[#D0E5F0] rounded-3xl p-5 text-center space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#00658F] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Voice Concept Preview
          </span>
          <span className="text-[10px] font-bold text-neutral-500 bg-white px-2.5 py-0.5 rounded-full border border-[#D0E5F0]">
            Preview
          </span>
        </div>

        {/* Mic Center Button */}
        <div className="flex flex-col items-center justify-center py-2">
          <button
            onClick={handleMicClick}
            className="w-14 h-14 rounded-full bg-[#00658F] text-white flex items-center justify-center shadow-md hover:bg-[#005174] active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="w-6 h-6" />
          </button>
          <span className="text-xs text-neutral-700 font-bold mt-2.5">
            Tap a scenario below or speak to test AI parsing
          </span>
        </div>
      </div>

      {/* THREE HOW IT WORKS POINTS WITH GENEROUS SPACING */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block px-1">
          How Voice AI Works
        </span>

        <div className="space-y-3">
          <div className="bg-[#F8FCFF] p-3 rounded-2xl border border-[#D0E5F0] flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#00658F] text-white flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
              1
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-[#001D2B] block">Speak Naturally</span>
              <p className="text-[11px] text-neutral-600 leading-snug">
                State your meals, sleep, steps, and workouts in everyday conversational language.
              </p>
            </div>
          </div>

          <div className="bg-[#F0F8F3] p-3 rounded-2xl border border-[#C2E3CC] flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#1B6C43] text-white flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
              2
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-[#0A3D22] block">Auto Biomarker Extraction</span>
              <p className="text-[11px] text-neutral-600 leading-snug">
                AI extracts calories, protein, hydration, and sleep debt in real-time.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFDF5] p-3 rounded-2xl border border-[#FFE7A3] flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
              3
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-[#78350F] block">Instant HP Calculation</span>
              <p className="text-[11px] text-neutral-600 leading-snug">
                Calculates biological deductions and automatically updates tomorrow&apos;s recovery plan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sample Scenarios with INLINE EXPANSION */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-1">
          Test Sample Scenarios (Tap to Expand)
        </span>

        <div className="space-y-2">
          {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => {
            const isExpanded = expandedIndex === idx;
            const parsed = parseVoiceInput(prompt.text, currentLog);
            const previewLog: DailyLog = {
              ...currentLog,
              ...parsed.extractedData,
              macros: {
                ...currentLog.macros,
                ...(parsed.extractedData.macros || {}),
              },
            };
            const previewScore = calculateHealthScore(previewLog).score;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full text-left p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-black text-[#191C1A] block">
                      {prompt.title}
                    </span>
                    <span className="text-[11px] text-neutral-500 truncate block mt-0.5">
                      &ldquo;{prompt.text}&rdquo;
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Inline Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-neutral-100 p-4 bg-[#FBFDFB] space-y-3"
                    >
                      {/* Transcript */}
                      <div className="bg-white p-3 rounded-xl border border-neutral-200/70 text-xs text-neutral-700 italic">
                        &ldquo;{prompt.text}&rdquo;
                      </div>

                      {/* Extracted Tags */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-neutral-600">Calculated Impact</span>
                          <span className="font-mono text-[#1B6C43] bg-[#D8EDDE] px-2 py-0.5 rounded-md">
                            ~{previewScore} HP
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {parsed.detectedInsights.map((insight, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-[#EAF5EE] text-[#0A3D22] font-bold px-2 py-0.5 rounded-lg border border-[#1B6C43]/20"
                            >
                              ✓ {insight}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Instant Apply Button */}
                      <button
                        type="button"
                        onClick={() => handleApplyPrompt(prompt)}
                        className="w-full py-2.5 rounded-xl bg-[#1B6C43] hover:bg-[#155735] text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply & Auto-Calculate</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
