import { Schema, Document, model } from "mongoose";

export interface IPayment extends Document {
    reference: string;
    accessCode: string;
    paymentRef: string;
    authorizationCode: string;
    userId: string | object;
    amount: number;
    amountInKobo: number;
    customerEmail: string;
    customerName: string;
    status: string;
}

const PaymentSchema = new Schema<IPayment>({
    reference: { type: String, required: true },
    accessCode: { type: String, required: true },
    paymentRef: { type: String, required: true },
    authorizationCode: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    amountInKobo: { type: Number, required: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    status: { type: String, required: true },
}, { timestamps: true });

export const PaymentModel = model<IPayment>("Payment", PaymentSchema);