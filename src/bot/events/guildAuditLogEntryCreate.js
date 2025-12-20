const { AuditLogEvent, EmbedBuilder } = require('discord.js');

// --- THE SAFETY MATRIX ---
// Tracks actions in memory to detect spam/nuking
const limits = {
    bans: new Map(),
    kicks: new Map(),
    channelCreates: new Map(),
    channelDeletes: new Map(),
    roleDeletes: new Map(),
    webhookCreates: new Map()
};

const CONFIG = {
    banLimit: 3,        // Max bans per 10 seconds
    channelLimit: 2,    // Max channel deletions per 10 seconds
    roleLimit: 2,       // Max role deletions per 10 seconds
    timeWindow: 10000   // 10 Seconds
};

module.exports = async (client, auditLogEntry, guild) => {
    const { action, executorId, targetId } = auditLogEntry;
    
    // Ignore the Bot itself and the Server Owner (Safety Bypass)
    if (executorId === client.user.id || executorId === guild.ownerId) return;

    const now = Date.now();
    const executor = await guild.members.fetch(executorId).catch(() => null);
    if (!executor) return;

    // Helper to check limits
    const checkLimit = async (map, key, limit, type) => {
        if (!map.has(key)) map.set(key, []);
        const userActions = map.get(key);
        
        // Filter out old actions
        const recentActions = userActions.filter(timestamp => now - timestamp < CONFIG.timeWindow);
        recentActions.push(now);
        map.set(key, recentActions);

        // --- PUNISHMENT TRIGGER ---
        if (recentActions.length > limit) {
            console.log(`🚨 ANTI-NUKE TRIGGERED: ${type} by ${executor.user.tag}`);
            
            // 1. Remove All Roles (Strip power)
            await executor.roles.set([]).catch(e => console.log('Failed to strip roles'));
            
            // 2. Ban the user
            await guild.members.ban(executorId, { reason: `Anti-Nuke: Exceeded ${type} limits` }).catch(e => console.log('Failed to ban'));
            
            // 3. Panic Mode: Enable Lockdown (Optional)
            // You can call a function here to lock all channels
        }
    };

    // Route actions to checks
    switch (action) {
        case AuditLogEvent.MemberBanAdd:
            await checkLimit(limits.bans, executorId, CONFIG.banLimit, "Mass Ban");
            break;
        case AuditLogEvent.MemberKick:
            await checkLimit(limits.kicks, executorId, CONFIG.banLimit, "Mass Kick");
            break;
        case AuditLogEvent.ChannelDelete:
            await checkLimit(limits.channelDeletes, executorId, CONFIG.channelLimit, "Channel Nuke");
            break;
        case AuditLogEvent.RoleDelete:
            await checkLimit(limits.roleDeletes, executorId, CONFIG.roleLimit, "Role Nuke");
            break;
        case AuditLogEvent.WebhookCreate:
            await checkLimit(limits.webhookCreates, executorId, CONFIG.channelLimit, "Webhook Spam");
            break;
    }
};
