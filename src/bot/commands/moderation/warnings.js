const Warning = require('../../../models/Warning');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "warnings",
    aliases: ["warns"],
    description: "Check a user's criminal record",
    async execute(client, message, args) {
        const target = message.mentions.members.first() || message.member;
        
        const warns = await Warning.find({ guildId: message.guild.id, userId: target.id });

        if (warns.length === 0) return message.reply(`✅ **${target.user.tag}** has a clean record.`);

        const embed = new EmbedBuilder()
            .setTitle(`📜 Warning Log: ${target.user.tag}`)
            .setColor("#E67E22");

        // Format list
        const description = warns.map((w, i) => 
            `**${i+1}.** ID: \`${w.warnId}\` | Mod: <@${w.moderatorId}> | "${w.reason}"`
        ).join("\n");

        embed.setDescription(description.substring(0, 4096)); // Discord limit check

        message.channel.send({ embeds: [embed] });
    }
};
