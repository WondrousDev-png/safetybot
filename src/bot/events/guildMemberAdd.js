const { EmbedBuilder } = require('discord.js');
const Case = require('../../models/Case');
const GuildConfig = require('../../models/GuildConfig');
const { ensureRole } = require('../utils/roleFactory'); // Corrected path to 'utils'

// MEMORY FOR RAID DETECTION
const joinCache = new Map(); 
const RAID_THRESHOLD = 10;   
const RAID_TIME = 10000;     

module.exports = async (client, member) => {
    const guild = member.guild;
    const now = Date.now();

    // 1. --- ANTI-BOT CHECK ---
    if (member.user.bot) return; // We ignore bots for now (or add logic to kick unverified bots)

    // 2. --- ALT ACCOUNT DETECTOR ---
    const accountCreated = member.user.createdTimestamp;
    const accountAgeDays = (now - accountCreated) / (1000 * 60 * 60 * 24);
    const MIN_AGE_DAYS = 7; 

    if (accountAgeDays < MIN_AGE_DAYS) {
        try {
            await member.send(`⚠️ **Security Alert:** You were kicked from **${guild.name}** because your account is too new (< ${MIN_AGE_DAYS} days).`);
            await member.kick('Auto-Kick: Alt Account Detected');
            return; 
        } catch (e) {
            console.log(`Could not DM or kick ${member.user.tag}`);
        }
    }

    // 3. --- MUTE PERSISTENCE (Anti-Evasion) ---
    // Check if they are trying to evade a mute by rejoining
    const activeMute = await Case.findOne({ 
        guildId: guild.id, 
        targetId: member.id, 
        type: 'MUTE',
        active: true 
    });

    if (activeMute) {
        const muteRole = await ensureRole(guild, "Muted", "MUTED");
        await member.roles.add(muteRole).catch(e => console.log("Failed to re-apply mute"));
        
        // Log it if possible
        const config = await GuildConfig.findOne({ guildId: guild.id });
        if (config && config.logChannelId) {
            const logChannel = guild.channels.cache.get(config.logChannelId);
            if (logChannel) logChannel.send(`🚨 **Evasion Detected:** ${member.user.tag} rejoined but is still muted. Role re-applied.`);
        }
    }

    // 4. --- AUTO RAID MODE ---
    if (!joinCache.has(guild.id)) joinCache.set(guild.id, []);
    const joins = joinCache.get(guild.id);
    
    const recentJoins = joins.filter(t => now - t < RAID_TIME);
    recentJoins.push(now);
    joinCache.set(guild.id, recentJoins);

    if (recentJoins.length > RAID_THRESHOLD) {
        const channel = guild.systemChannel || guild.channels.cache.first();
        if (channel) channel.send("🚨 **RAID DETECTED!** High join rate. Enabling strict verification automatically.");
    }

    // 5. --- ROLE ASSIGNMENT (Auto-Role & Verification) ---
    // A. Give "Unverified" role by default (Gatekeeper)
    let unverifiedRole = guild.roles.cache.find(r => r.name === "Unverified");
    if (!unverifiedRole) {
        unverifiedRole = await guild.roles.create({ name: "Unverified", permissions: [] });
    }
    await member.roles.add(unverifiedRole);

    // B. Auto-Role (If configured in DB)
    const config = await GuildConfig.findOne({ guildId: guild.id });
    if (config && config.autoRoleId) {
        const autoRole = guild.roles.cache.get(config.autoRoleId);
        if (autoRole) await member.roles.add(autoRole).catch(() => {});
    }
};
