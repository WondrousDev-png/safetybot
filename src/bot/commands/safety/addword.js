const GuildConfig = require('../../../models/GuildConfig');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "addword",
    description: "Add a word to the blacklist",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const word = args[0];
        if (!word) return message.reply("Usage: !addword <word>");

        await GuildConfig.updateOne(
            { guildId: message.guild.id }, 
            { $addToSet: { badWords: word.toLowerCase() } } // $addToSet prevents duplicates
        );

        message.reply(`🚫 **Added:** "${word}" is now blacklisted.`);
    }
};
