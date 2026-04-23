import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string(),
  dueDate: z.string(),
  priority: z.enum([
    "low",
    "medium",
    "high",
    "urgent",
    "critical",
    "important",
  ]),
  status: z.enum([
    "in-progress",
    "done",
    "on-hold",
    "blocked",
    "cancelled",
    "archived",
  ]),
});
