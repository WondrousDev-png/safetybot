const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "nukechannel",
    aliases: ["nuke"],
    description: "Wipes a channel completely by cloning it",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

        const channel = message.channel;
        const position = channel.position;

        message.channel.send("💥 **Nuking Channel...**");

        // Clone
        const newChannel = await channel.clone();
        
        // Set position to match old one
        await newChannel.setPosition(position);
        
        // Delete old
        await channel.delete();

        // Post 'First' message
        newChannel.send("💥 **Channel Nuked.** https://tenor.com/view/explosion-mushroom-cloud-atomic-bomb-bomb-gif-4464831");
    }
};
