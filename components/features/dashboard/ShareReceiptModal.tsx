"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Sparkles } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { calculateConsecutiveStreak } from "@/lib/streak-calculator";
import { toast } from "sonner";

export function ShareReceiptModal() {
  const { isShareModalOpen, setIsShareModalOpen, shareReceiptDate, getReceiptForDate, getLogForDate, selectedDate, dailyLogs } = useHealthStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const targetDate = shareReceiptDate || selectedDate;
  const receipt = getReceiptForDate(targetDate);
  const log = getLogForDate(targetDate);
  const streakCount = calculateConsecutiveStreak(dailyLogs);

  // Generate crisp Bento Grid + Circular Gauge + Transactions Slip
  useEffect(() => {
    if (!isShareModalOpen) {
      setDataUrl(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1680;
    canvas.width = width;
    canvas.height = height;

    // 1. Studio Backdrop (Soft Minimal Stage)
    ctx.fillStyle = "#EAEFEA";
    ctx.fillRect(0, 0, width, height);

    // 2. White Paper Slip Card Box
    const cardX = 75;
    const cardY = 60;
    const cardW = 930;
    const cardH = 1560;
    const radius = 44;

    // Card Drop Shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.10)";
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 16;

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#D8E2D8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Header: "WEAREFIT"
    const headerY = cardY + 55;

    // Brand icon
    ctx.fillStyle = "#1B6C43";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, headerY, 46, 46, 14);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("w", width / 2 - 107, headerY + 33);

    // Brand name (Bold Display)
    ctx.fillStyle = "#191C1A";
    ctx.font = "900 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("WEAREFIT", width / 2 - 70, headerY + 35);

    // Receipt ID & Date Subtitle
    ctx.fillStyle = "#6B7280";
    ctx.font = "700 21px monospace";
    ctx.textAlign = "left";
    ctx.fillText(receipt.receiptId, cardX + 50, headerY + 84);

    ctx.textAlign = "right";
    ctx.fillText(receipt.date, cardX + cardW - 50, headerY + 84);

    // Dashed Perforated Divider
    let curY = headerY + 110;
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 35, curY);
    ctx.lineTo(cardX + cardW - 35, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. TOP BENTO GRID SECTION (Symmetrical: 3 Left Cards | Center Dial | 3 Right Cards)
    const bentoTopY = curY + 28;
    const bentoH = 390;
    const colW = 225;
    const centerW = 360;
    const colGap = 15;
    const leftStartX = cardX + 45;
    const centerStartX = leftStartX + colW + colGap;
    const rightStartX = centerStartX + centerW + colGap;
    const miniCardH = 118;
    const miniGap = 18;

    // A. LEFT COLUMN (3 Cards: Streak, Sleep, Calories)
    const leftMetrics = [
      {
        emoji: "🔥",
        title: "Active Streak",
        value: `${streakCount} Days`,
        bg: "#FFF4D9",
        border: "#FFE7A3",
        text: "#78350F",
      },
      {
        emoji: "🌙",
        title: "Rest Recovery",
        value: `${log.sleepHours || 8.0} hrs`,
        bg: "#F3E8FF",
        border: "#E9D5FF",
        text: "#6B21A8",
      },
      {
        emoji: "🥗",
        title: "Fuel Calories",
        value: `${log.calories || 2000} kcal`,
        bg: "#E8F5E9",
        border: "#C8E6C9",
        text: "#1B5E20",
      },
    ];

    leftMetrics.forEach((m, idx) => {
      const mY = bentoTopY + idx * (miniCardH + miniGap);
      ctx.fillStyle = m.bg;
      ctx.beginPath();
      ctx.roundRect(leftStartX, mY, colW, miniCardH, 20);
      ctx.fill();
      ctx.strokeStyle = m.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(m.emoji, leftStartX + 16, mY + 38);

      ctx.fillStyle = "#6B7280";
      ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(m.title, leftStartX + 16, mY + 68);

      ctx.fillStyle = m.text;
      ctx.font = "900 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(m.value, leftStartX + 16, mY + 98);
    });

    // B. CENTER COLUMN (Prominent Circular Health Gauge Dial)
    ctx.fillStyle = "#F7FAF7";
    ctx.beginPath();
    ctx.roundRect(centerStartX, bentoTopY, centerW, bentoH, 32);
    ctx.fill();
    ctx.strokeStyle = "#E2ECE2";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const dialCenterX = centerStartX + centerW / 2;
    const dialCenterY = bentoTopY + 155;
    const dialRadius = 90;

    // Background track
    ctx.beginPath();
    ctx.arc(dialCenterX, dialCenterY, dialRadius, 0, 2 * Math.PI);
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#E5EAE5";
    ctx.stroke();

    // Active progress arc
    const progress = Math.max(0.05, Math.min(1, receipt.totalScore / 100));
    ctx.beginPath();
    ctx.arc(dialCenterX, dialCenterY, dialRadius, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI);
    ctx.lineWidth = 16;
    ctx.strokeStyle = receipt.totalScore >= 80 ? "#1B6C43" : receipt.totalScore >= 60 ? "#D97706" : "#BA1A1A";
    ctx.lineCap = "round";
    ctx.stroke();

    // Center HP Score
    ctx.fillStyle = "#191C1A";
    ctx.font = "900 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${receipt.totalScore}`, dialCenterX - 18, dialCenterY + 16);

    ctx.fillStyle = "#1B6C43";
    ctx.font = "900 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("HP", dialCenterX + 46, dialCenterY + 16);

    // Grade status and Mood badge at bottom of center box
    const gradePillY = dialCenterY + 140;
    ctx.fillStyle = receipt.totalScore >= 80 ? "#D8EDDE" : receipt.totalScore >= 60 ? "#FFF4D9" : "#FFE8E6";
    ctx.beginPath();
    ctx.roundRect(dialCenterX - 155, gradePillY - 22, 310, 44, 22);
    ctx.fill();
    ctx.strokeStyle = receipt.totalScore >= 80 ? "#B9DEC3" : receipt.totalScore >= 60 ? "#FFE7A3" : "#FFC9C6";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const moodEmoji =
      log.mood === "motivated"
        ? "🔥"
        : log.mood === "good"
        ? "😊"
        : log.mood === "fatigued"
        ? "😫"
        : log.mood === "unmotivated"
        ? "😔"
        : "✨";

    ctx.fillStyle = receipt.totalScore >= 80 ? "#0A3D22" : receipt.totalScore >= 60 ? "#78350F" : "#90000A";
    ctx.font = "800 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${moodEmoji} Grade ${receipt.grade} • ${receipt.gradeLabel}`, dialCenterX, gradePillY + 5);

    // C. RIGHT COLUMN (3 Cards: Steps, Water, Workout/Quality)
    const rightMetrics = [
      {
        emoji: "👟",
        title: "Daily Movement",
        value: `${(log.steps || 8500).toLocaleString()}`,
        bg: "#D8EDDE",
        border: "#B9DEC3",
        text: "#0A3D22",
      },
      {
        emoji: "💧",
        title: "Hydration",
        value: `${log.waterLiters || 2.5} L`,
        bg: "#E0F2FE",
        border: "#BAE6FD",
        text: "#0369A1",
      },
      {
        emoji: "🏋️",
        title: "Athletic Training",
        value: `${log.workoutMinutes || 0} mins`,
        bg: "#FEF3C7",
        border: "#FDE68A",
        text: "#92400E",
      },
    ];

    rightMetrics.forEach((m, idx) => {
      const mY = bentoTopY + idx * (miniCardH + miniGap);
      ctx.fillStyle = m.bg;
      ctx.beginPath();
      ctx.roundRect(rightStartX, mY, colW, miniCardH, 20);
      ctx.fill();
      ctx.strokeStyle = m.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(m.emoji, rightStartX + 16, mY + 38);

      ctx.fillStyle = "#6B7280";
      ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(m.title, rightStartX + 16, mY + 68);

      ctx.fillStyle = m.text;
      ctx.font = "900 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(m.value, rightStartX + 16, mY + 98);
    });

    // 5. BASE DEPOSIT ROW
    curY = bentoTopY + bentoH + 35;
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 35, curY);
    ctx.lineTo(cardX + cardW - 35, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    curY += 40;
    ctx.fillStyle = "#6B7280";
    ctx.font = "700 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Base Daily Deposit", cardX + 50, curY);

    ctx.fillStyle = "#1B6C43";
    ctx.font = "800 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`+${receipt.startingBaseScore} HP`, cardX + cardW - 50, curY);

    // 6. SECTION: "POINT TRANSACTIONS"
    curY += 45;
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "800 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("POINT TRANSACTIONS", cardX + 50, curY);

    curY += 36;
    const items = receipt.items.length > 0 ? receipt.items.slice(0, 5) : [
      { id: "1", label: "Clean Whole Nutrition", detail: "Single-ingredient fresh meals logged", pointsDelta: 0 },
      { id: "2", label: "Circadian Sleep Baseline", detail: "Adequate rest duration maintained", pointsDelta: 0 },
      { id: "3", label: "Daily Step Target", detail: "Active movement threshold achieved", pointsDelta: 0 }
    ];

    items.forEach((item) => {
      // Label
      ctx.fillStyle = "#191C1A";
      ctx.font = "700 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item.label, cardX + 50, curY);

      // Delta
      ctx.fillStyle = item.pointsDelta > 0 ? "#1B6C43" : item.pointsDelta < 0 ? "#BA1A1A" : "#6B7280";
      ctx.font = "800 24px monospace";
      ctx.textAlign = "right";
      const deltaText = item.pointsDelta > 0 ? `+${item.pointsDelta} HP` : item.pointsDelta < 0 ? `${item.pointsDelta} HP` : "0 HP";
      ctx.fillText(deltaText, cardX + cardW - 50, curY);

      curY += 28;
      // Detail subtext
      ctx.fillStyle = "#6B7280";
      ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      const truncated = item.detail.length > 52 ? item.detail.slice(0, 52) + "..." : item.detail;
      ctx.fillText(truncated, cardX + 50, curY);

      curY += 38;
    });

    // 7. TOTAL SCORE SUMMARY BOX
    const totalBoxY = cardY + cardH - 220;
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 35, totalBoxY);
    ctx.lineTo(cardX + cardW - 35, totalBoxY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#6B7280";
    ctx.font = "800 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("FINAL HEALTH STATEMENT", cardX + 50, totalBoxY + 42);

    ctx.fillStyle = "#191C1A";
    ctx.font = "900 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${receipt.totalScore} / 100 HP`, cardX + cardW - 50, totalBoxY + 44);

    // 8. EXACT CENTER-ALIGNED BARCODE
    const barcodeY = totalBoxY + 68;
    const bWidths = [4, 6, 2, 8, 3, 10, 5, 2, 6, 8, 3, 4, 10, 4, 2, 8, 5, 3, 6, 2, 8, 4, 7, 3, 9, 4, 2, 6, 8, 3, 5];
    const totalBarcodeWidth = bWidths.reduce((acc, w) => acc + w + 4, 0) - 4;
    const bStartX = Math.round((width - totalBarcodeWidth) / 2);
    const bHeight = 40;

    ctx.fillStyle = "#191C1A";
    let curBarcodeX = bStartX;
    bWidths.forEach((w, idx) => {
      if (idx % 2 === 0) {
        ctx.fillRect(curBarcodeX, barcodeY, w, bHeight);
      }
      curBarcodeX += w + 4;
    });

    ctx.fillStyle = "#9CA3AF";
    ctx.font = "600 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${receipt.receiptId} • VERIFIED BIOLOGICAL STATEMENT`, width / 2, barcodeY + bHeight + 25);

    const generated = canvas.toDataURL("image/png");
    setDataUrl(generated);
  }, [isShareModalOpen, receipt, log, streakCount]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `wearefit-slip-${receipt.date}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Receipt Image Saved! 📸");
  };

  return (
    <AnimatePresence>
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareModalOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm max-h-[92vh] bg-white rounded-3xl p-5 shadow-2xl border border-neutral-200 z-10 flex flex-col justify-between overflow-hidden text-[#191C1A] select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#1B6C43] text-white flex items-center justify-center text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-[#191C1A]">Health Slip Image</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold">Clean Verified Statement</p>
                </div>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden Canvas used for high-res export */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Preview Card */}
            <div className="my-3 flex-1 overflow-y-auto no-scrollbar flex items-center justify-center">
              {dataUrl ? (
                <div className="relative rounded-2xl overflow-hidden shadow-sm border border-neutral-200 max-h-[52vh]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dataUrl}
                    alt="Health Receipt Slip"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-neutral-400">
                  Generating High-Res Slip...
                </div>
              )}
            </div>

            {/* Single Primary Action */}
            <div className="pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-2xl bg-[#1B6C43] hover:bg-[#155735] text-white text-xs font-black shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Save Receipt Image</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
