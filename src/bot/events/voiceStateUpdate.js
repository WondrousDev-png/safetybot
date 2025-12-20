const GuildConfig = require('../../models/GuildConfig');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client, oldState, newState) => {
    const guild = newState.guild;
    
    const config = await GuildConfig.findOne({ guildId: guild.id });
    if (!config || !config.logChannelId) return;

    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    let embed;

    // User Joined VC
    if (!oldState.channelId && newState.channelId) {
        embed = new EmbedBuilder()
            .setTitle("🔊 Joined Voice")
            .setColor("Green")
            .setDescription(`**${newState.member.user.tag}** joined **${newState.channel.name}**`);
    }
    // User Left VC
    else if (oldState.channelId && !newState.channelId) {
        embed = new EmbedBuilder()
            .setTitle("🔇 Left Voice")
            .setColor("Red")
            .setDescription(`**${oldState.member.user.tag}** left **${oldState.channel.name}**`);
    }
    // User Moved
    else if (oldState.channelId !== newState.channelId) {
        embed = new EmbedBuilder()
            .setTitle("🔁 Moved Voice")
            .setColor("Blue")
            .setDescription(`**${newState.member.user.tag}** moved from **${oldState.channel.name}** to **${newState.channel.name}**`);
    }

    if (embed) logChannel.send({ embeds: [embed] });
};
