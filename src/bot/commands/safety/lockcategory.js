const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: "lockcategory",
    description: "Lock ALL channels in the current category",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const category = message.channel.parent;
        if (!category) return message.reply("This channel is not in a category.");

        message.reply(`🔒 **Locking Down Category:** ${category.name}...`);

        // Loop through children
        category.children.cache.forEach(async (channel) => {
            if (channel.type === ChannelType.GuildText) {
                await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: false
                }).catch(e => console.log(`Failed to lock ${channel.name}`));
            }
        });

        message.channel.send(`✅ **${category.name}** is now on lockdown.`);
    }
};
