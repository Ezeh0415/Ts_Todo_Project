import { Response } from "express";
import { z } from "zod";
import { createTaskSchema } from "../../../Validate/TaskValidate/Task";
import { TaskModel } from "../../../Modal/TaskSchema/Task";
import { UserModel } from "../../../Modal/UserSchema/User";
import { AuthRequest } from "../../../../Config/Config/JwtAuth";

const CreateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isUser = await UserModel.findById(req.user?.userId);

    if (!isUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const validationData = createTaskSchema.parse(req.body);

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

    const result = await TaskModel.create(Task);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: result,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export default CreateTask;
