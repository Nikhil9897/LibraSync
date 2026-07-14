const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true },
        entity: String,
        entityId: mongoose.Schema.Types.ObjectId,
        metadata: mongoose.Schema.Types.Mixed,
        ipAddress: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
