import { DailyLog, HealthReceipt, HealthReceiptItem, PrescriptionTask, UserProfile } from "@/types/health";

export function calculateHealthScore(log: DailyLog, profile?: UserProfile | null): {
  score: number;
  items: HealthReceiptItem[];
  prescriptions: PrescriptionTask[];
} {
  const items: HealthReceiptItem[] = [];
  const prescriptions: PrescriptionTask[] = [];

  const baseTargetCalories = profile?.dailyCalorieTarget || 2000;
  const targetSleep = profile?.dailySleepTargetHours || 8;
  const targetSteps = profile?.dailyStepsTarget || 8000;

  // DYNAMIC CALORIC ALLOWANCE BASED ON PHYSICAL EXPENDITURE:
  const workoutBurn = Math.round(
    (log.workoutMinutes || 0) * 6.5 + Math.max(0, (log.steps || 0) - targetSteps) * 0.035
  );
  const adjustedTargetCalories = baseTargetCalories + workoutBurn;

  // 1. JUNK FOOD & ULTRA-PROCESSED FOOD
  if (log.ultraProcessed) {
    const penalty = 14;
    items.push({
      id: "ultra_processed",
      label: "Ultra-Processed Snacks / Sugar",
      detail: "Refined junk food, sugary drinks, or fried snacks",
      pointsDelta: -penalty,
      type: "negative",
      category: "habits",
    });
    prescriptions.push({
      id: "rx_zero_sugar",
      title: "Zero Refined Sugar Protocol Tomorrow",
      detail: "Zero packaged treats or sodas tomorrow",
      targetValue: "Zero Junk",
      compensationCategory: "nutrition",
      iconName: "Salad",
    });
  }

  // 2. OUTSIDE DINING & RESTAURANT FOOD
  if (log.ateOutside) {
    const penalty = 9;
    items.push({
      id: "ate_outside",
      label: "Restaurant / Outside Meal",
      detail: "Hidden sodium, seed oils & unmeasured sauces",
      pointsDelta: -penalty,
      type: "negative",
      category: "habits",
    });
    if (!prescriptions.some((p) => p.id === "rx_home_cooking")) {
      prescriptions.push({
        id: "rx_home_cooking",
        title: "100% Home-Cooked Meals Tomorrow",
        detail: "Cook all meals at home with clean whole foods",
        targetValue: "Home Food",
        compensationCategory: "nutrition",
        iconName: "Salad",
      });
    }
  }

  // 3. LOW FOOD QUALITY RATING
  if (log.healthyEatingScore <= 5) {
    const penalty = Math.max(6, (6 - log.healthyEatingScore) * 3 + 3);
    items.push({
      id: "poor_nutrition_penalty",
      label: "Low Food Quality Rating",
      detail: `Self-rated quality: ${log.healthyEatingScore}/10`,
      pointsDelta: -penalty,
      type: "negative",
      category: "nutrition",
    });
    if (!prescriptions.some((p) => p.id === "rx_whole_foods" || p.id === "rx_home_cooking")) {
      prescriptions.push({
        id: "rx_whole_foods",
        title: "Clean Whole Foods Reset Tomorrow",
        detail: "Single-ingredient fresh meals with greens & protein",
        targetValue: "Whole Foods",
        compensationCategory: "nutrition",
        iconName: "Salad",
      });
    }
  }

  // 4. INTELLIGENT CALORIC DEFICITS & SURPLUS (COMPENSATED BY ATHLETIC EXPENDITURE)
  if (log.calories > 0) {
    const calDiff = log.calories - adjustedTargetCalories;
    if (calDiff > 350) {
      const penalty = Math.min(18, Math.round((calDiff - 350) / 120) * 3 + 4);
      items.push({
        id: "cal_excess",
        label: "Caloric Surplus Spillover",
        detail: `+${calDiff} kcal above adjusted expenditure (${adjustedTargetCalories} kcal)`,
        pointsDelta: -penalty,
        type: "negative",
        category: "nutrition",
      });
      prescriptions.push({
        id: "rx_cal_offset",
        title: "Caloric Deficit Reset (-350 kcal) Tomorrow",
        detail: `Aim for ${baseTargetCalories - 350} kcal tomorrow to rebalance energy`,
        targetValue: `${baseTargetCalories - 350} kcal`,
        compensationCategory: "nutrition",
        iconName: "Salad",
      });
    } else if (log.calories < 1200) {
      // Severe under-fueling (especially critical if working out)
      const penalty = log.workoutMinutes > 0 ? 12 : 8;
      items.push({
        id: "cal_under",
        label: "Severe Under-Fueling",
        detail: `Only ${log.calories} kcal logged (Target: ${baseTargetCalories} kcal)`,
        pointsDelta: -penalty,
        type: "negative",
        category: "nutrition",
      });
      if (!prescriptions.some((p) => p.id === "rx_cal_refuel")) {
        prescriptions.push({
          id: "rx_cal_refuel",
          title: `Target ${baseTargetCalories} Clean Calories Tomorrow`,
          detail: "Refuel with balanced macros and whole foods to prevent metabolic debt",
          targetValue: `${baseTargetCalories} kcal`,
          compensationCategory: "nutrition",
          iconName: "Salad",
        });
      }
    } else if (adjustedTargetCalories - log.calories >= 500) {
      // Significant caloric deficit
      const penalty = Math.min(9, Math.round((adjustedTargetCalories - log.calories - 400) / 150) * 2 + 4);
      items.push({
        id: "cal_deficit",
        label: "Caloric Deficit Load",
        detail: `${log.calories} kcal logged (${Math.round(adjustedTargetCalories - log.calories)} kcal below expenditure)`,
        pointsDelta: -penalty,
        type: "negative",
        category: "nutrition",
      });
      if (!prescriptions.some((p) => p.id === "rx_cal_refuel")) {
        prescriptions.push({
          id: "rx_cal_refuel",
          title: `Target ${baseTargetCalories} Clean Calories Tomorrow`,
          detail: "Fuel adequately to support energy demands and muscular recovery",
          targetValue: `${baseTargetCalories} kcal`,
          compensationCategory: "nutrition",
          iconName: "Salad",
        });
      }
    }
  }

  // 4B. MACRONUTRIENT DEFICITS (PROTEIN & ESSENTIAL HEALTHY FATS)
  const weightKg = profile?.weightKg || 70;
  const targetProtein = Math.round(weightKg * 1.5);
  const minProteinThreshold = Math.round(weightKg * 0.8);

  // Protein deficit check
  if (log.calories > 0 && log.macros) {
    const protein = log.macros.protein || 0;
    if (protein > 0 && protein < 40) {
      const penalty = 8;
      items.push({
        id: "protein_severe_deficit",
        label: "Critical Protein Deficit",
        detail: `Only ${protein}g protein logged (Min safe threshold: ${minProteinThreshold}g)`,
        pointsDelta: -penalty,
        type: "negative",
        category: "nutrition",
      });
      if (!prescriptions.some((p) => p.id === "rx_protein_refuel")) {
        prescriptions.push({
          id: "rx_protein_refuel",
          title: `Target ${targetProtein}g Protein Tomorrow`,
          detail: "Fuel with lean poultry, eggs, fish, tofu, lentils, or Greek yogurt",
          targetValue: `${targetProtein}g Protein`,
          compensationCategory: "nutrition",
          iconName: "Salad",
        });
      }
    } else if (protein > 0 && protein < minProteinThreshold) {
      const penalty = 5;
      items.push({
        id: "protein_mild_deficit",
        label: "Low Protein Intake",
        detail: `${protein}g protein logged (Target: ${targetProtein}g)`,
        pointsDelta: -penalty,
        type: "negative",
        category: "nutrition",
      });
      if (!prescriptions.some((p) => p.id === "rx_protein_refuel")) {
        prescriptions.push({
          id: "rx_protein_refuel",
          title: `Target ${targetProtein}g Protein Tomorrow`,
          detail: "Boost protein intake to preserve lean mass and accelerate recovery",
          targetValue: `${targetProtein}g Protein`,
          compensationCategory: "nutrition",
          iconName: "Salad",
        });
      }
    }

    // Dietary Fat deficit check
    const fat = log.macros.fat || 0;
    if (fat > 0 && fat < 20) {
      const penalty = 6;
      items.push({
        id: "fat_severe_deficit",
        label: "Essential Healthy Fat Deficit",
        detail: `Only ${fat}g fat logged (Min: 35g for hormone and cellular health)`,
        pointsDelta: -penalty,
        type: "negative",
        category: "nutrition",
      });
      if (!prescriptions.some((p) => p.id === "rx_healthy_fats")) {
        prescriptions.push({
          id: "rx_healthy_fats",
          title: "Incorporate Healthy Fats Tomorrow",
          detail: "Add extra virgin olive oil, avocados, nuts, chia seeds, or salmon",
          targetValue: "45g Healthy Fats",
          compensationCategory: "nutrition",
          iconName: "Salad",
        });
      }
    } else if (fat > 0 && fat < 30) {
      const penalty = 4;
      items.push({
        id: "fat_mild_deficit",
        label: "Low Dietary Fat Intake",
        detail: `${fat}g fat logged (Target: 45-65g healthy fats)`,
        pointsDelta: -penalty,
        type: "negative",
        category: "nutrition",
      });
      if (!prescriptions.some((p) => p.id === "rx_healthy_fats")) {
        prescriptions.push({
          id: "rx_healthy_fats",
          title: "Incorporate Healthy Fats Tomorrow",
          detail: "Include clean healthy fats for optimal lipid and vitamin absorption",
          targetValue: "45g Healthy Fats",
          compensationCategory: "nutrition",
          iconName: "Salad",
        });
      }
    }
  }

  // 5. OVERTRAINING & ATHLETIC STRAIN / RECOVERY DAY PRESCRIPTION
  if ((log.workoutMinutes && log.workoutMinutes >= 110) || (log.steps && log.steps >= 20000)) {
    items.push({
      id: "heavy_athletic_strain",
      label: "Heavy Athletic Training Volume",
      detail: `${log.workoutMinutes}m training & ${log.steps.toLocaleString()} steps logged`,
      pointsDelta: +5,
      type: "positive",
      category: "activity",
    });
    prescriptions.unshift({
      id: "rx_rest_recovery",
      title: "Active Rest & Recovery Day Tomorrow",
      detail: "High muscular fatigue from heavy session — prioritize stretching & hydration",
      targetValue: "Rest Day",
      compensationCategory: "recovery",
      iconName: "Dumbbell",
    });
  } else if (log.steps < 3500) {
    const stepPenalty = log.steps === 0 ? 12 : log.steps < 1500 ? 9 : 6;
    items.push({
      id: "sedentary_day",
      label: "Sedentary Movement Deficit",
      detail: log.steps === 0 ? "0 steps logged today" : `Only ${log.steps.toLocaleString()} steps logged`,
      pointsDelta: -stepPenalty,
      type: "negative",
      category: "activity",
    });
    prescriptions.push({
      id: "rx_step_goal",
      title: "Hit 7,500 Steps Tomorrow",
      detail: "Take walking breaks throughout the day",
      targetValue: "7,500 Steps",
      compensationCategory: "activity",
      iconName: "Footprints",
    });
  }

  // 6. SLEEP DEFICIT & HYPERSOMNIA
  if (log.sleepHours < 6) {
    const penalty = Math.min(22, Math.round((6 - log.sleepHours) * 7) + 8);
    items.push({
      id: "sleep_debt",
      label: "Sleep Deprivation Debt",
      detail: `${log.sleepHours} hrs is below minimum 6h threshold`,
      pointsDelta: -penalty,
      type: "negative",
      category: "sleep",
    });
    prescriptions.push({
      id: "rx_sleep_catchup",
      title: "8.5h Deep Sleep Catchup Tonight",
      detail: "Go to bed 1h earlier tonight to restore neural recovery",
      targetValue: "8.5 hrs Sleep",
      compensationCategory: "sleep",
      iconName: "Moon",
    });
  } else if (log.sleepHours > 10.5) {
    items.push({
      id: "hypersomnia_alert",
      label: "Extended Sleep / Lethargy Window",
      detail: `${log.sleepHours} hrs logged. Realign circadian timing tomorrow`,
      pointsDelta: -4,
      type: "negative",
      category: "sleep",
    });
    prescriptions.push({
      id: "rx_circadian_reset",
      title: "Circadian Rhythm Reset Tomorrow (8h Sleep)",
      detail: "Get 15m morning sunlight and hit regular sleep window",
      targetValue: "8.0 hrs Sleep",
      compensationCategory: "sleep",
      iconName: "Moon",
    });
  } else if (log.sleepHours < 7) {
    const penalty = 6;
    items.push({
      id: "sleep_mild_debt",
      label: "Mild Sleep Deficit",
      detail: `${log.sleepHours} hrs sleep (Target: ${targetSleep} hrs)`,
      pointsDelta: -penalty,
      type: "negative",
      category: "sleep",
    });
    prescriptions.push({
      id: "rx_sleep_boost",
      title: "8.0h Sleep Target Tonight",
      detail: "Hit bedtime 45 mins earlier to compensate",
      targetValue: "8.0 hrs Sleep",
      compensationCategory: "sleep",
      iconName: "Moon",
    });
  }

  // 7. DEHYDRATION & SUPER HYDRATION
  if (log.waterLiters < 2.0) {
    const penalty = log.waterLiters === 0 ? 6 : 4;
    items.push({
      id: "dehydration_alert",
      label: "Dehydration Deficit",
      detail: log.waterLiters === 0 ? "0L water logged today" : `${log.waterLiters}L is below 2.0L baseline`,
      pointsDelta: -penalty,
      type: "negative",
      category: "hydration",
    });
    prescriptions.push({
      id: "rx_hydration_flush",
      title: "Drink 2.5L Water with Electrolytes Tomorrow",
      detail: "Start your morning with mineral water",
      targetValue: "2.5L Water",
      compensationCategory: "recovery",
      iconName: "Droplet",
    });
  } else if (log.waterLiters >= 5.0) {
    items.push({
      id: "heavy_hydration",
      label: "Electrolyte Hydration Surplus",
      detail: `${log.waterLiters}L logged — fully supporting heavy muscular output`,
      pointsDelta: +3,
      type: "positive",
      category: "hydration",
    });
  }

  // 8. COMPLETED DYNAMIC TODAY COMPENSATION RECOVERIES & CARRYOVER TASKS
  const completedTasks = log.completedPrescriptions || [];

  if (completedTasks.includes("today_walk_digest")) {
    items.push({
      id: "comp_walk_done",
      label: "Post-Meal Walk Fulfilled",
      detail: "Active digestion walk completed today",
      pointsDelta: +5,
      type: "positive",
      category: "activity",
    });
  }

  if (completedTasks.includes("today_tea_flush")) {
    items.push({
      id: "comp_tea_done",
      label: "Antioxidant Flush Fulfilled",
      detail: "Green tea / electrolyte recovery completed",
      pointsDelta: +5,
      type: "positive",
      category: "nutrition",
    });
  }

  if (completedTasks.includes("today_water_hydrate")) {
    items.push({
      id: "comp_water_done",
      label: "Hydration Catchup Fulfilled",
      detail: "Electrolyte water intake completed",
      pointsDelta: +4,
      type: "positive",
      category: "hydration",
    });
  }

  if (completedTasks.includes("today_evening_walk")) {
    items.push({
      id: "comp_evening_walk_done",
      label: "Brisk Movement Walk Fulfilled",
      detail: "2,500 movement steps completed",
      pointsDelta: +4,
      type: "positive",
      category: "activity",
    });
  }

  if (completedTasks.includes("today_refuel_protein") || completedTasks.includes("today_protein_boost")) {
    items.push({
      id: "comp_refuel_done",
      label: "Protein Refuel Meal Fulfilled",
      detail: "Nutrient-dense protein intake completed",
      pointsDelta: +5,
      type: "positive",
      category: "nutrition",
    });
  }

  if (completedTasks.includes("today_cal_refuel")) {
    items.push({
      id: "comp_cal_refuel_done",
      label: "Caloric Fueling Restored",
      detail: "Metabolic energy deficit rebalanced",
      pointsDelta: +5,
      type: "positive",
      category: "nutrition",
    });
  }

  if (completedTasks.includes("today_healthy_fats")) {
    items.push({
      id: "comp_healthy_fats_done",
      label: "Healthy Fats Restored",
      detail: "Essential fatty acids intake completed",
      pointsDelta: +4,
      type: "positive",
      category: "nutrition",
    });
  }

  // Carryover completed tasks from yesterday's deficit
  if (completedTasks.includes("comp_yesterday_sleep")) {
    items.push({
      id: "comp_yesterday_sleep_done",
      label: "Sleep Recovery Debt Paid",
      detail: "8.5h deep sleep recovery fulfilled",
      pointsDelta: +5,
      type: "positive",
      category: "sleep",
    });
  }

  if (completedTasks.includes("comp_yesterday_clean_food")) {
    items.push({
      id: "comp_yesterday_clean_food_done",
      label: "Whole Foods Reset Paid",
      detail: "100% clean whole food day completed",
      pointsDelta: +5,
      type: "positive",
      category: "nutrition",
    });
  }

  if (completedTasks.includes("comp_yesterday_steps")) {
    items.push({
      id: "comp_yesterday_steps_done",
      label: "Movement Debt Paid",
      detail: "Daily step target fulfilled",
      pointsDelta: +4,
      type: "positive",
      category: "activity",
    });
  }

  if (completedTasks.includes("comp_yesterday_refuel")) {
    items.push({
      id: "comp_yesterday_refuel_done",
      label: "Metabolic Debt Paid",
      detail: "Adequate caloric refuel fulfilled today",
      pointsDelta: +5,
      type: "positive",
      category: "nutrition",
    });
  }

  if (completedTasks.includes("comp_yesterday_protein")) {
    items.push({
      id: "comp_yesterday_protein_done",
      label: "Protein Debt Paid",
      detail: "Target protein intake fulfilled today",
      pointsDelta: +5,
      type: "positive",
      category: "nutrition",
    });
  }

  if (completedTasks.includes("comp_yesterday_fats")) {
    items.push({
      id: "comp_yesterday_fats_done",
      label: "Essential Fats Debt Paid",
      detail: "Healthy fats requirement fulfilled today",
      pointsDelta: +4,
      type: "positive",
      category: "nutrition",
    });
  }

  // 9. COMPLETED CUSTOM TASKS (FROM 'SHOULD I...?' ADVISOR)
  const customTasks = log.activeCustomTasks || [];
  customTasks
    .filter((t) => t.isCompleted)
    .forEach((task) => {
      items.push({
        id: `custom_${task.id}`,
        label: `${task.title} Completed`,
        detail: "Custom recovery task fulfilled",
        pointsDelta: task.recoveryHp,
        type: "positive",
        category: "activity",
      });
    });

  // 10. LOGGED ADVICE ACTIONS (FROM 'SHOULD I...?' ADVISOR)
  const adviceActions = log.loggedAdviceActions || [];
  adviceActions.forEach((act) => {
    items.push({
      id: act.id,
      label: act.title,
      detail: act.pointsDelta >= 0 ? "Healthy advisor choice logged" : "Advisor choice logged",
      pointsDelta: act.pointsDelta,
      type: act.pointsDelta >= 0 ? "positive" : "negative",
      category: act.category,
    });
  });

  // PURE SUBTRACTIVE HP CALCULATION:
  const totalPenalties = items
    .filter((it) => it.pointsDelta < 0)
    .reduce((acc, it) => acc + Math.abs(it.pointsDelta), 0);

  const totalRecovered = items
    .filter((it) => it.pointsDelta > 0)
    .reduce((acc, it) => acc + it.pointsDelta, 0);

  const finalScore = Math.max(0, Math.min(100, 100 - totalPenalties + totalRecovered));

  return {
    score: finalScore,
    items,
    prescriptions: prescriptions.slice(0, 4),
  };
}

export function generateDailyReceipt(
  log: DailyLog,
  profile?: UserProfile | null,
  previousScore?: number
): HealthReceipt {
  const { score, items, prescriptions } = calculateHealthScore(log, profile);

  let grade: HealthReceipt["grade"] = "B";
  let gradeLabel = "Balanced Day";
  let statusMessage = "Solid health balance today.";

  if (score >= 90) {
    grade = "A";
    gradeLabel = "Peak Vitality";
    statusMessage = "Pristine physical balance and execution!";
  } else if (score >= 75) {
    grade = "B";
    gradeLabel = "Balanced";
    statusMessage = "Good day overall with slight trade-offs.";
  } else if (score >= 60) {
    grade = "C";
    gradeLabel = "Needs Attention";
    statusMessage = "Metabolic and fatigue deficits detected. Follow tomorrow's fix.";
  } else {
    grade = "D";
    gradeLabel = "Recovery Debt";
    statusMessage = "Biological fatigue load. Execute tomorrow's compensation.";
  }

  const receiptId = `WAF-${log.date.replace(/-/g, "")}`;

  return {
    receiptId,
    date: log.date,
    totalScore: score,
    previousScore,
    startingBaseScore: 100,
    items,
    prescriptions,
    grade,
    gradeLabel,
    statusMessage,
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}
