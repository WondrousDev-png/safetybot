const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "setup",
    description: "Auto-configures roles and perms",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const guild = message.guild;
        message.reply("⚙️ Scanning server and configuring safety...");

        // 1. Create Muted Role if not exists
        let muteRole = guild.roles.cache.find(r => r.name === "Muted");
        if (!muteRole) {
            muteRole = await guild.roles.create({
                name: "Muted",
                color: "#505050",
                permissions: []
            });
            // Update all channels to deny talking for Muted
            guild.channels.cache.forEach(c => {
                c.permissionOverwrites.create(muteRole, { SendMessages: false, AddReactions: false });
            });
        }

        // 2. Create Mod Logs
        if (!guild.channels.cache.find(c => c.name === "mod-logs")) {
            await guild.channels.create({ 
                name: "mod-logs", 
                permissionOverwrites: [{ id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }]
            });
        }

        message.channel.send("✅ Server Safety Structure Initialized.");
    }
};
