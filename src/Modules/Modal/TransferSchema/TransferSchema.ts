import { Schema, Document, model } from "mongoose";

// Recipient interface based on API response
export interface IRecipient {
    type: string;
    id: string;
    name: object;
    currency: string;
    bank: {
        account_number: string;
        code: string;
    };
}

// Amount interface
export interface IAmount {
    value: number;
    applies_to: string;
}

// Main Transfer interface
export interface ITransfer extends Document {
    userId: string | object;
    amount: number | IAmount;  // Can be simple number or object from API
    trfId: string;              // The transfer ID from Flutterwave (data.id)
    flutterId: string;          // Recipient ID
    status: string;             // Transfer status (NEW, SUCCESSFUL, FAILED)
    narration: string;
    metadata: object;
    idempotencyKey: string;
    traceId: string;
    reference: string;
    action: string;             // "instant", "deferred", "scheduled"
    type: string;               // "bank", "wallet"
    sourceCurrency: string;     // Source currency (e.g., "NGN")
    destinationCurrency: string; // Destination currency
    recipient: IRecipient;      // Full recipient object
    createdDateTime: Date;      // When transfer was created
}

const TransferSchema = new Schema<ITransfer>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Schema.Types.Mixed }, // Can be number or object
        trfId: { type: String, sparse: true, unique: true, default: "" }, // Flutterwave transfer ID
        flutterId: { type: String, required: true }, // Recipient ID
        status: { type: String, required: true, default: "PENDING" },
        narration: { type: String },
        metadata: { type: Object, default: {} },
        idempotencyKey: { type: String, unique: true },
        traceId: { type: String, unique: true },
        reference: { type: String, sparse: true, unique: true, default: "" },
        action: { type: String, default: "instant" },
        type: { type: String, default: "bank" },
        sourceCurrency: { type: String, default: "NGN" },
        destinationCurrency: { type: String, default: "NGN" },
        recipient: {
            type: {
                type: String,
            },
            id: { type: String },
            name: { type: Object },
            currency: { type: String, },
            bank: {
                account_number: { type: String },
                code: { type: String }
            }
        },
        createdDateTime: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

// Create indexes for better query performance
TransferSchema.index({ userId: 1 });
TransferSchema.index({ trfId: 1 });           // Unique index
TransferSchema.index({ reference: 1 });       // Unique index
TransferSchema.index({ idempotencyKey: 1 });  // Unique index (already set, but keep)
TransferSchema.index({ traceId: 1 });
TransferSchema.index({ status: 1 });
TransferSchema.index({ createdAt: -1 });

export const TransferModel = model<ITransfer>("Transfer", TransferSchema);