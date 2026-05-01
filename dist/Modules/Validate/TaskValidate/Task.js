"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string(),
    dueDate: zod_1.z.string(),
    priority: zod_1.z.enum([
        "low",
        "medium",
        "high",
        "urgent",
        "critical",
        "important",
    ]),
    status: zod_1.z.enum([
        "in-progress",
        "done",
        "on-hold",
        "blocked",
        "cancelled",
        "archived",
    ]),
});
