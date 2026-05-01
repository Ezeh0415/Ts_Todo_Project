"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const User_1 = require("../../../Modal/UserSchema/User");
const Task_1 = require("../../../Modal/TaskSchema/Task");
const UpdateStatus = async (req, res) => {
    try {
        // get email from request body and validate it
        const { status, taskId } = zod_1.z
            .object({
            status: zod_1.z.enum([
                "in-progress",
                "done",
                "on-hold",
                "blocked",
                "cancelled",
                "archived",
            ]),
            taskId: zod_1.z.string(),
        })
            .parse(req.body);
        const checkUser = await User_1.UserModel.findById(req.user?.userId);
        if (!checkUser) {
            res.status(500).json({ message: "user not found" });
            return;
        }
        const findTask = await Task_1.TaskModel.find({ _id: taskId });
        if (!findTask) {
            res.status(500).json({ message: "task is missing or not found " });
            return;
        }
        await Task_1.TaskModel.findByIdAndUpdate(taskId, // 1st param: The ID of document to update
        { status });
        res.status(200).json({
            success: true,
            message: "status updated successfully",
        });
        return;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        return;
    }
};
exports.default = UpdateStatus;
