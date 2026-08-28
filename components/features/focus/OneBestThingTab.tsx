"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Calendar, Check, RefreshCw } from "lucide-react";
import { useHealthStore, getTodayString } from "@/context/useHealthStore";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Comprehensive Pool of 50+ High-Impact Biological Focus Habits
const MASTER_HABIT_POOL: Array<{
  id: string;
  emoji: string;
  category: "Circadian" | "Nutrition" | "Recovery" | "Physical" | "Mindset" | "Hydration";
  title: string;
  subtitle: string;
}> = [
  // 1. Circadian & Light
  { id: "h1", emoji: "☀️", category: "Circadian", title: "20-Min Morning Sunlight Walk", subtitle: "Set circadian clocks & boost daytime cortisol within 60 mins of waking." },
  { id: "h2", emoji: "🌅", category: "Circadian", title: "Sunset Sky Gazing", subtitle: "Expose eyes to low-angle evening photons to signal natural melatonin release." },
  { id: "h3", emoji: "🕶️", category: "Circadian", title: "Zero Blue Light 45m Pre-Bed", subtitle: "Eliminate overhead LED & screen photons to protect slow-wave deep sleep." },
  { id: "h4", emoji: "🌡️", category: "Circadian", title: "Cool Bedroom Reset (19°C)", subtitle: "Drop room ambient temperature to facilitate core thermal drop for deep sleep." },
  { id: "h5", emoji: "☕", category: "Circadian", title: "90-Min Caffeine Delay Post-Wake", subtitle: "Let natural adenosine clearance finish before consuming morning stimulants." },
  { id: "h6", emoji: "🚫", category: "Circadian", title: "Zero Caffeine After 2 PM", subtitle: "Ensure 8-hour half-life clears completely prior to sleep architecture onset." },
  { id: "h7", emoji: "🕯️", category: "Circadian", title: "Warm Amber Lighting After Dark", subtitle: "Shift household lighting to dim floor lamps with red or amber spectrum." },

  // 2. Nutrition & Metabolic
  { id: "h8", emoji: "🥗", category: "Nutrition", title: "100% Single-Ingredient Foods", subtitle: "Eliminate ultra-processed foods, refined seed oils, and added sugars." },
  { id: "h9", emoji: "🥩", category: "Nutrition", title: "35g Clean Protein Morning Anchor", subtitle: "Hit leucine threshold on first meal to stabilize ghrelin and fuel muscle repair." },
  { id: "h10", emoji: "🥦", category: "Nutrition", title: "Eat 3 Servings of Dark Greens", subtitle: "Flood cellular pathways with magnesium, folates, and micronutrients." },
  { id: "h11", emoji: "🫐", category: "Nutrition", title: "Polyphenol Berry Snack", subtitle: "Protect vascular endothelium and mitochondrial density with anthocyanins." },
  { id: "h12", emoji: "🥑", category: "Nutrition", title: "Healthy Monounsaturated Fats", subtitle: "Opt for extra virgin olive oil, avocado, and raw nuts over seed oils." },
  { id: "h13", emoji: "🥣", category: "Nutrition", title: "Prebiotic Fiber Gut Reset", subtitle: "Feed diverse microbiota with legumes, chicory, cooked and cooled oats." },
  { id: "h14", emoji: "🛑", category: "Nutrition", title: "3-Hour Pre-Bed Food Fast", subtitle: "Finish dinner 3 hours prior to sleep so insulin drops and digestion rests." },
  { id: "h15", emoji: "🚫", category: "Nutrition", title: "Zero Liquid Calorie Day", subtitle: "Drink exclusively water, sparkling water, herbal tea, or black coffee." },
  { id: "h16", emoji: "🧂", category: "Nutrition", title: "Cook All Meals from Scratch", subtitle: "Control sodium, seed oils, and unmeasured sauces by eating at home." },

  // 3. Hydration & Electrolytes
  { id: "h17", emoji: "💧", category: "Hydration", title: "Drink 3L Water", subtitle: "Stay well-hydrated with clean mineral water throughout the day." },
  { id: "h18", emoji: "🧂", category: "Hydration", title: "Morning Salt Water", subtitle: "Start with 500ml water and a pinch of unrefined trace mineral salt." },
  { id: "h19", emoji: "🍋", category: "Hydration", title: "Lemon Electrolyte Water", subtitle: "Support cellular hydration and natural electrolyte balance." },
  { id: "h20", emoji: "🍵", category: "Hydration", title: "Green Tea Boost", subtitle: "Sip loose-leaf green tea for natural antioxidant hydration." },
  { id: "h21", emoji: "💧", category: "Hydration", title: "Hydrate Before Meals", subtitle: "Drink a glass of water 20 mins prior to eating for better digestion." },

  // 4. Physical Movement & Training
  { id: "h22", emoji: "👟", category: "Physical", title: "Hit 10,000 Intentional Steps", subtitle: "Accumulate non-exercise activity thermogenesis and capillary blood flow." },
  { id: "h23", emoji: "🏋️", category: "Physical", title: "30-Min Focused Training", subtitle: "Stimulate muscular density, bone mineralization, and neuromuscular drive." },
  { id: "h24", emoji: "🚶", category: "Physical", title: "10-Min Post-Meal Digestion Walk", subtitle: "Blunt postprandial glucose spike by 40% with immediate gentle movement." },
  { id: "h25", emoji: "🚴", category: "Physical", title: "40-Min Zone-2 Aerobic Session", subtitle: "Expand mitochondrial efficiency and lactate clearance threshold." },
  { id: "h26", emoji: "🧘", category: "Physical", title: "20-Min Deep Mobility", subtitle: "Decompress spinal discs and release posterior chain tension." },
  { id: "h27", emoji: "🪜", category: "Physical", title: "Take Stairs Exclusively", subtitle: "Inject intermittent micro-bursts of functional leg power." },
  { id: "h28", emoji: "🤸", category: "Physical", title: "5-Min Morning Facia Stretch", subtitle: "Wake up fascia and synovial fluid immediately upon rising." },

  // 5. Recovery & Nervous System
  { id: "h29", emoji: "🌙", category: "Recovery", title: "Prioritize 8.5h In-Bed Window", subtitle: "Provide full complete sleep cycles for mental & physical repair." },
  { id: "h30", emoji: "🫁", category: "Recovery", title: "10-Min Physiological Breathing", subtitle: "Engage vagal parasympathetic tone to rapidly lower resting heart rate." },
  { id: "h31", emoji: "🧖", category: "Recovery", title: "20-Min Contrast Shower / Sauna", subtitle: "Upregulate heat shock proteins and stimulate peripheral circulation." },
  { id: "h32", emoji: "🛁", category: "Recovery", title: "Warm Magnesium Epsom Bath", subtitle: "Relax tense motor units and prime blood vessels for peripheral vasodilation." },
  { id: "h33", emoji: "📵", category: "Recovery", title: "60-Min Digital Dopamine Detox", subtitle: "Step away from all feeds, notifications, and screens for deep mental calm." },
  { id: "h34", emoji: "📖", category: "Recovery", title: "Read Physical Book Pre-Bed", subtitle: "Quiet cognitive rumination and induce natural drowsy brainwave rhythms." },

  // 6. Mindset & Longevity Habits
  { id: "h35", emoji: "✍️", category: "Mindset", title: "Write 3 Specific Gratitudes", subtitle: "Shift cognitive bias toward psychological resilience and lower cortisol." },
  { id: "h36", emoji: "🌳", category: "Mindset", title: "30-Min Nature Immersion", subtitle: "Breathe in phytoncides and lower sympathetic tone in natural greenery." },
  { id: "h37", emoji: "🧘", category: "Mindset", title: "10-Min Non-Sleep Deep Rest", subtitle: "Restore striatal dopamine levels and alleviate midday cognitive fatigue." },
  { id: "h38", emoji: "🤝", category: "Mindset", title: "In-Person Social Connection", subtitle: "Elevate oxytocin and longevity biomarkers with close friends or family." },
];

// Helper: Deterministically pick 3 distinct items for a given date
function getDailyThreeOptions(dateStr: string) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const idx1 = positiveHash % MASTER_HABIT_POOL.length;
  const idx2 = (positiveHash * 7 + 13) % MASTER_HABIT_POOL.length;
  const idx3 = (positiveHash * 19 + 37) % MASTER_HABIT_POOL.length;

  const first = MASTER_HABIT_POOL[idx1];
  const second = MASTER_HABIT_POOL[idx2 === idx1 ? (idx2 + 1) % MASTER_HABIT_POOL.length : idx2];
  const third = MASTER_HABIT_POOL[
    idx3 === idx1 || idx3 === idx2 ? (idx3 + 2) % MASTER_HABIT_POOL.length : idx3
  ];

  return [first, second, third];
}

export function OneBestThingTab() {
  const { focusCompletedByDate, toggleFocusCompleted, dailyLogs } = useHealthStore();
  const todayStr = getTodayString();
  const isCompletedToday = !!focusCompletedByDate[todayStr];

  // Stable 3 options for today
  const dailyOptions = useMemo(() => getDailyThreeOptions(todayStr), [todayStr]);

  // Index 0, 1, 2 (1/3, 2/3, 3/3)
  const [optionIndex, setOptionIndex] = useState<number>(0);

  const activeFocus = dailyOptions[optionIndex];

  const handleCycleNext = () => {
    setOptionIndex((prev) => (prev + 1) % dailyOptions.length);
    toast.info(`Swapped to Option ${((optionIndex + 1) % 3) + 1}/3 🌿`);
  };

  const handleToggle = () => {
    toggleFocusCompleted(todayStr);
    if (!isCompletedToday) {
      toast.success(`Completed "${activeFocus.title}"! 🌿`, {
        description: "Great execution. Weekly habit momentum updated.",
      });
    }
  };

  // 7-day consistency bar chart data
  const last7DaysChart = Array.from({ length: 7 }).map((_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayLabel = format(subDays(new Date(), 6 - i), "EEE");
    const isToday = i === 6;
    const done = !!focusCompletedByDate[d];
    return { date: d, dayLabel, isToday, done };
  });

  // Only display history for dates that exist or have been logged
  const hasAnyLogs = Object.keys(dailyLogs).length > 0 || Object.keys(focusCompletedByDate).length > 0;
  
  const historyDays = Array.from({ length: 7 })
    .map((_, i) => {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      const isToday = i === 0;
      const dayName = i === 0 ? "Today" : i === 1 ? "Yesterday" : format(subDays(new Date(), i), "EEE");
      const formattedDate = format(subDays(new Date(), i), "MMM d");
      const done = !!focusCompletedByDate[d];
      const hasLogForThisDay = Boolean(dailyLogs[d]);
      const dayOptions = getDailyThreeOptions(d);
      const dayHabit = dayOptions[0];

      return {
        date: d,
        isToday,
        dayName,
        formattedDate,
        done,
        hasLogForThisDay,
        habitEmoji: dayHabit.emoji,
        habitName: dayHabit.title,
      };
    })
    .filter((item) => item.isToday || item.hasLogForThisDay || item.done);

  const totalCompletedInWeek = last7DaysChart.filter((d) => d.done).length;

  return (
    <div className="p-5 space-y-3.5 select-none">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="font-display font-black text-xl text-[#191C1A]">
          One Best Thing
        </h1>
        <p className="text-xs text-neutral-500">
          Your single highest-leverage biological habit for today.
        </p>
      </div>

      {/* COMPACT HERO FOCUS CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFocus.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16 }}
          className={cn(
            "relative bg-white rounded-3xl p-4.5 border shadow-xs text-center space-y-3 transition-all",
            isCompletedToday
              ? "border-[#1B6C43]/40 bg-gradient-to-b from-[#F0F7F2] to-white"
              : "border-neutral-200/80"
          )}
        >
          {/* Top Bar: Refresh Cycle Button on Right */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-400">
              Daily Focus
            </span>

            {!isCompletedToday && (
              <button
                onClick={handleCycleNext}
                className="text-neutral-500 hover:text-neutral-900 px-1.5 py-0.5 text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Cycle through 3 curated daily options"
              >
                <RefreshCw className="w-3 h-3 text-[#1B6C43]" />
                <span>{optionIndex + 1}/3</span>
              </button>
            )}
          </div>

          {/* Center Emoji */}
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-3xl shadow-inner border border-neutral-200 mx-auto">
            {activeFocus.emoji}
          </div>

          {/* Heading & Subheading */}
          <div className="space-y-0.5">
            <h2 className="font-display font-black text-lg text-[#191C1A]">
              {activeFocus.title}
            </h2>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
              {activeFocus.subtitle}
            </p>
          </div>

          {/* Action Button: Marked (Locked) or Mark as Completed */}
          <button
            onClick={!isCompletedToday ? handleToggle : undefined}
            disabled={isCompletedToday}
            className={cn(
              "w-full h-11 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all",
              isCompletedToday
                ? "bg-[#D8EDDE] text-[#0A3D22] border border-[#1B6C43]/30 cursor-default"
                : "bg-[#1B6C43] text-white hover:bg-[#155735] active:scale-[0.98] cursor-pointer"
            )}
          >
            {isCompletedToday ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#1B6C43]" />
                <span>Marked Complete for Today!</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Mark as Completed</span>
              </>
            )}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* WEEKLY CONSISTENCY 7-DAY BAR CHART */}
      <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center font-bold">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xs text-[#191C1A]">Weekly Consistency</h3>
              <p className="text-[10px] text-neutral-500 font-semibold">{totalCompletedInWeek} of 7 days executed</p>
            </div>
          </div>
        </div>

        {/* 7-Day Bars */}
        <div className="grid grid-cols-7 gap-1.5 pt-0.5">
          {last7DaysChart.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-full h-10 rounded-xl flex items-center justify-center transition-all",
                  d.done
                    ? "bg-[#1B6C43] text-white shadow-2xs"
                    : d.isToday
                    ? "bg-neutral-100 border-2 border-dashed border-neutral-300 text-neutral-300"
                    : "bg-neutral-100 text-neutral-300"
                )}
              >
                {d.done ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
              </div>
              <span
                className={cn(
                  "text-[9px] font-extrabold uppercase",
                  d.isToday ? "text-[#1B6C43] font-black" : "text-neutral-500"
                )}
              >
                {d.dayLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT HABIT EXECUTION LOG */}
      {hasAnyLogs && historyDays.length > 0 && (
        <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <h3 className="font-display font-black text-xs text-[#191C1A]">Execution History</h3>
          </div>

          <div className="divide-y divide-neutral-100">
            {historyDays.map((item) => (
              <div key={item.date} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{item.habitEmoji}</span>
                  <div>
                    <span className="text-xs font-bold text-[#191C1A] block">{item.habitName}</span>
                    <span className="text-[9px] text-neutral-400 font-semibold">{item.dayName}, {item.formattedDate}</span>
                  </div>
                </div>

                <span
                  className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-full",
                    item.done
                      ? "bg-[#D8EDDE] text-[#0A3D22]"
                      : item.isToday
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-neutral-100 text-neutral-400"
                  )}
                >
                  {item.done ? "Completed" : item.isToday ? "Pending" : "Skipped"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
