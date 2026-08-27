"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertCircle, Heart, Lock, Check } from "lucide-react";
import { M3Button } from "@/components/ui/M3Button";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Sheet Content */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="relative w-full sm:max-w-[430px] max-h-[85vh] bg-[#F7F9F6] rounded-t-[36px] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden z-10 border border-neutral-200"
        >
          {/* Header */}
          <div className="p-5 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D8EDDE] text-[#0A3D22] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-[#191C1A]">
                  Disclaimer & Terms
                </h3>
                <p className="text-[11px] text-neutral-500 font-medium">
                  Important health & privacy notice
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-neutral-700">
            {/* Health Disclaimer Notice */}
            <div className="p-4 rounded-2xl bg-[#FFE8E6] border border-[#FFDAD6] text-[#690005] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#90000A]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Not Medical or Clinical Advice</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                <strong>wearefit</strong> is purely a motivational, habit-tracking, and lifestyle game designed to help build daily momentum. The Health Points (HP), receipts, and suggestions do <strong>not</strong> constitute medical advice, medical diagnoses, physiological treatments, or nutritional prescriptions.
              </p>
            </div>

            {/* Core Guidelines */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-neutral-200/80">
              <h4 className="font-bold text-xs text-[#191C1A] uppercase tracking-wider text-neutral-400">
                How to use wearefit safely
              </h4>

              <div className="flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-[#1B6C43] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#191C1A]">Consult Health Professionals</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Always consult your physician, registered dietitian, or certified medical specialist before making significant changes to your diet, fasting regimen, or exercise routine.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#1B6C43] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#191C1A]">100% Local Privacy</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Your personal logs, height, weight, and voice notes are stored strictly on your local browser storage. We do not transmit or sell your personal biometric data.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms of Use */}
            <div className="p-4 bg-neutral-100 rounded-2xl space-y-1 text-[11px] text-neutral-500">
              <p className="font-bold text-neutral-700">Terms of Use Summary</p>
              <p>
                By using wearefit, you agree that you participate in all physical activities, walking targets, and nutrition choices at your own discretion and voluntary risk.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-white border-t border-neutral-200 shrink-0">
            <M3Button
              size="md"
              onClick={onClose}
              className="w-full shadow-xs"
              icon={<Check className="w-4 h-4" />}
            >
              I Understand & Agree
            </M3Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
