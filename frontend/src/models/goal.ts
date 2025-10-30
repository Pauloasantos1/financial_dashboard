import {z} from 'zod';

export const RiskToleranceEnum = z.enum(["low", "medium", "high"]);

export const ShortTermGoalSchema = z.object({
    targetNetWorth: z.coerce.number().positive(),
    targetDate: z.coerce.date(),
    monthlyContribution: z.coerce.number().nonnegative().optional(),
}).refine(
    (g) => {
        const now = new Date();
        const inOneYear = new Date(now);
        inOneYear.setFullYear(now.getFullYear() + 1);
        return g.targetDate <= inOneYear;
    },
    {message: "Short-term target date should be within 1 year"}
);

export const LongTermGoalSchema = z.object({
    targetNetWorth: z.coerce.number().positive(),
    targetDate: z.coerce.date(), // often many years out
    riskTolerance: RiskToleranceEnum,
});

export const GoalsSchema = z.object({
    shortTerm: ShortTermGoalSchema.optional(),
    longTerm: LongTermGoalSchema.optional(),
}).refine(
    (g) => !!g.shortTerm || !!g.longTerm,
    {message:"Provide at least one goal (short term or long term)."}
);

export type ShortTermGoal = z.infer<typeof ShortTermGoalSchema>;
export type LongTermGoalSchema = z.infer<typeof LongTermGoalSchema>;
export type Goals = z.infer<typeof GoalsSchema>;