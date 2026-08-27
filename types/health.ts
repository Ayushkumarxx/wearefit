export interface MacroDistribution {
  carbs: number;
  protein: number;
  fat: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  sleepHours: number;
  calories: number;
  macros: MacroDistribution;
  ateOutside: boolean;
  ultraProcessed: boolean;
  healthyEatingScore: number; // 1-10
  steps: number;
  workoutMinutes: number;
  workoutType?: string;
  waterLiters: number;
  voiceNoteTranscript?: string;
  completedPrescriptions?: string[];
  activeCustomTasks?: Array<{
    id: string;
    title: string;
    recoveryHp: number;
    iconName: "Footprints" | "Salad" | "Droplet" | "Dumbbell" | "Moon" | "Sparkles";
    isCompleted: boolean;
  }>;
  loggedAdviceActions?: Array<{
    id: string;
    title: string;
    pointsDelta: number;
    category: "activity" | "nutrition" | "sleep" | "habits" | "hydration";
  }>;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  gender?: "male" | "female" | "unspecified";
  focusGoal?: "fat_loss" | "energy_vitality" | "muscle_gain" | "general_health";
  dailyCalorieTarget: number;
  dailySleepTargetHours: number;
  dailyStepsTarget: number;
  createdAt: string;
}

export interface HealthReceiptItem {
  id: string;
  label: string;
  detail: string;
  pointsDelta: number;
  type: "positive" | "negative";
  category: "sleep" | "nutrition" | "activity" | "hydration" | "habits" | "recovery";
}

export interface PrescriptionTask {
  id: string;
  title: string;
  detail: string;
  targetValue: string;
  compensationCategory: "sleep" | "nutrition" | "activity" | "hydration" | "recovery";
  iconName: "Moon" | "Footprints" | "Dumbbell" | "Salad" | "Droplet" | "Sparkles";
  isCompleted?: boolean;
}

export interface HealthReceipt {
  receiptId: string;
  date: string;
  totalScore: number;
  previousScore?: number;
  startingBaseScore: number;
  items: HealthReceiptItem[];
  prescriptions: PrescriptionTask[];
  grade: "A" | "B" | "C" | "D";
  gradeLabel: string;
  statusMessage: string;
  generatedAt: string;
}

export interface GardenItem {
  id: string;
  name: string;
  emoji: string;
  type: "healthy" | "unhealthy";
  category?: "sleep" | "nutrition" | "activity" | "hydration" | "streak";
  sourceDate: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  createdAt?: string;
}

export interface AdviceOption {
  question: string;
  category: "food" | "workout" | "sleep" | "drinks" | "cheat_meal";
}

export interface AdviceResponse {
  id: string;
  question: string;
  verdict: "YES" | "AVOID_TODAY" | "SWAP_ALTERNATIVE" | "GO_AHEAD_WITH_MODERATION";
  headline: string;
  reasoning: string;
  compensationTip: string;
  adjustedHPImpact: number;
  timestamp: string;
}
