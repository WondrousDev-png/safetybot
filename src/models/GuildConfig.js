// src/models/GuildConfig.js
const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    // Logging & Roles
    logChannelId: { type: String, default: null },
    autoRoleId: { type: String, default: null },
    muteRoleId: { type: String, default: null },
    
    // Auto-Mod Settings
    antiLink: { type: Boolean, default: false },       // Blocks http:// and discord.gg
    antiInvites: { type: Boolean, default: false },    // Blocks specifically discord invites
    antiCaps: { type: Boolean, default: false },       // Blocks MASS CAPS
    badWords: { type: [String], default: [] },         // Array of banned words
    
    // Whitelist (Roles that can bypass)
    whitelistedRoles: { type: [String], default: [] }
});

module.exports = mongoose.model('GuildConfig', configSchema);
