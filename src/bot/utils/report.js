const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

module.exports = {
    name: "report",
    description: "Privately report a user to the server staff",
    async execute(client, message, args) {
        if (!message.guild) return;

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(" ");

        if (!target || !reason) {
            return message.reply("❌ Usage: `!report @User <reason>`");
        }

        // Search for log channel in DB, or fallback to name
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        let reportChannel = null;

        if (config && config.logChannelId) {
            reportChannel = message.guild.channels.cache.get(config.logChannelId);
        }
        
        if (!reportChannel) {
            reportChannel = message.guild.channels.cache.find(c => c.name === "reports" || c.name === "mod-logs");
        }

        if (!reportChannel) {
            return message.reply("❌ Error: Report channel not found. Ask admin to run `!setlog`.");
        }

        const reportEmbed = new EmbedBuilder()
            .setTitle("🚨 New User Report")
            .setColor("#E74C3C")
            .setThumbnail(target.user.displayAvatarURL())
            .addFields(
                { name: "Reported User", value: `${target.user.tag} (ID: ${target.id})`, inline: true },
                { name: "Reported By", value: `${message.author.tag} (ID: ${message.author.id})`, inline: true },
                { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
                { name: "Reason", value: reason }
            )
            .setTimestamp();

        try {
            await reportChannel.send({ embeds: [reportEmbed] });
            
            // Delete reporter's message for privacy
            await message.delete().catch(() => {});
            
            const confirm = await message.channel.send("✅ **Report sent.**");
            setTimeout(() => confirm.delete().catch(() => {}), 5000);

        } catch (error) {
            console.error(error);
            message.channel.send("❌ Failed to send report.");
        }
    }
};
