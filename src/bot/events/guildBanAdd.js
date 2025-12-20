const { AuditLogEvent, EmbedBuilder } = require('discord.js');

// MEMORY TRACKER: userId => [timestamp, timestamp]
const banTracker = new Map();
const LIMIT = 3;        // Max bans allowed
const WINDOW = 10000;   // In 10 seconds

module.exports = async (client, ban) => {
    const guild = ban.guild;

    // 1. Fetch Audit Log to see WHO did the ban
    // We wait a tiny bit to ensure the log is generated
    setTimeout(async () => {
        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd,
        });

        const banLog = fetchedLogs.entries.first();
        if (!banLog) return;

        const executor = banLog.executor;
        if (!executor || executor.bot) return; // Ignore bots (or self)

        // 2. Update Tracker
        const now = Date.now();
        if (!banTracker.has(executor.id)) banTracker.set(executor.id, []);
        
        const timestamps = banTracker.get(executor.id);
        const recentBans = timestamps.filter(t => now - t < WINDOW);
        
        recentBans.push(now);
        banTracker.set(executor.id, recentBans);

        // 3. CHECK THRESHOLD
        if (recentBans.length > LIMIT) {
            // 🚨 ROGUE ADMIN DETECTED 🚨
            const member = await guild.members.fetch(executor.id).catch(() => null);
            
            if (member && member.manageable) {
                // A. Strip Roles (Prevent further damage)
                const allRoles = member.roles.cache.filter(r => !r.managed && r.id !== guild.id);
                await member.roles.remove(allRoles).catch(console.error);
                
                // B. Notify Owner/System
                const embed = new EmbedBuilder()
                    .setTitle("🚨 ANTI-NUKE TRIGGERED")
                    .setDescription(`**User:** ${executor.tag}\n**Action:** Mass Banning\n**Result:** Roles Stripped`)
                    .setColor("#FF0000");

                const logChannel = guild.systemChannel || guild.channels.cache.first();
                if (logChannel) logChannel.send({ embeds: [embed] });

                console.log(`Anti-Nuke: Stripped roles from ${executor.tag}`);
            }
        }
    }, 2000); // 2 second delay to ensure log exists
};
