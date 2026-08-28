"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, Check, Play, Info } from "lucide-react";
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
  const [selectedPromptText, setSelectedPromptText] = useState("");

  const handleMicClick = () => {
    toast.info("Voice Logging (Concept Preview)", {
      description: "Live audio transcription is a preview concept. Select a sample below to test instant AI parsing.",
    });
  };

  const parsed = parseVoiceInput(selectedPromptText, currentLog);
  const previewLog: DailyLog = {
    ...currentLog,
    ...parsed.extractedData,
    macros: {
      ...currentLog.macros,
      ...(parsed.extractedData.macros || {}),
    },
  };
  const previewScore = calculateHealthScore(previewLog).score;

  const handleApply = () => {
    if (!selectedPromptText.trim()) {
      toast.error("Tap any sample idea below first.");
      return;
    }
    onApplyParsedLog({
      ...parsed.extractedData,
      voiceNoteTranscript: selectedPromptText,
    });
    toast.success("AI Voice Log Applied! 🌿", {
      description: `Health Score updated to ~${previewScore} HP`,
    });
  };

  return (
    <div className="space-y-3 select-none">
      {/* Minimal Mic & Concept Card */}
      <div className="bg-gradient-to-b from-[#F0F7FA] to-white border border-[#D0E5F0] rounded-2xl p-4 text-center space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#00658F] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Voice Concept
          </span>
          <span className="text-[9px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
            Preview
          </span>
        </div>

        {/* Minimal Mic Center Button */}
        <div className="flex flex-col items-center justify-center py-1">
          <button
            onClick={handleMicClick}
            className="w-13 h-13 rounded-full bg-[#00658F] text-white flex items-center justify-center shadow-sm hover:bg-[#005174] active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="w-5 h-5" />
          </button>
          <span className="text-[11px] text-neutral-600 font-medium mt-2">
            Speak your day or tap a sample below
          </span>
        </div>
      </div>

      {/* Minimal Quick Sample Ideas */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
          Sample Ideas
        </span>

        <div className="grid grid-cols-1 gap-1.5">
          {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => {
            const isSelected = selectedPromptText === prompt.text;

            return (
              <button
                key={idx}
                onClick={() => setSelectedPromptText(prompt.text)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2",
                  isSelected
                    ? "bg-[#D8EDDE] border-[#1B6C43] text-[#0A3D22] font-bold shadow-2xs"
                    : "bg-white border-neutral-200/80 text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <div className="truncate pr-1">
                  <span className="text-[11px] block font-bold text-[#191C1A]">
                    {prompt.title}
                  </span>
                  <span className="text-[10px] text-neutral-500 truncate block">
                    {prompt.text}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                    isSelected ? "bg-[#1B6C43] text-white" : "bg-neutral-100 text-neutral-400"
                  )}
                >
                  <Play className="w-2.5 h-2.5 ml-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimal Extracted Preview & Apply */}
      <AnimatePresence>
        {parsed.detectedInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-2xl bg-[#EAF5EE] border border-[#B9DEC3] space-y-2.5"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-[#0A3D22]">
              <span>Extracted Metrics</span>
              <span className="font-mono">~{previewScore} HP</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {parsed.detectedInsights.map((insight, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-white/90 text-[#0A3D22] font-semibold px-2 py-0.5 rounded-lg border border-[#B9DEC3]/60"
                >
                  ✓ {insight}
                </span>
              ))}
            </div>

            <button
              onClick={handleApply}
              className="w-full h-9 rounded-xl bg-[#1B6C43] hover:bg-[#155735] text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Log to Today</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
