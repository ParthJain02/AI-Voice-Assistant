import { z } from "zod";

export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(60),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
});

export const createReminderSchema = z.object({
  title: z.string().min(1).max(200),
  remindAt: z.string().min(1),
  timezone: z.string().min(1),
  channel: z.enum(["IN_APP", "EMAIL"]).default("IN_APP"),
});

export const updateSettingsSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  voiceEnabled: z.boolean().optional(),
  preferredVoice: z.string().nullable().optional(),
  theme: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
  ttsRate: z.number().min(0.5).max(2).optional(),
  ttsPitch: z.number().min(0).max(2).optional(),
});
