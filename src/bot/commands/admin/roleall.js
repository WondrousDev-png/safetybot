const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "roleall",
    description: "Gives a specific role to EVERYONE (Dangerous)",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const role = message.mentions.roles.first();
        if (!role) return message.reply("Please mention a role.");

        message.reply(`🔄 **Processing:** Giving ${role.name} to all humans... this may take a moment.`);

        const members = await message.guild.members.fetch();
        let count = 0;

        members.forEach(member => {
            if (!member.user.bot && !member.roles.cache.has(role.id)) {
                member.roles.add(role).catch(() => {});
                count++;
            }
        });

        message.channel.send(`✅ Process started for **${count}** members.`);
    }
};
