const GuildConfig = require('../../../models/GuildConfig');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "whitelistrole",
    description: "Allow a role to bypass Auto-Mod",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const role = message.mentions.roles.first();
        if (!role) return message.reply("Usage: !whitelistrole @Role");

        // Toggle logic: if in list, remove it. If not, add it.
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        let isWhitelisted = config.whitelistedRoles.includes(role.id);

        if (isWhitelisted) {
            await GuildConfig.updateOne(
                { guildId: message.guild.id },
                { $pull: { whitelistedRoles: role.id } }
            );
            message.reply(`🛡️ **Updated:** ${role.name} can no longer bypass Auto-Mod.`);
        } else {
            await GuildConfig.updateOne(
                { guildId: message.guild.id },
                { $addToSet: { whitelistedRoles: role.id } }
            );
            message.reply(`🛡️ **Updated:** ${role.name} can now bypass Auto-Mod.`);
        }
    }
};
