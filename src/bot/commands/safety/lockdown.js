const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: "lockdown",
    aliases: ["lock"],
    description: "Emergency lockdown of the server",
    async execute(client, message, args) {
        // 1. Permission Check
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const channels = message.guild.channels.cache.filter(c => c.isTextBased());
        
        // 2. Loop and Deny
        channels.forEach(channel => {
            channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: false
            });
        });

        const embed = new EmbedBuilder()
            .setTitle("🔒 SERVER LOCKDOWN ACTIVE")
            .setDescription("The server has been locked by administration for safety.")
            .setColor("#FF0000");

        message.channel.send({ embeds: [embed] });
    }
};
