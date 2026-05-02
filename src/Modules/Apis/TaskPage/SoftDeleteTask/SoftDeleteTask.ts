import { Request, Response } from "express";
import { z } from "zod";
import { TaskModel } from "../../../Modal/TaskSchema/Task";


const softDelete = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskId } = z
            .object({
                taskId: z.string(),
            })
            .parse(req.body);

        const findTask = await TaskModel.find({ _id: taskId });

        if (!findTask) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        await TaskModel.updateOne({ _id: taskId }, { softDelete: true });

        res.status(200).json({ message: "Task soft deleted successfully" });
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
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
}

export default softDelete;