const Warning = require('../../../models/Warning');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid'); // Run 'npm install uuid' if needed, or use random string

module.exports = {
    name: "warn",
    description: "Issue a formal warning to a user",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
            return message.reply("❌ Access Denied.");

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "No reason provided";

        if (!target) return message.reply("Usage: !warn @user <reason>");

        // Generate short ID
        const warnId = Math.random().toString(36).substring(2, 7);

        // Save to DB
        const newWarn = new Warning({
            guildId: message.guild.id,
            userId: target.id,
            moderatorId: message.author.id,
            reason: reason,
            warnId: warnId
        });
        await newWarn.save();

        // Notify
        const embed = new EmbedBuilder()
            .setColor("#E67E22") // Orange
            .setTitle("⚠️ User Warned")
            .setDescription(`**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Warn ID:** \`${warnId}\``);

        message.channel.send({ embeds: [embed] });
        target.send(`You were warned in **${message.guild.name}**: ${reason}`).catch(() => {});
    }
};
