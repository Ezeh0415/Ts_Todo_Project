import { Schema, Document, model } from "mongoose";

export interface ITask extends Document {
  userId: Schema.Types.ObjectId | string;
  userName: string;
  email: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
}

export const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
  },
  { timestamps: true },
);

export const TaskModel = model<ITask>("Task", TaskSchema);
