const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "massban",
    description: "Ban multiple users by ID at once",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        if (args.length === 0) return message.reply("Provide IDs separated by spaces.");

        message.channel.send(`🚨 **Processing ${args.length} bans...**`);

        let success = 0;
        let failed = 0;

        for (const id of args) {
            try {
                await message.guild.members.ban(id, { reason: `Massban by ${message.author.tag}` });
                success++;
            } catch (e) {
                failed++;
            }
        }

        message.channel.send(`✅ **Operation Complete:** ${success} Banned | ${failed} Failed`);
    }
};
