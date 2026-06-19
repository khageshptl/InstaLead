import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
});

export const searchInputSchema = z.object({
  inputType: z.enum([
    "INSTAGRAM_USERNAME",
    "WEBSITE_URL",
    "COMPANY_NAME",
    "BRAND_NAME",
  ]),
  inputValue: z.string().min(1, "Search value is required").max(500),
  projectId: z.string().cuid().optional(),
});

export const savedLeadSchema = z.object({
  searchId: z.string().cuid(),
  contactId: z.string().cuid().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateLeadSchema = z.object({
  tags: z.array(z.string().max(50)).max(20).optional(),
  notes: z.string().max(5000).optional(),
});

export const exportSchema = z.object({
  format: z.enum(["CSV", "EXCEL", "JSON"]),
  filters: z
    .object({
      tags: z.array(z.string()).optional(),
      confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    })
    .optional(),
});

export const reportSchema = z.object({
  searchId: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  includeAiInsights: z.boolean().default(true),
});

export const leadFilterSchema = z.object({
  tags: z.string().optional(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SearchInput = z.infer<typeof searchInputSchema>;
export type SavedLeadInput = z.infer<typeof savedLeadSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
