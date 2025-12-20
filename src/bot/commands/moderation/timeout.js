const { PermissionsBitField } = require('discord.js');
// Helper to parse "10m", "1h"
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
    name: "timeout",
    description: "Time out a user",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        const target = message.mentions.members.first();
        const durationStr = args[1]; // e.g., "10m"
        const reason = args.slice(2).join(" ") || "Timed out";

        if (!target || !durationStr) return message.reply("Usage: !timeout @user <10m/1h> [reason]");

        const ms = parseTime(durationStr);
        if (!ms) return message.reply("Invalid time format. Use 10m, 1h, 1d.");

        try {
            await target.timeout(ms, reason);
            message.reply(`🤐 **${target.user.tag}** has been timed out for ${durationStr}.`);
        } catch (e) {
            message.reply("❌ Cannot timeout this user (Hierarchy error or Admin).");
        }
    }
};
