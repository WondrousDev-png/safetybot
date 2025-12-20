const { EmbedBuilder } = require('discord.js');
const moment = require('moment'); // You might need: npm install moment

module.exports = {
    name: "whois",
    aliases: ["userinfo", "ui"],
    description: "Get info on a user",
    async execute(client, message, args) {
        const target = message.mentions.members.first() || message.member;
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: target.user.tag, iconURL: target.user.displayAvatarURL() })
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .setColor(target.displayHexColor)
            .addFields(
                { name: "Joined Server", value: `<t:${parseInt(target.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: "Account Created", value: `<t:${parseInt(target.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: "Roles", value: target.roles.cache.map(r => r).join(' ').substring(0, 1024) || "None" }
            )
            .setFooter({ text: `ID: ${target.id}` });

        message.channel.send({ embeds: [embed] });
    }
};
