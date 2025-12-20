const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "serverinfo",
    aliases: ["si"],
    description: "Display server stats",
    async execute(client, message, args) {
        const guild = message.guild;
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor("Blue")
            .addFields(
                { name: "Owner", value: `${owner.user.tag}`, inline: true },
                { name: "Members", value: `${guild.memberCount}`, inline: true },
                { name: "Created", value: `<t:${parseInt(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: "Roles", value: `${guild.roles.cache.size}`, inline: true },
                { name: "Channels", value: `${guild.channels.cache.size}`, inline: true }
            );

        message.channel.send({ embeds: [embed] });
    }
};
