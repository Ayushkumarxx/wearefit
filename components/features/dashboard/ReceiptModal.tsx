"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy } from "lucide-react";
import { DailyReceiptCard } from "@/components/features/dashboard/DailyReceiptCard";
import { useHealthStore } from "@/context/useHealthStore";

export function ReceiptModal() {
  const { isReceiptModalOpen, setIsReceiptModalOpen, selectedReceiptDate, getReceiptForDate } = useHealthStore();

  if (!isReceiptModalOpen || !selectedReceiptDate) return null;

  const receipt = getReceiptForDate(selectedReceiptDate);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsReceiptModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Receipt Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-[390px] max-h-[90vh] overflow-y-auto z-10 space-y-3"
        >
          {/* Close Floating Pill */}
          <div className="flex justify-end pr-1">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-neutral-800 hover:bg-white active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <DailyReceiptCard receipt={receipt} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
