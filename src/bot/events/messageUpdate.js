const GuildConfig = require('../../models/GuildConfig');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {
    if (oldMessage.author.bot || !oldMessage.guild) return;
    if (oldMessage.content === newMessage.content) return; // Ignore embed updates

    const config = await GuildConfig.findOne({ guildId: oldMessage.guild.id });
    if (!config || !config.logChannelId) return;

    const logChannel = oldMessage.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("✏️ Message Edited")
        .setColor("Yellow")
        .setDescription(`**Channel:** ${oldMessage.channel}\n**User:** ${oldMessage.author.tag}`)
        .addFields(
            { name: "Before", value: oldMessage.content || "[Media]" },
            { name: "After", value: newMessage.content || "[Media]" }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
};
