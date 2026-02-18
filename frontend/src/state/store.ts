import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Asset } from "../models/asset";

type GoalsState = {
    shortTerm?: {
        targetNetWorth: number;
        targetDate: Date;
        monthlyContribution?: number;
    };
    longTerm?: {
        targetNetWorth: number,
        targetDate: Date;
        riskTolerance: "low" | "medium" | "high";
    };
};

type StoreState = {
    assets: Asset[];
    goals: GoalsState;
    addAsset: (a: Asset) => void;
    removeAsset: (id: string) => void;
    setGoals: (g: GoalsState) => void;
    reset: () => void;
};

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      assets: [],
      goals: {},
      addAsset: (a) =>
        set((s) => ({ assets: [a, ...s.assets] })), // prepend newest
      removeAsset: (id) =>
        set((s) => ({ assets: s.assets.filter((x) => x.id !== id) })),
      setGoals: (g) => set(() => ({ goals: g })),
      reset: () => set(() => ({ assets: [], goals: {} })),
    }),
    { name: "finance-coach-store" }
  )
);