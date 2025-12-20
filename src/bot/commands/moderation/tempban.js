const { PermissionsBitField, EmbedBuilder } = require('discord.js');

// Helper to parse time
function parseTime(str) {
    const unit = str.slice(-1);
    const value = parseInt(str.slice(0, -1));
    if (isNaN(value)) return null;
    if (unit === 'm') return value * 60 * 1000;
    if (unit === 'h') return value * 60 * 60 * 1000;
    if (unit === 'd') return value * 24 * 60 * 60 * 1000;
    return null;
}

module.exports = {
    name: "tempban",
    description: "Ban a user for a set amount of time",
    async execute(client, message, args) {
        // 1. Permission Check
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
            return message.reply("❌ Access Denied.");

        const target = message.mentions.members.first();
        const timeStr = args[1];
        const reason = args.slice(2).join(" ") || "Tempban";

        if (!target || !timeStr) return message.reply("Usage: !tempban @user <1d/1h> [reason]");

        const duration = parseTime(timeStr);
        if (!duration) return message.reply("Invalid time. Use 1h, 1d, 7d.");

        // 2. Perform Ban
        try {
            await target.send(`You have been banned from **${message.guild.name}** for **${timeStr}**. Reason: ${reason}`).catch(() => {});
            await message.guild.members.ban(target, { reason: `Tempban: ${reason}` });
            
            message.channel.send(`⛔ **${target.user.tag}** has been banned for ${timeStr}.`);

            // 3. Set Timeout for Unban
            // Note: If the bot restarts, this timeout is lost. 
            // For a production bot, you would save this to the Database and have a 'setInterval' check every minute.
            // But for this script, we use a simple timeout.
            setTimeout(async () => {
                try {
                    await message.guild.members.unban(target.id, "Tempban expired");
                    console.log(`Auto-unbanned ${target.user.tag}`);
                } catch (e) {
                    console.log(`Failed to auto-unban ${target.id}`);
                }
            }, duration);

        } catch (e) {
            console.error(e);
            message.reply("❌ I cannot ban this user (Hierarchy error).");
        }
    }
};
