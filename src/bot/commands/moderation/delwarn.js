const Warning = require('../../../models/Warning');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "delwarn",
    description: "Remove a specific warning by ID",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        const warnId = args[0];
        if (!warnId) return message.reply("Usage: !delwarn <warnID>");

        const result = await Warning.findOneAndDelete({ guildId: message.guild.id, warnId: warnId });

        if (result) {
            message.reply(`✅ Warning \`${warnId}\` removed.`);
        } else {
            message.reply("❌ Warning ID not found.");
        }
    }
};
