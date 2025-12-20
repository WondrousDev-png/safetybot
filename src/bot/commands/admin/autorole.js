const GuildConfig = require('../../../models/GuildConfig');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "autorole",
    description: "Sets a role to be given automatically when someone joins",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const role = message.mentions.roles.first();
        if (!role) return message.reply("Usage: !autorole @Role");

        await GuildConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { autoRoleId: role.id },
            { upsert: true, new: true }
        );

        message.reply(`✅ **Auto-Role Set:** New members will get **${role.name}**.`);
    }
};
