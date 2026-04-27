import { Schema, Document, model } from "mongoose";

export interface ISecurityLog extends Document {
    userId: string;
    action: string;
    status: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    metadata?: Record<string, any>; 
}

const SecurityLogSchema = new Schema<ISecurityLog>(
    {
        userId: { type: String, required: true, ref: 'User' },
        action: { type: String, required: true },
        status: { type: String, required: true, enum: ['success', 'failed'] },
        ipAddress: { type: String, required: true },
        userAgent: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        metadata: { 
            type: Schema.Types.Mixed,  // Flexible object
            required: false,
            default: {}
        }
    },
    {
        timestamps: true  // Only this goes in SchemaOptions
    }
);

//  Add indexes AFTER schema definition
SecurityLogSchema.index({ userId: 1 });           // Index for user queries
SecurityLogSchema.index({ timestamp: -1 });       // Index for time sorting
SecurityLogSchema.index({ action: 1 });           // Index for filtering by action
SecurityLogSchema.index({ userId: 1, timestamp: -1 }); // Compound index

export const SecurityLog = model<ISecurityLog>('SecurityLog', SecurityLogSchema);