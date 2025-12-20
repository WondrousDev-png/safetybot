const GuildConfig = require('../../../models/GuildConfig');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "antilink",
    description: "Toggle the Anti-Link system",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        const newState = !config.antiLink;

        await GuildConfig.updateOne({ guildId: message.guild.id }, { antiLink: newState });

        message.reply(newState 
            ? "🔒 **Anti-Link Enabled:** All links will be deleted." 
            : "🔓 **Anti-Link Disabled:** Links are allowed."
        );
    }
};
