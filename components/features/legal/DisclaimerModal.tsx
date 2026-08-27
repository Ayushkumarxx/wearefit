"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, HeartHandshake, FileText } from "lucide-react";
import { M3Button } from "@/components/ui/M3Button";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-[#191C1A] select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FFE8E6] text-[#BA1A1A] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base leading-tight">
                    Health & Legal Notice
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-medium">
                    Please read carefully
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 text-xs text-neutral-600 leading-relaxed max-h-60 overflow-y-auto pr-1">
              <div className="p-3 bg-[#F7F9F6] rounded-2xl border border-neutral-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#191C1A]">
                  <HeartHandshake className="w-4 h-4 text-[#1B6C43]" />
                  <span>Not Medical Advice</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  wearefit is a personal wellness, behavioral habit, and lifestyle tracking companion. It does not provide medical diagnoses, treatment, or clinical prescriptions.
                </p>
              </div>

              <div className="p-3 bg-[#F7F9F6] rounded-2xl border border-neutral-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#191C1A]">
                  <FileText className="w-4 h-4 text-[#1B6C43]" />
                  <span>100% On-Device Privacy</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  All your health logs, statements, profile data, and notes are stored strictly locally in your browser storage. No data is sold or transmitted to third parties.
                </p>
              </div>
            </div>

            {/* Close Button */}
            <M3Button
              size="md"
              variant="filled"
              onClick={onClose}
              className="w-full shadow-xs"
            >
              I Understand & Agree
            </M3Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
