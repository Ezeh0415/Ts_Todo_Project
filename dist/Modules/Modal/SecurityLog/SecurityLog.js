"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLog = void 0;
const mongoose_1 = require("mongoose");
const SecurityLogSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, ref: 'User' },
    action: { type: String, required: true },
    status: { type: String, required: true, enum: ['success', 'failed'] },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed, // Flexible object
        required: false,
        default: {}
    }
}, {
    timestamps: true // Only this goes in SchemaOptions
});
//  Add indexes AFTER schema definition
SecurityLogSchema.index({ userId: 1 }); // Index for user queries
SecurityLogSchema.index({ timestamp: -1 }); // Index for time sorting
SecurityLogSchema.index({ action: 1 }); // Index for filtering by action
SecurityLogSchema.index({ userId: 1, timestamp: -1 }); // Compound index
exports.SecurityLog = (0, mongoose_1.model)('SecurityLog', SecurityLogSchema);
