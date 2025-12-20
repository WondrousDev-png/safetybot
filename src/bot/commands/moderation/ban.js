const Case = require('../../../models/Case');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "ban",
    description: "Bans a user (even if not in server)",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
            return message.reply("❌ Access Denied.");

        const targetId = args[0]?.replace(/[<@!>]/g, ''); // Clean ID
        const reason = args.slice(1).join(" ") || "No reason provided";

        if (!targetId) return message.reply("Usage: !ban <id/mention> [reason]");

        try {
            // Fetch user object even if not in server
            const user = await client.users.fetch(targetId);

            // Execute Ban
            await message.guild.members.ban(targetId, { reason: `[${message.author.tag}] ${reason}` });

            // Log to DB
            const caseCount = await Case.countDocuments({ guildId: message.guild.id });
            await new Case({
                guildId: message.guild.id,
                caseId: caseCount + 1,
                type: "BAN",
                targetId: user.id,
                targetTag: user.tag,
                moderatorId: message.author.id,
                moderatorTag: message.author.tag,
                reason: reason
            }).save();

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`Case #${caseCount + 1} | Banned`)
                .setDescription(`🚫 **${user.tag}** has been hammered.\nReason: ${reason}`);

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply("❌ Failed to ban. Is the ID correct? Do I have higher roles?");
        }
    }
};
