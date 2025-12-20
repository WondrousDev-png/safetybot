const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "unlock",
    description: "Unlock the channel",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const channel = message.channel;
        const everyone = message.guild.roles.everyone;

        // Restore permissions (set to null removes the explicit deny)
        await channel.permissionOverwrites.edit(everyone, { SendMessages: null });

        message.channel.send("🔓 **Channel Unlocked.**");
    }
};
