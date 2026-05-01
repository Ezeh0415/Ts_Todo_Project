"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const Task_1 = require("../../../Validate/TaskValidate/Task");
const Task_2 = require("../../../Modal/TaskSchema/Task");
const User_1 = require("../../../Modal/UserSchema/User");
const CreateTask = async (req, res) => {
    try {
        const isUser = await User_1.UserModel.findById(req.user?.userId);
        if (!isUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const validationData = Task_1.createTaskSchema.parse(req.body);
        const { title, description, dueDate, priority, status } = validationData;
        const Task = {
            userId: req.user?.userId,
            userName: isUser.name,
            email: isUser.email,
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            status: status,
        };
        const result = await Task_2.TaskModel.create(Task);
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: result,
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
exports.default = CreateTask;
