const { checkSpam } = require('../utils/antiSpam');

// src/bot/events/messageCreate.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

// Helper to calculate Caps Percentage
function isCaps(content) {
    if (content.length < 5) return false;
    const caps = content.replace(/[^A-Z]/g, "").length;
    const total = content.length;
    return (caps / total) > 0.7; // 70% Caps Limit
}



module.exports = async (client, message) => {
    // 1. Basic Checks
    if (message.author.bot || !message.guild) return;

    // 2. Load Config
    let config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!config) {
        // Create default config if missing
        config = await new GuildConfig({ guildId: message.guild.id }).save();
    }

    // 3. --- AUTO-MODERATION LAYER ---
    // Skip automod for Admins or Whitelisted Roles
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isWhitelisted = config.whitelistedRoles.some(rId => message.member.roles.cache.has(rId));

    if (!isAdmin && !isWhitelisted) {

        // ... inside module.exports ...
    // 0. Anti-Spam Check
    const isSpam = await checkSpam(client, message);
    if (isSpam) return; // If spam, stop everything else
// ... continue with Anti-Link checks ...
        
        // A. Anti-Link (Http/Https/WWW)
        if (config.antiLink) {
            const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
            if (linkRegex.test(message.content)) {
                await message.delete().catch(() => {});
                return message.channel.send(`⚠️ **${message.author}**, links are not allowed here.`);
            }
        }

        // B. Anti-Discord Invites (discord.gg)
        if (config.antiInvites) {
            const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)/gi;
            if (inviteRegex.test(message.content)) {
                await message.delete().catch(() => {});
                return message.channel.send(`⚠️ **${message.author}**, do not advertise other servers.`);
            }
        }

        // C. Bad Words (Blacklist)
        if (config.badWords.length > 0) {
            const contentLower = message.content.toLowerCase();
            const foundBadWord = config.badWords.some(word => contentLower.includes(word.toLowerCase()));
            
            if (foundBadWord) {
                await message.delete().catch(() => {});
                return message.channel.send(`⚠️ **${message.author}**, watch your language.`);
            }
        }

        // D. Anti-Caps
        if (config.antiCaps && isCaps(message.content)) {
            await message.delete().catch(() => {});
            return message.channel.send(`⚠️ **${message.author}**, please stop shouting.`);
        }
    }

    // ... previous code (Auto-Mod checks) ...

    // 4. --- COMMAND HANDLER & SELF DEFENSE ---
    
    // DEFENSE 1: Ignore all other bots (Prevents loops)
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // DEFENSE 2: Command Cooldowns (In-Memory)
    // Structure: client.cooldowns = Collection(commandName => Collection(userId => timestamp))
    if (!client.cooldowns) client.cooldowns = new Map();

    if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Map());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 2) * 1000; // Default 2 seconds

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            // React with hour glass to show they are being rate limited (Clean UI)
            return message.react('⏳'); 
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // EXECUTE
    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }

};
