const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "purge",
    aliases: ["clear", "prune"],
    description: "Delete up to 100 messages",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100.");
        }

        // Delete command message first to clean up
        await message.delete().catch(() => {});

        // Bulk Delete
        const deleted = await message.channel.bulkDelete(amount, true);
        
        const msg = await message.channel.send(`🧹 Deleted **${deleted.size}** messages.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    }
};
