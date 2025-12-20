const GuildConfig = require('../../../models/GuildConfig');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "antiinvite",
    description: "Block Discord Invite links",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const newState = !config.antiInvites;

        await GuildConfig.updateOne({ guildId: message.guild.id }, { antiInvites: newState });

        message.reply(newState 
            ? "🔒 **Anti-Invite Enabled:** Discord invites are blocked." 
            : "🔓 **Anti-Invite Disabled.**"
        );
    }
};
