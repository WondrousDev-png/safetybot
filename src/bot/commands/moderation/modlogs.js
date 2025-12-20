const Case = require('../../../models/Case');
const Warning = require('../../../models/Warning');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: "modlogs",
    aliases: ["check"],
    description: "View the full criminal record of a user",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!target) return message.reply("Usage: !modlogs @user (or ID)");

        message.channel.send("🔍 **Searching Database...**");

        // Fetch data in parallel
        const [cases, warnings] = await Promise.all([
            Case.find({ guildId: message.guild.id, targetId: target.id }),
            Warning.find({ guildId: message.guild.id, userId: target.id })
        ]);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Record for ${target.tag}`, iconURL: target.displayAvatarURL() })
            .setColor("#2C3E50")
            .setFooter({ text: `User ID: ${target.id}` })
            .setTimestamp();

        // 1. Summary Stats
        const banCount = cases.filter(c => c.type === 'BAN').length;
        const muteCount = cases.filter(c => c.type === 'MUTE').length;
        const warnCount = warnings.length;

        embed.setDescription(`**Summary:**\n🚫 Bans: ${banCount} | 🔇 Mutes: ${muteCount} | ⚠️ Warnings: ${warnCount}`);

        // 2. Recent Cases (Limit to last 5)
        const recentCases = cases.slice(-5).reverse().map(c => 
            `\`${c.type}\` #${c.caseId}: ${c.reason} (<t:${Math.floor(c.timestamp/1000)}:R>)`
        ).join("\n") || "No heavy punishments.";

        // 3. Recent Warnings (Limit to last 5)
        const recentWarns = warnings.slice(-5).reverse().map(w => 
            `\`WARN\` ${w.reason} (<t:${Math.floor(w.timestamp/1000)}:R>)`
        ).join("\n") || "No active warnings.";

        embed.addFields(
            { name: "Recent Punishments", value: recentCases },
            { name: "Recent Warnings", value: recentWarns }
        );

        message.channel.send({ embeds: [embed] });
    }
};
