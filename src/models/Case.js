const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    caseId: { type: Number, required: true },
    targetId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    type: { type: String, required: true }, // WARN, MUTE, KICK, BAN, JAIL
    reason: { type: String, default: "No reason provided" },
    timestamp: { type: Date, default: Date.now },
    duration: { type: String, default: null },
    active: { type: Boolean, default: true },
    // NEW: Store roles here for Jail/Mute restoration
    previousRoles: { type: [String], default: [] } 
});

module.exports = mongoose.model('Case', caseSchema);
