const GuildConfig = require('../../../models/GuildConfig');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "setlog",
    description: "Sets the channel for audit logs",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return;

        const channel = message.mentions.channels.first() || message.channel;

        await GuildConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { logChannelId: channel.id },
            { upsert: true, new: true }
        );

        message.reply(`✅ **Logging Active:** All events will be sent to ${channel}.`);
    }
};
