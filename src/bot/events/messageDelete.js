const GuildConfig = require('../../models/GuildConfig');
const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = async (client, message) => {
    // Basic checks
    if (!message.guild || message.author.bot) return;

    // 1. --- GHOST PING DETECTOR ---
    // If a user is mentioned and the message is deleted quickly (within 20s)
    if (message.mentions.users.size > 0) {
        const timeDiff = Date.now() - message.createdTimestamp;
        
        if (timeDiff < 20000) { 
            const pings = message.mentions.users.map(u => u.tag).join(', ');
            
            const ghostEmbed = new EmbedBuilder()
                .setTitle("👻 Ghost Ping Detected")
                .setColor("Grey")
                .setDescription(`**${message.author.tag}** pinged **${pings}** and deleted it!`)
                .addFields({ name: "Content", value: message.content || "[Media/Embed]" });

            // Send to the channel where it happened
            message.channel.send({ embeds: [ghostEmbed] });
        }
    }

    // 2. --- LOGGING SYSTEM ---
    const config = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!config || !config.logChannelId) return;

    const logChannel = message.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Message Deleted")
        .setColor("Red")
        .addFields(
            { name: "Author", value: `${message.author.tag}`, inline: true },
            { name: "Channel", value: `${message.channel}`, inline: true },
            { name: "Content", value: message.content || "[Image/Embed]" }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
};
