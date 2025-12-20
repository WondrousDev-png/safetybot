const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "panic",
    description: "Ban everyone who joined in the last X minutes",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const minutes = parseInt(args[0]);
        if (!minutes || isNaN(minutes)) return message.reply("Usage: !panic <minutes>");

        const now = Date.now();
        const cutoff = now - (minutes * 60 * 1000);

        // Fetch recent members
        // Note: fetch() is needed to get the full list if the server is large
        const members = await message.guild.members.fetch();
        const targets = members.filter(m => m.joinedTimestamp > cutoff && !m.user.bot && m.id !== message.author.id);

        if (targets.size === 0) return message.reply("No recent members found to purge.");

        message.reply(`🚨 **PANIC MODE:** Found ${targets.size} members joined in the last ${minutes} minutes. Banning them...`);

        let banned = 0;
        for (const [id, member] of targets) {
            try {
                await member.ban({ reason: `Panic Mode by ${message.author.tag}` });
                banned++;
            } catch (err) {
                console.log(`Failed to ban ${member.user.tag}`);
            }
        }

        message.channel.send(`✅ **Panic Complete:** Banned ${banned} users.`);
    }
};
