const GuildConfig = require('../../../models/GuildConfig');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "delword",
    description: "Remove a word from the blacklist",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const word = args[0];
        if (!word) return message.reply("Usage: !delword <word>");

        await GuildConfig.updateOne(
            { guildId: message.guild.id }, 
            { $pull: { badWords: word.toLowerCase() } }
        );

        message.reply(`✅ **Removed:** "${word}" is now allowed.`);
    }
};
