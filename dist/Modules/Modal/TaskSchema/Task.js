"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = exports.TaskSchema = void 0;
const mongoose_1 = require("mongoose");
exports.TaskSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent", "critical", "important"],
        required: true,
    },
    status: {
        type: String,
        enum: [
            "in-progress",
            "done",
            "on-hold",
            "blocked",
            "cancelled",
            "archived",
        ],
        required: true,
        default: "in-Progress",
    },
}, { timestamps: true });
exports.TaskModel = (0, mongoose_1.model)("Task", exports.TaskSchema);
