import { AdviceOption, AdviceResponse, DailyLog, PrescriptionTask, UserProfile } from "@/types/health";

export const CATEGORIZED_ADVICE_QUESTIONS = [
  {
    category: "Cheat Meals & Takeout",
    icon: "🍔",
    questions: [
      "Should I eat a burger tonight?",
      "Can I eat pizza for dinner?",
      "Should I order late-night takeout?",
      "Can I have french fries with lunch?",
      "Should I eat fried chicken tonight?",
      "Can I order Chinese takeout noodles?",
    ],
  },
  {
    category: "Desserts & Sugar",
    icon: "🍦",
    questions: [
      "Can I have ice cream after dinner?",
      "Should I eat a donut for breakfast?",
      "Can I eat dark chocolate right now?",
      "Should I have a slice of cake at the party?",
      "Can I drink a sugary fruit smoothie?",
      "Should I eat cookies before bed?",
    ],
  },
  {
    category: "Coffee & Drinks",
    icon: "☕",
    questions: [
      "Can I have a second espresso this afternoon?",
      "Should I drink an energy drink for focus?",
      "Can I drink a diet soda with lunch?",
      "Should I drink matcha tea instead of coffee?",
      "Can I have a sweet iced caramel latte?",
    ],
  },
  {
    category: "Alcohol & Nightlife",
    icon: "🍺",
    questions: [
      "Can I drink a beer / cocktail tonight?",
      "Can I have 2 glasses of red wine?",
      "Should I skip alcohol completely this weekend?",
      "Can I drink tequila with soda water?",
    ],
  },
  {
    category: "Workouts & Movement",
    icon: "🏋️",
    questions: [
      "Should I do a 40m weight training session?",
      "Should I skip my workout today?",
      "Can I do a 20m morning run?",
      "Should I do sauna or cold plunge today?",
      "Can I do heavy deadlifts on low sleep?",
      "Should I go for a 30m brisk evening walk?",
    ],
  },
  {
    category: "Sleep & Recovery",
    icon: "🌙",
    questions: [
      "Should I stay up late to finish work?",
      "Can I take a 20m afternoon power nap?",
      "Should I do 10m evening meditation?",
      "Should I wake up at 5:30 AM to hit gym?",
      "Can I look at my phone in bed?",
    ],
  },
];

export const PRESET_ADVICE_QUESTIONS: AdviceOption[] = CATEGORIZED_ADVICE_QUESTIONS.flatMap((c) =>
  c.questions.map((q) => ({ question: q, category: c.category as any }))
);

export interface EnhancedAdviceResult extends AdviceResponse {
  impactLevel: "Mild" | "Moderate" | "High";
  impactBadgeColor: string;
  isUnrecognized?: boolean;
  actionTiming: "today" | "tomorrow";
  actionDateLabel: string;
  suggestedCompensation?: PrescriptionTask;
}

export function evaluateShouldIQuestion(
  question: string,
  currentScore: number,
  todayLog: DailyLog,
  profile?: UserProfile | null,
  past7DaysAvgScore: number = 75
): EnhancedAdviceResult {
  const q = question.toLowerCase().trim();
  const sleepHours = todayLog.sleepHours || 7.5;

  let verdict: AdviceResponse["verdict"] = "GO_AHEAD_WITH_MODERATION";
  let headline = "";
  let reasoning = "";
  let compensationTip = "";
  let baseImpact = -6;
  let impactLevel: EnhancedAdviceResult["impactLevel"] = "Mild";
  let actionTiming: "today" | "tomorrow" = "today";
  let isUnrecognized = false;
  let suggestedCompensation: PrescriptionTask | undefined;

  // DYNAMIC HP SCALING RULE:
  // If current HP is low (<60), penalties decrease significantly less (multiplier 0.45) to prevent baseline collapse.
  // If current HP is high (>=85), full deduction applies (multiplier 1.0).
  const hpMultiplier =
    currentScore < 60
      ? 0.45
      : currentScore < 85
      ? 0.75
      : 1.0;

  // 1. BURGER / PIZZA / FRIES / JUNK / FRIED / NOODLES
  if (
    q.includes("burger") ||
    q.includes("pizza") ||
    q.includes("fries") ||
    q.includes("donut") ||
    q.includes("takeout") ||
    q.includes("fried") ||
    q.includes("noodles") ||
    q.includes("junk")
  ) {
    if (currentScore >= 80) {
      verdict = "GO_AHEAD_WITH_MODERATION";
      headline = "Enjoy it! Your health buffer is strong.";
      reasoning = "Your vitality is in peak balance. Take a 20-min brisk walk after eating to balance glucose.";
      compensationTip = "20-Min Post-Meal Digestion Walk";
      baseImpact = -8;
      impactLevel = "Moderate";
      actionTiming = "today";
      suggestedCompensation = {
        id: `rx_walk_${Date.now()}`,
        title: "20-Min Post-Meal Digestion Walk",
        detail: "Curbs glucose spikes from restaurant meal",
        targetValue: "+4 HP Recovered",
        compensationCategory: "activity",
        iconName: "Footprints",
      };
    } else {
      verdict = "AVOID_TODAY";
      headline = "Choose clean whole protein tonight.";
      reasoning = `Your HP is currently at ${currentScore}. Heavy refined fats today will deepen recovery debt.`;
      compensationTip = "Whole Foods Reset Tomorrow";
      baseImpact = -10;
      impactLevel = "High";
      actionTiming = "tomorrow";
      suggestedCompensation = {
        id: `rx_clean_${Date.now()}`,
        title: "Clean Whole Foods Reset Tomorrow",
        detail: "Single-ingredient clean whole foods",
        targetValue: "+8 HP Recovered",
        compensationCategory: "nutrition",
        iconName: "Salad",
      };
    }
  }
  // 2. DESSERT / ICE CREAM / SWEET / SUGAR / CHOCOLATE / CAKE / COOKIES
  else if (
    q.includes("ice cream") ||
    q.includes("dessert") ||
    q.includes("sweet") ||
    q.includes("sugar") ||
    q.includes("cake") ||
    q.includes("cookies") ||
    q.includes("chocolate")
  ) {
    if (currentScore >= 85) {
      verdict = "GO_AHEAD_WITH_MODERATION";
      headline = "Treat yourself in moderation!";
      reasoning = "You haven't logged refined sugars today and your score is high.";
      compensationTip = "15-Min Evening Stroll";
      baseImpact = -6;
      impactLevel = "Mild";
      actionTiming = "today";
      suggestedCompensation = {
        id: `rx_stroll_${Date.now()}`,
        title: "15-Min Evening Digestion Stroll",
        detail: "Blunts sugar spikes",
        targetValue: "+3 HP Recovered",
        compensationCategory: "activity",
        iconName: "Footprints",
      };
    } else {
      verdict = "SWAP_ALTERNATIVE";
      headline = "Swap for Greek yogurt with berries.";
      reasoning = "Refined sugar tonight will trigger energy crashes and disrupted sleep.";
      compensationTip = "Zero Refined Sugar Protocol Tomorrow";
      baseImpact = -8;
      impactLevel = "Moderate";
      actionTiming = "tomorrow";
      suggestedCompensation = {
        id: `rx_zero_sugar_${Date.now()}`,
        title: "Zero Refined Sugar Protocol Tomorrow",
        detail: "Zero packaged treats tomorrow",
        targetValue: "+6 HP Recovered",
        compensationCategory: "nutrition",
        iconName: "Salad",
      };
    }
  }
  // 3. COFFEE / ESPRESSO / SODA / ENERGY DRINK / MATCHA / LATTE
  else if (
    q.includes("espresso") ||
    q.includes("coffee") ||
    q.includes("caffeine") ||
    q.includes("soda") ||
    q.includes("matcha") ||
    q.includes("latte") ||
    q.includes("energy drink")
  ) {
    if (q.includes("soda") || q.includes("energy drink")) {
      verdict = "AVOID_TODAY";
      headline = "Swap for sparkling water with lime.";
      reasoning = "Liquid sugar directly causes glycemic spikes and sleep suppression.";
      compensationTip = "Drink 500ml Electrolyte Water";
      baseImpact = -6;
      impactLevel = "Moderate";
      actionTiming = "today";
    } else {
      verdict = "GO_AHEAD_WITH_MODERATION";
      headline = "Enjoy it before 2 PM.";
      reasoning = "Caffeine half-life is 6 hours. Keep afternoon intake early to protect sleep.";
      compensationTip = "Hydrate with 1 glass of water alongside coffee";
      baseImpact = -2;
      impactLevel = "Mild";
      actionTiming = "today";
    }
  }
  // 4. ALCOHOL / BEER / COCKTAIL / WINE / TEQUILA
  else if (
    q.includes("beer") ||
    q.includes("alcohol") ||
    q.includes("drink") ||
    q.includes("cocktail") ||
    q.includes("tequila") ||
    q.includes("wine")
  ) {
    if (currentScore >= 85) {
      verdict = "GO_AHEAD_WITH_MODERATION";
      headline = "Cap it at 1 drink with plenty of water.";
      reasoning = "Alcohol suppresses REM sleep, but your baseline momentum is solid.";
      compensationTip = "Drink 750ml Electrolyte Water";
      baseImpact = -8;
      impactLevel = "Moderate";
      actionTiming = "today";
      suggestedCompensation = {
        id: `rx_water_${Date.now()}`,
        title: "Electrolyte Hydration Catchup",
        detail: "Drink extra mineral water before sleep",
        targetValue: "+5 HP Recovered",
        compensationCategory: "recovery",
        iconName: "Droplet",
      };
    } else {
      verdict = "AVOID_TODAY";
      headline = "Avoid alcohol tonight; prioritize deep sleep.";
      reasoning = `With your HP at ${currentScore}, alcohol will cause compounding morning fatigue.`;
      compensationTip = "10-Min Evening Meditation & Tea";
      baseImpact = -10;
      impactLevel = "High";
      actionTiming = "today";
      suggestedCompensation = {
        id: `rx_meditation_${Date.now()}`,
        title: "10-Min Evening Meditation & Sleep",
        detail: "Wind down early with herbal tea",
        targetValue: "+6 HP Recovered",
        compensationCategory: "sleep",
        iconName: "Moon",
      };
    }
  }
  // 5. WORKOUT / TRAINING / RUN / SAUNA / DEADLIFT / WALK
  else if (
    q.includes("skip workout") ||
    q.includes("rest day") ||
    q.includes("gym") ||
    q.includes("weight training") ||
    q.includes("deadlift") ||
    q.includes("walk") ||
    q.includes("run") ||
    q.includes("sauna")
  ) {
    if (q.includes("weight training") || q.includes("run") || q.includes("sauna") || q.includes("walk")) {
      verdict = "YES";
      headline = "Great choice! Stimulates metabolic vitality.";
      reasoning = "Physical movement and thermal stimulus trigger cellular rejuvenation.";
      compensationTip = "Log 40m Workout in Daily Metrics";
      baseImpact = +6;
      impactLevel = "Mild";
      actionTiming = "today";
    } else if (sleepHours < 6) {
      verdict = "YES";
      headline = "Take active rest! Sleep recovery comes first.";
      reasoning = "Intense lifting under sleep deficit elevates cortisol and injury risk.";
      compensationTip = "20-Min Light Mobility & Early Sleep";
      baseImpact = +3;
      impactLevel = "Mild";
      actionTiming = "today";
    } else {
      verdict = "SWAP_ALTERNATIVE";
      headline = "Do a quick 15-minute bodyweight session.";
      reasoning = "A short movement burst keeps your neurological habit alive.";
      compensationTip = "15-Min Quick Movement Session";
      baseImpact = -4;
      impactLevel = "Mild";
      actionTiming = "today";
      suggestedCompensation = {
        id: `rx_quick_movement_${Date.now()}`,
        title: "15-Min Quick Movement Session",
        detail: "Bodyweight mobility burst",
        targetValue: "+3 HP Recovered",
        compensationCategory: "activity",
        iconName: "Dumbbell",
      };
    }
  }
  // 6. NAP / MEDITATION / STAY UP LATE / PHONE
  else if (
    q.includes("nap") ||
    q.includes("meditation") ||
    q.includes("stay up") ||
    q.includes("phone") ||
    q.includes("late") ||
    q.includes("sleep")
  ) {
    if (q.includes("nap") || q.includes("meditation")) {
      verdict = "YES";
      headline = "Highly recommended for nervous system recharge.";
      reasoning = "A 20m power nap or meditation clears adenosine and boosts afternoon cognition.";
      compensationTip = "20-Min Power Nap or Meditation";
      baseImpact = +4;
      impactLevel = "Mild";
      actionTiming = "today";
    } else {
      verdict = "AVOID_TODAY";
      headline = "Prioritize sleep: shut screens 30m before bed.";
      reasoning = "Late nights and blue light suppress melatonin and reduce deep sleep.";
      compensationTip = "8.5h Deep Sleep Tonight";
      baseImpact = -8;
      impactLevel = "Moderate";
      actionTiming = "today";
      suggestedCompensation = {
        id: `rx_sleep_${Date.now()}`,
        title: "8.5h Deep Sleep Tonight",
        detail: "Go to bed early tonight",
        targetValue: "+6 HP Recovered",
        compensationCategory: "sleep",
        iconName: "Moon",
      };
    }
  }
  // 7. UNRECOGNIZED QUERY FALLBACK
  else {
    isUnrecognized = true;
    verdict = "SWAP_ALTERNATIVE";
    headline = "No direct health impact found for this query.";
    reasoning = "Ask about food (burger, pizza, dessert), workouts, drinks, or sleep to get an exact HP calculation.";
    compensationTip = "Try asking: 'Should I eat a burger tonight?'";
    baseImpact = 0;
    impactLevel = "Mild";
    actionTiming = "today";
  }

  // Calculate adjusted HP impact
  let adjustedHPImpact = isUnrecognized ? 0 : Math.round(baseImpact * (baseImpact > 0 ? 1 : hpMultiplier));
  if (baseImpact < 0 && adjustedHPImpact === 0) adjustedHPImpact = -2;

  const impactBadgeColor =
    adjustedHPImpact > 0
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : Math.abs(adjustedHPImpact) <= 5
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  const actionDateLabel = actionTiming === "today" ? "Today's Action" : "Tomorrow's Action";

  return {
    id: `ADV-${Date.now()}`,
    question,
    verdict,
    headline,
    reasoning,
    compensationTip,
    adjustedHPImpact,
    impactLevel,
    impactBadgeColor,
    actionTiming,
    actionDateLabel,
    isUnrecognized,
    suggestedCompensation,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}
