const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "unmute",
    description: "Removes the Muted role",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        const target = message.mentions.members.first();
        if (!target) return message.reply("Please mention a user.");

        const muteRole = message.guild.roles.cache.find(r => r.name === "Muted");
        if (!muteRole || !target.roles.cache.has(muteRole.id)) {
            return message.reply("User is not muted or role is missing.");
        }

        await target.roles.remove(muteRole);
        message.channel.send(`🔊 **${target.user.tag}** has been unmuted.`);
    }
};
