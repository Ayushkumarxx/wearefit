"use client";

import React from "react";
import { Copy } from "lucide-react";
import { HealthReceipt } from "@/types/health";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DailyReceiptCardProps {
  receipt: HealthReceipt;
  showActions?: boolean;
  className?: string;
}

export function DailyReceiptCard({ receipt, showActions = true, className }: DailyReceiptCardProps) {
  const handleCopySummary = async () => {
    const summary = `🧾 WEAREFIT • RX Statement\nDate: ${receipt.date} | ID: ${receipt.receiptId}\nFinal Score: ${receipt.totalScore} HP [Grade ${receipt.grade}]\n\nSummary:\n${receipt.items.map((it) => `• ${it.label}: ${it.pointsDelta > 0 ? `+${it.pointsDelta}` : it.pointsDelta} HP (${it.detail})`).join("\n")}`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
      toast.success("Receipt copied to clipboard!");
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white rounded-3xl p-5 shadow-xs border border-neutral-200/80 font-mono text-[#191C1A] space-y-3.5 select-none overflow-hidden",
        className
      )}
    >
      {/* Brand Header */}
      <div className="text-center pb-3 border-b border-dashed border-neutral-300 space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-display font-black text-lg tracking-wider text-[#191C1A]">
          <div className="w-5 h-5 rounded-lg bg-[#1B6C43] text-white flex items-center justify-center text-xs font-black">
            w
          </div>
          <span>WEAREFIT</span>
          <span className="text-[#1B6C43] bg-[#D8EDDE] px-1.5 py-0.2 rounded-md text-xs font-black">RX</span>
        </div>

        <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono pt-1">
          <span>{receipt.receiptId}</span>
          <span>{receipt.date}</span>
        </div>
      </div>

      {/* Starting Base Score */}
      <div className="flex justify-between items-center text-xs font-semibold font-sans pb-2 border-b border-neutral-100">
        <span className="text-neutral-500">Base Daily Deposit</span>
        <span className="font-bold text-[#1B6C43]">+{receipt.startingBaseScore} HP</span>
      </div>

      {/* Itemized Transactions */}
      <div className="space-y-2 font-sans py-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Point Transactions
        </div>

        {receipt.items.length === 0 ? (
          <p className="text-xs text-neutral-400 italic py-1">No metrics logged for this day yet.</p>
        ) : (
          receipt.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start text-xs leading-tight">
              <div>
                <p className="font-bold text-[#191C1A]">{item.label}</p>
                <p className="text-[11px] text-neutral-500">{item.detail}</p>
              </div>

              <span
                className={cn(
                  "font-mono font-bold shrink-0 ml-2",
                  item.pointsDelta > 0 ? "text-[#1B6C43]" : "text-[#BA1A1A]"
                )}
              >
                {item.pointsDelta > 0 ? `+${item.pointsDelta}` : item.pointsDelta} HP
              </span>
            </div>
          ))
        )}
      </div>

      {/* Total Score & Grade Footer */}
      <div className="pt-3 border-t-2 border-dashed border-neutral-300 space-y-2">
        <div className="flex justify-between items-center font-sans">
          <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">Final Health Score</span>
          <div className="text-right">
            <span className="font-display font-black text-2xl text-[#191C1A]">
              {receipt.totalScore}
            </span>
            <span className="text-xs font-bold text-neutral-400"> / 100 HP</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-[#F7F9F6] p-2.5 rounded-2xl text-xs font-sans border border-neutral-200/60">
          <span className="text-neutral-600 font-medium">Daily Status:</span>
          <span className="font-extrabold text-[#1B6C43]">
            Grade {receipt.grade} • {receipt.gradeLabel}
          </span>
        </div>
      </div>

      {/* Authentic Barcode Ticket Footer */}
      <div className="pt-2 flex flex-col items-center justify-center border-t border-dashed border-neutral-200">
        <svg className="w-48 h-8 opacity-75" viewBox="0 0 190 32">
          {/* Authentic barcode lines pattern */}
          <rect x="0" y="0" width="3" height="32" fill="#191C1A" />
          <rect x="5" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="10" y="0" width="4" height="32" fill="#191C1A" />
          <rect x="16" y="0" width="1" height="32" fill="#191C1A" />
          <rect x="20" y="0" width="5" height="32" fill="#191C1A" />
          <rect x="28" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="33" y="0" width="3" height="32" fill="#191C1A" />
          <rect x="38" y="0" width="6" height="32" fill="#191C1A" />
          <rect x="47" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="52" y="0" width="4" height="32" fill="#191C1A" />
          <rect x="59" y="0" width="1" height="32" fill="#191C1A" />
          <rect x="63" y="0" width="5" height="32" fill="#191C1A" />
          <rect x="71" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="76" y="0" width="4" height="32" fill="#191C1A" />
          <rect x="83" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="88" y="0" width="5" height="32" fill="#191C1A" />
          <rect x="96" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="101" y="0" width="4" height="32" fill="#191C1A" />
          <rect x="108" y="0" width="1" height="32" fill="#191C1A" />
          <rect x="112" y="0" width="6" height="32" fill="#191C1A" />
          <rect x="121" y="0" width="3" height="32" fill="#191C1A" />
          <rect x="127" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="132" y="0" width="5" height="32" fill="#191C1A" />
          <rect x="140" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="145" y="0" width="4" height="32" fill="#191C1A" />
          <rect x="152" y="0" width="1" height="32" fill="#191C1A" />
          <rect x="156" y="0" width="6" height="32" fill="#191C1A" />
          <rect x="165" y="0" width="3" height="32" fill="#191C1A" />
          <rect x="171" y="0" width="2" height="32" fill="#191C1A" />
          <rect x="176" y="0" width="4" height="32" fill="#191C1A" />
          <rect x="183" y="0" width="3" height="32" fill="#191C1A" />
        </svg>
        <span className="text-[9px] font-mono tracking-widest text-neutral-400 mt-1">
          {receipt.receiptId} • VERIFIED SLIP
        </span>
      </div>

      {/* Copy Actions */}
      {showActions && (
        <button
          onClick={handleCopySummary}
          className="w-full py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#191C1A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-neutral-600" />
          <span>Copy Summary Receipt</span>
        </button>
      )}
    </div>
  );
}
