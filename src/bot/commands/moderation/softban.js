const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "softban",
    description: "Bans and unbans to delete messages (Clean wipe)",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "Softban check";

        if (!target) return message.reply("Usage: !softban @user");

        message.reply(`🧹 **Softbanning ${target.user.tag}...** (Deleting 7 days of messages)`);

        try {
            // Ban with 7 days message deletion
            await target.ban({ deleteMessageSeconds: 604800, reason: `Softban: ${reason}` });
            
            // Unban immediately
            await message.guild.members.unban(target.id, "Softban complete");

            const embed = new EmbedBuilder()
                .setTitle("🧹 User Softbanned")
                .setDescription(`**${target.user.tag}** was scrubbed from the server.`)
                .setColor("Orange");
            
            message.channel.send({ embeds: [embed] });

        } catch (e) {
            console.log(e);
            message.reply("❌ Error: I need higher permissions.");
        }
    }
};
