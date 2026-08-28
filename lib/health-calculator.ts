import { DailyLog, HealthReceipt, HealthReceiptItem, PrescriptionTask, UserProfile } from "@/types/health";

export function calculateHealthScore(log: DailyLog, profile?: UserProfile | null): {
  score: number;
  items: HealthReceiptItem[];
  prescriptions: PrescriptionTask[];
} {
  const isCompletelyEmpty =
    (log.calories === 0 || !log.calories) &&
    (log.sleepHours === 0 || !log.sleepHours) &&
    (log.steps === 0 || !log.steps) &&
    (log.workoutMinutes === 0 || !log.workoutMinutes) &&
    (log.waterLiters === 0 || !log.waterLiters);

  if (isCompletelyEmpty) {
    return {
      score: 0,
      items: [],
      prescriptions: [],
    };
  }

  const items: HealthReceiptItem[] = [];
  const prescriptions: PrescriptionTask[] = [];

  const baseTargetCalories = profile?.dailyCalorieTarget || 2000;
  const targetSleep = profile?.dailySleepTargetHours || 8;
  const targetSteps = profile?.dailyStepsTarget || 8000;

  // Athletic expenditure adjustment
  const workoutBurn = Math.round(
    (log.workoutMinutes || 0) * 6.5 + Math.max(0, (log.steps || 0) - targetSteps) * 0.035
  );
  const adjustedTargetCalories = baseTargetCalories + workoutBurn;

  let earnedSleepHp = 0;
  let earnedNutritionHp = 0;
  let earnedMovementHp = 0;
  let earnedHydrationHp = 0;
  let deductionsHp = 0;

  // ==========================================
  // 1. SLEEP & CIRCADIAN RECOVERY (0 - 30 HP)
  // ==========================================
  if (log.sleepHours >= 8.5) {
    earnedSleepHp = 30;
    items.push({
      id: "sleep_deep_rest",
      label: "Deep Restorative Sleep Reserve",
      detail: `${log.sleepHours} hrs sleep — supercharged cellular & hormonal recovery`,
      pointsDelta: +30,
      type: "positive",
      category: "sleep",
    });
  } else if (log.sleepHours >= 7.0) {
    earnedSleepHp = 28;
    items.push({
      id: "sleep_optimal",
      label: "Optimal Circadian Sleep",
      detail: `${log.sleepHours} hrs sleep — balanced nervous system`,
      pointsDelta: +28,
      type: "positive",
      category: "sleep",
    });
  } else if (log.sleepHours >= 5.5) {
    earnedSleepHp = 18;
    items.push({
      id: "sleep_moderate",
      label: "Moderate Sleep Duration",
      detail: `${log.sleepHours} hrs sleep (Target: ${targetSleep} hrs)`,
      pointsDelta: +18,
      type: "positive",
      category: "sleep",
    });
    prescriptions.push({
      id: "rx_sleep_boost",
      title: "8.0h Sleep Target Tonight",
      detail: "Hit bedtime 45 mins earlier to clear sleep debt",
      targetValue: "8.0 hrs Sleep",
      compensationCategory: "sleep",
      iconName: "Moon",
    });
  } else if (log.sleepHours >= 4.0) {
    earnedSleepHp = 10;
    items.push({
      id: "sleep_deficit",
      label: "Sleep Deficit Logged",
      detail: `Only ${log.sleepHours} hrs sleep logged — high fatigue accumulation`,
      pointsDelta: +10,
      type: "positive",
      category: "sleep",
    });
    prescriptions.push({
      id: "rx_sleep_boost",
      title: "8.5h Deep Catchup Sleep Tonight",
      detail: "Prioritize dark cool room and no screens 1h pre-bed",
      targetValue: "8.5 hrs Sleep",
      compensationCategory: "sleep",
      iconName: "Moon",
    });
  } else if (log.sleepHours > 0) {
    earnedSleepHp = 5;
    items.push({
      id: "sleep_severe_debt",
      label: "Acute Sleep Deprivation",
      detail: `Only ${log.sleepHours} hrs sleep logged — severe circadian debt`,
      pointsDelta: +5,
      type: "positive",
      category: "sleep",
    });
    prescriptions.push({
      id: "rx_sleep_boost",
      title: "8.5h Deep Catchup Sleep Tonight",
      detail: "Prioritize dark cool room and no screens 1h pre-bed",
      targetValue: "8.5 hrs Sleep",
      compensationCategory: "sleep",
      iconName: "Moon",
    });
  }

  // ==========================================
  // 2. NUTRITION & FUEL QUALITY (0 - 30 HP)
  // ==========================================
  if (log.calories > 0) {
    const qualityScore = log.healthyEatingScore || 8;
    const baseFoodHp = Math.round((qualityScore / 10) * 30);
    earnedNutritionHp = baseFoodHp;

    items.push({
      id: "nutrition_fuel",
      label: qualityScore >= 8 ? "Clean Nutrient-Dense Fuel" : "Nutritional Fuel Intake",
      detail: `${log.calories} kcal logged with ${qualityScore}/10 whole food quality`,
      pointsDelta: +baseFoodHp,
      type: "positive",
      category: "nutrition",
    });

    // Caloric Surplus / Deficit check
    const calDiff = log.calories - adjustedTargetCalories;
    if (calDiff >= 900) {
      deductionsHp += 16;
      items.push({
        id: "massive_cal_surplus",
        label: "Severe Caloric Surplus",
        detail: `+${calDiff} kcal above expenditure (${adjustedTargetCalories} kcal)`,
        pointsDelta: -16,
        type: "negative",
        category: "nutrition",
      });
      prescriptions.push({
        id: "rx_cal_offset",
        title: `Target ${baseTargetCalories - 400} kcal Tomorrow`,
        detail: "Incorporate a gentle deficit and mineral water to restore balance",
        targetValue: `${baseTargetCalories - 400} kcal`,
        compensationCategory: "nutrition",
        iconName: "Salad",
      });
    } else if (calDiff >= 450) {
      deductionsHp += 8;
      items.push({
        id: "cal_excess",
        label: "Caloric Surplus Load",
        detail: `+${calDiff} kcal above expenditure (${adjustedTargetCalories} kcal)`,
        pointsDelta: -8,
        type: "negative",
        category: "nutrition",
      });
      prescriptions.push({
        id: "rx_cal_offset",
        title: "Caloric Reset Tomorrow",
        detail: `Aim for ${baseTargetCalories - 250} kcal tomorrow to rebalance energy`,
        targetValue: `${baseTargetCalories - 250} kcal`,
        compensationCategory: "nutrition",
        iconName: "Salad",
      });
    } else if (log.calories < 1200) {
      deductionsHp += 6;
      items.push({
        id: "under_fueling",
        label: "Under-Fueling Metabolic Strain",
        detail: `Only ${log.calories} kcal logged — below 1,200 kcal basal baseline`,
        pointsDelta: -6,
        type: "negative",
        category: "nutrition",
      });
      if (!prescriptions.some((p) => p.id === "rx_cal_refuel")) {
        prescriptions.push({
          id: "rx_cal_refuel",
          title: `Target ${baseTargetCalories} Clean Calories Tomorrow`,
          detail: "Fuel adequately with whole carbs & protein to maintain metabolic rate",
          targetValue: `${baseTargetCalories} kcal`,
          compensationCategory: "nutrition",
          iconName: "Salad",
        });
      }
    }

    if (log.ultraProcessed) {
      deductionsHp += 10;
      items.push({
        id: "ultra_processed",
        label: "Ultra-Processed Food / Sugar",
        detail: "Refined junk food or sugary snacks logged",
        pointsDelta: -10,
        type: "negative",
        category: "habits",
      });
      prescriptions.push({
        id: "rx_zero_sugar",
        title: "Zero Refined Sugar Protocol Tomorrow",
        detail: "Zero packaged snacks or sodas tomorrow",
        targetValue: "Zero Junk",
        compensationCategory: "nutrition",
        iconName: "Salad",
      });
    }

    if (log.ateOutside) {
      deductionsHp += 6;
      items.push({
        id: "ate_outside",
        label: "Outside / Restaurant Meal",
        detail: "Seed oils & unmeasured sodium logged",
        pointsDelta: -6,
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
  }

  // ==========================================
  // 3. MOVEMENT & ATHLETIC TRAINING (0 - 25 HP)
  // ==========================================
  const steps = log.steps || 0;
  const workoutMins = log.workoutMinutes || 0;

  if (steps >= 10000) {
    earnedMovementHp += 15;
    items.push({
      id: "steps_optimal",
      label: "Optimal Step Volume",
      detail: `${steps.toLocaleString()} steps logged`,
      pointsDelta: +15,
      type: "positive",
      category: "activity",
    });
  } else if (steps >= 6000) {
    earnedMovementHp += 10;
    items.push({
      id: "steps_moderate",
      label: "Active Daily Movement",
      detail: `${steps.toLocaleString()} steps logged`,
      pointsDelta: +10,
      type: "positive",
      category: "activity",
    });
  } else if (steps >= 2500) {
    earnedMovementHp += 5;
    items.push({
      id: "steps_light",
      label: "Light Movement Activity",
      detail: `${steps.toLocaleString()} steps logged`,
      pointsDelta: +5,
      type: "positive",
      category: "activity",
    });
  } else if (steps > 0) {
    earnedMovementHp += 2;
    items.push({
      id: "steps_minimal",
      label: "Minimal Steps Activity",
      detail: `${steps.toLocaleString()} steps logged`,
      pointsDelta: +2,
      type: "positive",
      category: "activity",
    });
  }

  // Low Step Movement Prescription for Tomorrow
  if (steps > 0 && steps < 5000 && workoutMins === 0) {
    if (!prescriptions.some((p) => p.id === "rx_movement_boost")) {
      prescriptions.push({
        id: "rx_movement_boost",
        title: "Target 8,000 Steps Tomorrow",
        detail: "Accumulate morning and post-meal walks to rebalance NEAT circulation",
        targetValue: "8,000 Steps",
        compensationCategory: "activity",
        iconName: "Footprints",
      });
    }
  }

  if (workoutMins >= 45) {
    earnedMovementHp = Math.min(25, earnedMovementHp + 10);
    items.push({
      id: "workout_done",
      label: "Dedicated Athletic Training",
      detail: `${workoutMins} mins physical workout completed`,
      pointsDelta: +10,
      type: "positive",
      category: "activity",
    });
  } else if (workoutMins >= 20) {
    earnedMovementHp = Math.min(25, earnedMovementHp + 7);
    items.push({
      id: "workout_done",
      label: "Moderate Athletic Training",
      detail: `${workoutMins} mins movement logged`,
      pointsDelta: +7,
      type: "positive",
      category: "activity",
    });
  } else if (workoutMins > 0) {
    earnedMovementHp = Math.min(25, earnedMovementHp + 4);
    items.push({
      id: "workout_light",
      label: "Light Workout Session",
      detail: `${workoutMins} mins movement logged`,
      pointsDelta: +4,
      type: "positive",
      category: "activity",
    });
  }

  // Sleep-Deprived Heavy Training Coupling (CNS Strain)
  if (workoutMins >= 60 && (log.sleepHours || 0) > 0 && (log.sleepHours || 0) < 6.5) {
    deductionsHp += 8;
    items.push({
      id: "sleep_deprived_training_strain",
      label: "CNS Fatigue & Training Strain",
      detail: `${workoutMins}m workout on only ${log.sleepHours}h sleep — high sympathetic load`,
      pointsDelta: -8,
      type: "negative",
      category: "activity",
    });
    if (!prescriptions.some((p) => p.id === "rx_rest_recovery")) {
      prescriptions.push({
        id: "rx_rest_recovery",
        title: "Active Recovery & Mobility Tomorrow",
        detail: "Gentle stretching and early bedtime to restore neural balance",
        targetValue: "Active Rest",
        compensationCategory: "recovery",
        iconName: "Dumbbell",
      });
    }
  }

  // ==========================================
  // 4. HYDRATION (0 - 15 HP)
  // ==========================================
  const water = log.waterLiters || 0;
  if (water >= 2.5) {
    earnedHydrationHp = 15;
    items.push({
      id: "water_optimal",
      label: "Optimal Cellular Hydration",
      detail: `${water}L mineral water logged`,
      pointsDelta: +15,
      type: "positive",
      category: "hydration",
    });
  } else if (water >= 1.5) {
    earnedHydrationHp = 10;
    items.push({
      id: "water_moderate",
      label: "Adequate Daily Hydration",
      detail: `${water}L water logged (Target: 2.5L)`,
      pointsDelta: +10,
      type: "positive",
      category: "hydration",
    });
    if (!prescriptions.some((p) => p.id === "rx_hydration_flush")) {
      prescriptions.push({
        id: "rx_hydration_flush",
        title: "Target 2.5L Mineral Water Tomorrow",
        detail: "Start tomorrow with 500ml water and electrolytes upon waking",
        targetValue: "2.5L Water",
        compensationCategory: "recovery",
        iconName: "Droplet",
      });
    }
  } else if (water >= 0.5) {
    earnedHydrationHp = 5;
    items.push({
      id: "water_low",
      label: "Partial Hydration Logged",
      detail: `${water}L water logged — below 2.0L baseline`,
      pointsDelta: +5,
      type: "positive",
      category: "hydration",
    });
    if (!prescriptions.some((p) => p.id === "rx_hydration_flush")) {
      prescriptions.push({
        id: "rx_hydration_flush",
        title: "Target 2.5L Mineral Water Tomorrow",
        detail: "Prioritize consistent hydration throughout tomorrow",
        targetValue: "2.5L Water",
        compensationCategory: "recovery",
        iconName: "Droplet",
      });
    }
  } else if (water > 0) {
    earnedHydrationHp = 3;
    items.push({
      id: "water_minimal",
      label: "Initial Hydration Logged",
      detail: `${water}L water logged`,
      pointsDelta: +3,
      type: "positive",
      category: "hydration",
    });
  }

  // ==========================================
  // 5. SUBJECTIVE VITALITY & MOOD (-5 to +4 HP)
  // ==========================================
  let moodDelta = 0;
  if (log.mood === "motivated") {
    moodDelta = +4;
    items.push({
      id: "mood_motivated",
      label: "High Drive & Mental Vitality",
      detail: "Peak motivation and nervous system readiness",
      pointsDelta: +4,
      type: "positive",
      category: "recovery",
    });
  } else if (log.mood === "good") {
    moodDelta = +2;
    items.push({
      id: "mood_good",
      label: "Positive Wellbeing State",
      detail: "Balanced subjective mood and energy",
      pointsDelta: +2,
      type: "positive",
      category: "recovery",
    });
  } else if (log.mood === "unmotivated") {
    moodDelta = -2;
    deductionsHp += 2;
    items.push({
      id: "mood_unmotivated",
      label: "Mental Resistance / Low Drive",
      detail: "Subtle psychological friction logged",
      pointsDelta: -2,
      type: "negative",
      category: "habits",
    });
  } else if (log.mood === "fatigued") {
    moodDelta = -5;
    deductionsHp += 5;
    items.push({
      id: "mood_fatigued",
      label: "Subjective Exhaustion & Fatigue",
      detail: "Systemic lethargy and nervous fatigue reported",
      pointsDelta: -5,
      type: "negative",
      category: "habits",
    });
  }

  // ==========================================
  // 6. COMPLETED RECOVERY TASKS (DIRECT HP BOOSTS)
  // ==========================================
  let completedBonusHp = 0;
  const completedList = log.completedPrescriptions || [];

  completedList.forEach((taskId) => {
    completedBonusHp += 5;
    items.push({
      id: `task_done_${taskId}`,
      label: "Recovery Task Fulfilled",
      detail: `+5 HP biological compensation executed for today`,
      pointsDelta: +5,
      type: "positive",
      category: "habits",
    });
  });

  // Custom tasks from Advisor
  const customTasks = (log.activeCustomTasks || []).filter((t) => t.isCompleted);
  customTasks.forEach((task) => {
    completedBonusHp += task.recoveryHp || 5;
    items.push({
      id: `custom_task_${task.id}`,
      label: `${task.title} Executed`,
      detail: `+${task.recoveryHp || 5} HP recovery task fulfilled`,
      pointsDelta: task.recoveryHp || 5,
      type: "positive",
      category: "activity",
    });
  });

  // HP Streak Shield (+10 to +50 HP)
  let shieldBonus = 0;
  if (log.hpShieldUsed && log.hpShieldBonus) {
    shieldBonus = log.hpShieldBonus;
    items.push({
      id: "hp_shield_deployed",
      label: "HP Streak Shield Activated",
      detail: `+${log.hpShieldBonus} HP protection recovered for today`,
      pointsDelta: log.hpShieldBonus,
      type: "positive",
      category: "recovery",
    });
  }

  // ==========================================
  // 7. LOGGED ADVICE ACTIONS (FROM 'SHOULD I' ADVISOR)
  // ==========================================
  const loggedAdvice = log.loggedAdviceActions || [];
  loggedAdvice.forEach((adv) => {
    if (adv.pointsDelta < 0) {
      deductionsHp += Math.abs(adv.pointsDelta);
      items.push({
        id: `adv_${adv.id}`,
        label: adv.title,
        detail: `Logged advice indulgence (${adv.pointsDelta} HP)`,
        pointsDelta: adv.pointsDelta,
        type: "negative",
        category: adv.category || "habits",
      });
    } else if (adv.pointsDelta > 0) {
      completedBonusHp += adv.pointsDelta;
      items.push({
        id: `adv_${adv.id}`,
        label: adv.title,
        detail: `Logged positive choice (+${adv.pointsDelta} HP)`,
        pointsDelta: adv.pointsDelta,
        type: "positive",
        category: adv.category || "recovery",
      });
    }
  });

  // ==========================================
  // FINAL SCORE COMPUTATION
  // ==========================================
  const baseEarned = earnedSleepHp + earnedNutritionHp + earnedMovementHp + earnedHydrationHp;
  const moodBonus = moodDelta > 0 ? moodDelta : 0;
  
  let finalScore = 0;
  if (baseEarned > 0 || completedBonusHp > 0) {
    const rawScore = baseEarned + moodBonus + completedBonusHp + shieldBonus - deductionsHp;
    finalScore = Math.max(10, Math.min(100, rawScore));
  }

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
  } else if (score > 0) {
    grade = "D";
    gradeLabel = "Recovery Debt";
    statusMessage = "Biological fatigue load. Execute today's compensation.";
  } else {
    grade = "B";
    gradeLabel = "Awaiting Logs";
    statusMessage = "Log core health metrics to calculate statement.";
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
