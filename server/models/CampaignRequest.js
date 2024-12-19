// campaignRequestSchema.js
const mongoose = require('mongoose');

const campaignRequestSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    campaign: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'DEACTIVATED'],
        default: 'PENDING'
    },
    uniqueLink: {
        type: String,
    },
    realRedirectUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('CampaignRequest', campaignRequestSchema);