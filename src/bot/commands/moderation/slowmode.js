const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "slowmode",
    aliases: ["slow"],
    description: "Set channel cooldown",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        let time = parseInt(args[0]);
        if (isNaN(time)) return message.reply("Usage: !slowmode <seconds> (0 to disable)");
        if (time > 21600) return message.reply("Max slowmode is 21600 seconds (6 hours).");

        await message.channel.setRateLimitPerUser(time);

        if (time === 0) {
            message.channel.send("🐢 **Slowmode Disabled.**");
        } else {
            message.channel.send(`🐢 **Slowmode Active:** One message every ${time} seconds.`);
        }
    }
};
