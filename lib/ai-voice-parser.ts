import { DailyLog } from "@/types/health";

export interface ParsedSpeechResult {
  extractedData: Partial<DailyLog>;
  confidence: number;
  detectedInsights: string[];
  rawTranscript: string;
}

export function parseVoiceInput(text: string, currentLog: DailyLog): ParsedSpeechResult {
  const lower = text.toLowerCase();
  const insights: string[] = [];
  const extracted: Partial<DailyLog> = {
    macros: { ...currentLog.macros },
  };

  // 1. SLEEP DETECTION (e.g. "slept 7.5 hours", "slept for 6 hours", "8 hrs sleep")
  const sleepMatch = lower.match(/(?:slept|sleep|slept for)\s*([\d\.]+)\s*(?:hours|hrs|h)?/i) 
    || lower.match(/([\d\.]+)\s*(?:hours|hrs|h)\s*(?:of\s*)?sleep/i);
  if (sleepMatch && sleepMatch[1]) {
    const hours = parseFloat(sleepMatch[1]);
    if (!isNaN(hours) && hours > 0 && hours <= 18) {
      extracted.sleepHours = hours;
      insights.push(`Detected ${hours} hours of sleep`);
    }
  }

  // 2. CALORIES DETECTION (e.g. "ate 2100 calories", "2200 kcal", "around 1800 cal", "500 calories", "300 kcal")
  const calorieMatch = lower.match(/(\d{2,5})\s*(?:calories|calorie|kcal|cals)/i)
    || lower.match(/(?:ate|consumed|total of)\s*(\d{2,5})\s*(?:cal|calories|kcal)?/i);
  if (calorieMatch && calorieMatch[1]) {
    const cals = parseInt(calorieMatch[1], 10);
    if (!isNaN(cals) && cals >= 50 && cals <= 8000) {
      extracted.calories = cals;
      insights.push(`Detected ${cals} kcal consumed`);
    }
  }

  // 3. PROTEIN DETECTION (e.g. "120g protein", "protein was 140 grams", "100 grams of protein")
  const proteinMatch = lower.match(/(\d{1,3})\s*(?:g|grams)?\s*(?:of\s*)?protein/i)
    || lower.match(/protein\s*(?:was|is|around)?\s*(\d{1,3})\s*(?:g|grams)?/i);
  if (proteinMatch && proteinMatch[1]) {
    const protein = parseInt(proteinMatch[1], 10);
    if (!isNaN(protein) && protein > 0 && protein <= 400) {
      extracted.macros = { ...extracted.macros!, protein };
      insights.push(`Logged ${protein}g protein`);
    }
  }

  // 4. CARBS DETECTION (e.g. "180g carbs", "carbs 200g")
  const carbsMatch = lower.match(/(\d{1,3})\s*(?:g|grams)?\s*(?:of\s*)?(?:carbs|carbohydrates)/i)
    || lower.match(/(?:carbs|carbohydrates)\s*(?:was|is)?\s*(\d{1,3})\s*(?:g|grams)?/i);
  if (carbsMatch && carbsMatch[1]) {
    const carbs = parseInt(carbsMatch[1], 10);
    if (!isNaN(carbs) && carbs >= 0 && carbs <= 600) {
      extracted.macros = { ...extracted.macros!, carbs };
      insights.push(`Logged ${carbs}g carbs`);
    }
  }

  // 5. FAT DETECTION (e.g. "60g fat", "fats 55 grams")
  const fatMatch = lower.match(/(\d{1,3})\s*(?:g|grams)?\s*(?:of\s*)?(?:fat|fats)/i)
    || lower.match(/(?:fat|fats)\s*(?:was|is)?\s*(\d{1,3})\s*(?:g|grams)?/i);
  if (fatMatch && fatMatch[1]) {
    const fat = parseInt(fatMatch[1], 10);
    if (!isNaN(fat) && fat >= 0 && fat <= 250) {
      extracted.macros = { ...extracted.macros!, fat };
      insights.push(`Logged ${fat}g dietary fat`);
    }
  }

  // 6. STEPS DETECTION (e.g. "walked 8000 steps", "8,500 steps today", "10k steps")
  const stepsMatch = lower.match(/(\d{1,2}(?:,\d{3})|\d{4,5})\s*steps/i);
  const kStepsMatch = lower.match(/([\d\.]+)\s*k\s*steps/i);
  if (stepsMatch && stepsMatch[1]) {
    const steps = parseInt(stepsMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(steps) && steps > 0 && steps <= 60000) {
      extracted.steps = steps;
      insights.push(`Logged ${steps.toLocaleString()} steps`);
    }
  } else if (kStepsMatch && kStepsMatch[1]) {
    const kSteps = Math.round(parseFloat(kStepsMatch[1]) * 1000);
    if (!isNaN(kSteps) && kSteps > 0 && kSteps <= 60000) {
      extracted.steps = kSteps;
      insights.push(`Logged ${kSteps.toLocaleString()} steps`);
    }
  }

  // 7. WORKOUT & EXERCISE (e.g. "did 45 mins gym", "30 minutes run", "1 hour workout")
  const workoutMatch = lower.match(/(\d{1,3})\s*(?:mins|minutes|min)\s*(?:of\s*)?(?:workout|gym|running|cardio|training|yoga|lifting|exercise)/i)
    || lower.match(/(?:workout|gym|ran|exercised|trained)\s*(?:for\s*)?(\d{1,3})\s*(?:mins|minutes|min)/i);
  if (workoutMatch && workoutMatch[1]) {
    const mins = parseInt(workoutMatch[1], 10);
    if (!isNaN(mins) && mins > 0 && mins <= 300) {
      extracted.workoutMinutes = mins;
      insights.push(`Logged ${mins} min training session`);
    }
  } else if (lower.includes("workout") || lower.includes("gym") || lower.includes("lifted weights")) {
    extracted.workoutMinutes = currentLog.workoutMinutes > 0 ? currentLog.workoutMinutes : 45;
    insights.push("Detected workout session (~45m default)");
  }

  // 8. WATER INTAKE (e.g. "drank 3 liters", "2.5l water", "3 litres of water")
  const waterMatch = lower.match(/([\d\.]+)\s*(?:l|liters|litres|liter)\s*(?:of\s*)?(?:water)?/i);
  if (waterMatch && waterMatch[1]) {
    const water = parseFloat(waterMatch[1]);
    if (!isNaN(water) && water > 0 && water <= 10) {
      extracted.waterLiters = water;
      insights.push(`Logged ${water}L water intake`);
    }
  }

  // 9. OUTSIDE FOOD DETECTION
  if (
    lower.includes("ate out") ||
    lower.includes("ate outside") ||
    lower.includes("restaurant") ||
    lower.includes("dined out") ||
    lower.includes("takeout") ||
    lower.includes("order food") ||
    lower.includes("zomato") ||
    lower.includes("swiggy") ||
    lower.includes("doordash") ||
    lower.includes("uber eats") ||
    lower.includes("had dinner outside")
  ) {
    extracted.ateOutside = true;
    insights.push("Flagged: Outside dining / restaurant meal");
  }

  // 10. ULTRA-PROCESSED / JUNK FOOD DETECTION
  if (
    lower.includes("junk") ||
    lower.includes("burger") ||
    lower.includes("pizza") ||
    lower.includes("chips") ||
    lower.includes("soda") ||
    lower.includes("coke") ||
    lower.includes("ice cream") ||
    lower.includes("donut") ||
    lower.includes("doughnut") ||
    lower.includes("fried") ||
    lower.includes("candy") ||
    lower.includes("ultra processed") ||
    lower.includes("processed food") ||
    lower.includes("sweet") ||
    lower.includes("sugar")
  ) {
    extracted.ultraProcessed = true;
    insights.push("Flagged: Ultra-processed / refined foods eaten");
  }

  // 11. HEALTHY EATING SCORE HEURISTIC
  if (lower.includes("ate very healthy") || lower.includes("clean eating") || lower.includes("home cooked only")) {
    extracted.healthyEatingScore = 9;
    insights.push("Healthy eating self-score set to 9/10");
  } else if (lower.includes("ate poorly") || lower.includes("unhealthy day") || lower.includes("cheat day")) {
    extracted.healthyEatingScore = 3;
    insights.push("Healthy eating self-score set to 3/10");
  }

  return {
    extractedData: extracted,
    confidence: insights.length > 0 ? Math.min(0.98, 0.5 + insights.length * 0.1) : 0.3,
    detectedInsights: insights,
    rawTranscript: text,
  };
}

export const SAMPLE_VOICE_PROMPTS = [
  {
    title: "Clean High-Performance Day",
    text: "I slept 8 hours, ate 2100 calories with 150g protein and 180g carbs. Walked 9500 steps, did 45 mins workout, drank 3 liters of water. All home cooked clean food.",
  },
  {
    title: "Casual Outside Dinner Day",
    text: "Slept 6.5 hours, ate 2400 calories and ate outside at a burger restaurant with fries. Walked 6000 steps and drank 2 liters water.",
  },
  {
    title: "Busy Workday with Deficit",
    text: "Only slept 5 hours last night. Ate 1600 calories, had some processed snacks, no workout today, walked 4000 steps.",
  },
];
