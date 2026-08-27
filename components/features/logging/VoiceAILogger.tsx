"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, Check, Play, Info } from "lucide-react";
import { M3Button } from "@/components/ui/M3Button";
import { DailyLog } from "@/types/health";
import { parseVoiceInput, SAMPLE_VOICE_PROMPTS } from "@/lib/ai-voice-parser";
import { calculateHealthScore } from "@/lib/health-calculator";
import { toast } from "sonner";

interface VoiceAILoggerProps {
  currentLog: DailyLog;
  onApplyParsedLog: (updatedFields: Partial<DailyLog>) => void;
}

export function VoiceAILogger({ currentLog, onApplyParsedLog }: VoiceAILoggerProps) {
  const [selectedPromptText, setSelectedPromptText] = useState("");

  const handleMicClick = () => {
    toast.info("Voice Recognition is in MVP Preview", {
      description: "Live browser microphone recording is a preview concept. Tap any of the quick sample voice logs below to test instant AI parsing!",
      icon: "🎙️",
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
      toast.error("Please tap a sample prompt below to test AI extraction.");
      return;
    }
    onApplyParsedLog({
      ...parsed.extractedData,
      voiceNoteTranscript: selectedPromptText,
    });
    toast.success("AI Voice Log Applied! 🌿", {
      description: `Updated Health Score: ${previewScore}/100 HP`,
    });
  };

  return (
    <div className="space-y-3.5 select-none">
      {/* MVP Concept Banner */}
      <div className="flex items-center justify-between bg-neutral-100 border border-neutral-200/80 px-3.5 py-1.5 rounded-full text-[11px] text-neutral-600 font-medium">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#00658F]" />
          <span>One-Voice AI Assistant (Concept Preview)</span>
        </div>
        <span className="text-[10px] font-bold uppercase text-[#00658F] bg-[#C2E8FC] px-2 py-0.5 rounded-full">
          Preview
        </span>
      </div>

      {/* Voice Visualizer Card */}
      <div className="bg-[#EBF3FC] border border-[#C2E8FC] rounded-3xl p-4 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00658F]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00658F]">
            Natural Voice Logger
          </span>
        </div>

        <p className="text-xs text-[#244B5C] max-w-xs mx-auto mb-3">
          Speak your day naturally — AI automatically detects sleep, steps, calories, and meals.
        </p>

        {/* Central Mic Button */}
        <div className="flex items-center justify-center my-2">
          <button
            onClick={handleMicClick}
            className="w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md transition-all duration-200 cursor-pointer active:scale-95 bg-[#00658F] text-white hover:bg-[#005174]"
          >
            <Mic className="w-6 h-6" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#C2E8FC] mt-0.5">
              Preview
            </span>
          </button>
        </div>

        <span className="text-[10px] font-bold text-neutral-500">
          Tap mic for details or test with a sample below
        </span>
      </div>

      {/* Clean Interactive Sample Voice Logs */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Tap Sample Log to Test Extraction
        </span>

        <div className="space-y-1.5">
          {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => {
            const isSelected = selectedPromptText === prompt.text;

            return (
              <button
                key={idx}
                onClick={() => setSelectedPromptText(prompt.text)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group text-xs cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#D8EDDE] border-[#1B6C43] shadow-xs"
                    : "bg-white border-neutral-200/80 hover:bg-neutral-50"
                }`}
              >
                <div className="pr-2 truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#191C1A]">{prompt.title}</span>
                  </div>
                  <p className="text-neutral-500 text-[11px] truncate mt-0.5">{prompt.text}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-[#1B6C43] group-hover:text-white transition-colors">
                  <Play className="w-3 h-3 text-[#1B6C43] group-hover:text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Extraction Live Preview Card */}
      <AnimatePresence>
        {parsed.detectedInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="p-4 rounded-2xl bg-[#D8EDDE] border border-[#B9DEC3] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0A3D22] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Extracted Health Metrics
              </span>
              <span className="text-xs font-mono font-bold text-[#0A3D22] px-2 py-0.5 rounded-full bg-white/80">
                Score: {previewScore} HP
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-[#1A452D]">
              {parsed.detectedInsights.map((insight, i) => (
                <div key={i} className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-lg">
                  <span>✓</span>
                  <span className="truncate">{insight}</span>
                </div>
              ))}
            </div>

            <M3Button
              size="md"
              onClick={handleApply}
              className="w-full bg-[#1B6C43] text-white shadow-sm"
              icon={<Check className="w-4 h-4" />}
            >
              Apply Extracted Log
            </M3Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
