import { Schema, Document, model } from "mongoose";

export interface ITransfer extends Document {
    userId: string | object;
    amount: number | object;
    flutterId: string;
    status: string;
    narration: string;
    metadata: object;
}

const TransferSchema = new Schema<ITransfer>({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    flutterId: { type: String, required: true },
    status: { type: String, required: true },
    narration: { type: String, required: true },
    metadata: { type: Object },
}, { timestamps: true });

export const TransferModel = model<ITransfer>("Transfer", TransferSchema);