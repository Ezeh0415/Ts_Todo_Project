import { Response } from "express";
import { z } from "zod";
import { UserModel } from "../../../Modal/UserSchema/User";
import { TaskModel } from "../../../Modal/TaskSchema/Task";
import { AuthRequest } from "../../../../Config/Config/JwtAuth";

const UpdateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // get email from request body and validate it
    const { status, taskId } = z
      .object({
        status: z.enum([
          "in-progress",
          "done",
          "on-hold",
          "blocked",
          "cancelled",
          "archived",
        ]),

        taskId: z.string(),
      })
      .parse(req.body);

    const checkUser = await UserModel.findById(req.user?.userId);

    if (!checkUser) {
      res.status(500).json({ message: "user not found" });
      return;
    }

    const findTask = await TaskModel.find({ _id: taskId });

    if (!findTask) {
      res.status(500).json({ message: "task is missing or not found " });

      return;
    }

    await TaskModel.findByIdAndUpdate(
      taskId, // 1st param: The ID of document to update
      { status }, // 2nd param: The update data
    );

    res.status(200).json({
      success: true,
      message: "status updated successfully",
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

export default UpdateStatus;
