import { Schema, Document, model } from "mongoose";

export interface ITransfer extends Document {
    userId: string | object;
    amount: number | object;
    flutterId: string;
    status: string;
    narration: string;
    metadata: object;
    idempotencyKey: string;
    traceId: string;
    reference: string;
}

const TransferSchema = new Schema<ITransfer>({
    userId: { type: String, required: true },
    amount: { type: Number },
    flutterId: { type: String, required: true },
    status: { type: String },
    narration: { type: String },
    metadata: { type: Object },
    idempotencyKey: { type: String, required: true, unique: true },
    traceId: { type: String, required: true, unique: true },
    reference: { type: String }
}, { timestamps: true });

export const TransferModel = model<ITransfer>("Transfer", TransferSchema);