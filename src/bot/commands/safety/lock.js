const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "lock",
    description: "Lock the current channel",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const channel = message.channel;
        const everyone = message.guild.roles.everyone;

        // Overwrite permissions
        await channel.permissionOverwrites.edit(everyone, { SendMessages: false });

        const embed = new EmbedBuilder()
            .setTitle("🔒 CHANNEL LOCKED")
            .setDescription("Use `!unlock` to restore access.")
            .setColor("#FF0000");

        message.channel.send({ embeds: [embed] });
    }
};
