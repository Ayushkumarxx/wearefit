"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { DailyReceiptCard } from "@/components/features/dashboard/DailyReceiptCard";
import { useHealthStore } from "@/context/useHealthStore";

export function ReceiptModal() {
  const { isReceiptModalOpen, setIsReceiptModalOpen, selectedReceiptDate, getReceiptForDate } = useHealthStore();

  const receipt = selectedReceiptDate ? getReceiptForDate(selectedReceiptDate) : null;

  return (
    <AnimatePresence>
      {isReceiptModalOpen && receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsReceiptModalOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Receipt Container */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[390px] max-h-[90vh] overflow-y-auto z-10 space-y-2 select-none"
          >
            {/* Close Floating Pill */}
            <div className="flex justify-end pr-1">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-700 hover:bg-neutral-100 active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DailyReceiptCard receipt={receipt} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
