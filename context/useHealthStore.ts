"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AdviceResponse, DailyLog, HealthReceipt, UserProfile } from "@/types/health";
import { generateDailyReceipt } from "@/lib/health-calculator";
import { format, subDays } from "date-fns";

export const getTodayString = () => format(new Date(), "yyyy-MM-dd");

export const DEFAULT_LOG: Omit<DailyLog, "date" | "updatedAt"> = {
  sleepHours: 7.5,
  calories: 2000,
  macros: {
    carbs: 220,
    protein: 130,
    fat: 65,
  },
  ateOutside: false,
  ultraProcessed: false,
  healthyEatingScore: 8,
  steps: 8500,
  workoutMinutes: 40,
  workoutType: "Strength & Conditioning",
  waterLiters: 2.5,
  completedPrescriptions: [],
  activeCustomTasks: [],
  loggedAdviceActions: [],
};

interface HealthState {
  isOnboarded: boolean;
  userProfile: UserProfile | null;
  selectedDate: string;
  dailyLogs: Record<string, DailyLog>;
  activeTab: "today" | "garden" | "focus" | "advisor" | "profile";
  focusCompletedByDate: Record<string, boolean>;
  isEntryModalOpen: boolean;
  entryMode: "manual" | "voice";
  entryTargetDate: string | null;
  isReceiptModalOpen: boolean;
  selectedReceiptDate: string | null;
  adviceHistory: AdviceResponse[];

  // Actions
  setOnboarded: (status: boolean) => void;
  setUserProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: "today" | "garden" | "focus" | "advisor" | "profile") => void;
  toggleFocusCompleted: (date: string) => void;
  setIsEntryModalOpen: (open: boolean, mode?: "manual" | "voice", targetDate?: string) => void;
  setIsReceiptModalOpen: (open: boolean, date?: string) => void;
  saveDailyLog: (date: string, partial: Partial<DailyLog>) => void;
  getLogForDate: (date: string) => DailyLog;
  getReceiptForDate: (date: string) => HealthReceipt;
  togglePrescriptionCompleted: (date: string, taskId: string) => void;
  addAdvice: (advice: AdviceResponse) => void;
  seedDemoHistory: () => void;
  resetAllData: () => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      userProfile: null,
      selectedDate: getTodayString(),
      dailyLogs: {},
      activeTab: "today",
      focusCompletedByDate: {},
      isEntryModalOpen: false,
      entryMode: "manual",
      entryTargetDate: null,
      isReceiptModalOpen: false,
      selectedReceiptDate: null,
      adviceHistory: [],

      setOnboarded: (status) => set({ isOnboarded: status }),

      setUserProfile: (profile) => set({ userProfile: profile, isOnboarded: true }),

      updateProfile: (partial) =>
        set((state) => ({
          userProfile: state.userProfile ? { ...state.userProfile, ...partial } : null,
        })),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      toggleFocusCompleted: (date) =>
        set((state) => {
          const current = !!state.focusCompletedByDate[date];
          return {
            focusCompletedByDate: {
              ...state.focusCompletedByDate,
              [date]: !current,
            },
          };
        }),

      setIsEntryModalOpen: (open, mode = "manual", targetDate) =>
        set((state) => ({
          isEntryModalOpen: open,
          entryMode: mode,
          entryTargetDate: open ? targetDate || state.selectedDate : null,
        })),

      setIsReceiptModalOpen: (open, date) =>
        set({
          isReceiptModalOpen: open,
          selectedReceiptDate: date || get().selectedDate,
        }),

      saveDailyLog: (date, partial) => {
        const state = get();
        const existing = state.dailyLogs[date] || {
          ...DEFAULT_LOG,
          date,
          updatedAt: new Date().toISOString(),
        };

        const updatedLog: DailyLog = {
          ...existing,
          ...partial,
          macros: {
            ...existing.macros,
            ...(partial.macros || {}),
          },
          date,
          updatedAt: new Date().toISOString(),
        };

        set({
          dailyLogs: {
            ...state.dailyLogs,
            [date]: updatedLog,
          },
        });
      },

      getLogForDate: (date) => {
        const state = get();
        if (state.dailyLogs[date]) {
          return state.dailyLogs[date];
        }
        return {
          ...DEFAULT_LOG,
          date,
          updatedAt: new Date().toISOString(),
        };
      },

      getReceiptForDate: (date) => {
        const log = get().getLogForDate(date);
        const profile = get().userProfile;
        
        const prevDate = format(subDays(new Date(date), 1), "yyyy-MM-dd");
        const prevLog = get().dailyLogs[prevDate];
        const prevScore = prevLog ? generateDailyReceipt(prevLog, profile).totalScore : undefined;

        return generateDailyReceipt(log, profile, prevScore);
      },

      togglePrescriptionCompleted: (date, taskId) => {
        const state = get();
        const log = state.getLogForDate(date);
        const currentTasks = log.completedPrescriptions || [];
        const isCompleted = currentTasks.includes(taskId);

        const updatedTasks = isCompleted
          ? currentTasks.filter((id) => id !== taskId)
          : [...currentTasks, taskId];

        state.saveDailyLog(date, { completedPrescriptions: updatedTasks });
      },

      addAdvice: (advice) =>
        set((state) => ({
          adviceHistory: [advice, ...state.adviceHistory.slice(0, 19)],
        })),

      seedDemoHistory: () => {
        const today = new Date();
        const demoLogs: Record<string, DailyLog> = {};
        const demoFocus: Record<string, boolean> = {};

        // Day -6: 63 HP
        const d6 = format(subDays(today, 6), "yyyy-MM-dd");
        demoLogs[d6] = {
          date: d6,
          sleepHours: 5.8,
          calories: 2550,
          macros: { carbs: 290, protein: 110, fat: 85 },
          ateOutside: true,
          ultraProcessed: true,
          healthyEatingScore: 4,
          steps: 3200,
          workoutMinutes: 0,
          waterLiters: 1.8,
          completedPrescriptions: [],
          updatedAt: new Date().toISOString(),
        };
        demoFocus[d6] = true;

        // Day -5: 89 HP
        const d5 = format(subDays(today, 5), "yyyy-MM-dd");
        demoLogs[d5] = {
          date: d5,
          sleepHours: 8.0,
          calories: 2050,
          macros: { carbs: 210, protein: 155, fat: 60 },
          ateOutside: false,
          ultraProcessed: false,
          healthyEatingScore: 9,
          steps: 9800,
          workoutMinutes: 45,
          workoutType: "Upper Body Strength",
          waterLiters: 3.0,
          completedPrescriptions: [],
          updatedAt: new Date().toISOString(),
        };
        demoFocus[d5] = true;

        // Day -4: 100 HP
        const d4 = format(subDays(today, 4), "yyyy-MM-dd");
        demoLogs[d4] = {
          date: d4,
          sleepHours: 8.5,
          calories: 2000,
          macros: { carbs: 220, protein: 150, fat: 60 },
          ateOutside: false,
          ultraProcessed: false,
          healthyEatingScore: 10,
          steps: 11500,
          workoutMinutes: 50,
          workoutType: "HIIT & Core",
          waterLiters: 3.2,
          completedPrescriptions: [],
          updatedAt: new Date().toISOString(),
        };
        demoFocus[d4] = true;

        // Day -3: 83 HP
        const d3 = format(subDays(today, 3), "yyyy-MM-dd");
        demoLogs[d3] = {
          date: d3,
          sleepHours: 7.2,
          calories: 2380,
          macros: { carbs: 260, protein: 125, fat: 75 },
          ateOutside: false,
          ultraProcessed: false,
          healthyEatingScore: 7,
          steps: 7800,
          workoutMinutes: 30,
          workoutType: "Jogging",
          waterLiters: 2.4,
          completedPrescriptions: [],
          updatedAt: new Date().toISOString(),
        };
        demoFocus[d3] = true;

        // Day -2: 95 HP
        const d2 = format(subDays(today, 2), "yyyy-MM-dd");
        demoLogs[d2] = {
          date: d2,
          sleepHours: 8.0,
          calories: 1950,
          macros: { carbs: 190, protein: 160, fat: 55 },
          ateOutside: false,
          ultraProcessed: false,
          healthyEatingScore: 9,
          steps: 10200,
          workoutMinutes: 45,
          workoutType: "Zone 2 Cardio",
          waterLiters: 3.0,
          completedPrescriptions: [],
          updatedAt: new Date().toISOString(),
        };
        demoFocus[d2] = true;

        // Day -1: 48 HP
        const d1 = format(subDays(today, 1), "yyyy-MM-dd");
        demoLogs[d1] = {
          date: d1,
          sleepHours: 5.2,
          calories: 2900,
          macros: { carbs: 360, protein: 90, fat: 120 },
          ateOutside: true,
          ultraProcessed: true,
          healthyEatingScore: 3,
          steps: 2400,
          workoutMinutes: 0,
          waterLiters: 1.2,
          completedPrescriptions: [],
          updatedAt: new Date().toISOString(),
        };
        demoFocus[d1] = true;

        // Today: 77 HP
        const d0 = format(today, "yyyy-MM-dd");
        demoLogs[d0] = {
          date: d0,
          sleepHours: 7.5,
          calories: 2450,
          macros: { carbs: 270, protein: 125, fat: 85 },
          ateOutside: true,
          ultraProcessed: true,
          healthyEatingScore: 6,
          steps: 5400,
          workoutMinutes: 25,
          waterLiters: 1.4,
          completedPrescriptions: [],
          updatedAt: new Date().toISOString(),
        };
        demoFocus[d0] = false;

        const demoProfile: UserProfile = {
          name: "Alex",
          weightKg: 72,
          heightCm: 178,
          gender: "male",
          focusGoal: "energy_vitality",
          dailyCalorieTarget: 2100,
          dailySleepTargetHours: 8,
          dailyStepsTarget: 8500,
          createdAt: new Date().toISOString(),
        };

        set({
          isOnboarded: true,
          userProfile: demoProfile,
          dailyLogs: demoLogs,
          focusCompletedByDate: demoFocus,
          selectedDate: d0,
        });
      },

      resetAllData: () => {
        set({
          isOnboarded: false,
          userProfile: null,
          dailyLogs: {},
          focusCompletedByDate: {},
          selectedDate: getTodayString(),
          adviceHistory: [],
          activeTab: "today",
        });
      },
    }),
    {
      name: "wearefit_app_storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
