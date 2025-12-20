const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: "unlockcategory",
    description: "Unlock all channels in the current category",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const category = message.channel.parent;
        if (!category) return message.reply("This channel is not in a category.");

        message.reply(`🔓 **Unlocking Category:** ${category.name}...`);

        category.children.cache.forEach(async (channel) => {
            if (channel.type === ChannelType.GuildText) {
                await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: null // Reset to default
                });
            }
        });

        message.channel.send(`✅ **${category.name}** is now open.`);
    }
};
