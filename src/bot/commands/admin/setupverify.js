const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    name: "setupverify",
    description: "Creates the verification panel",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle("🛡️ Server Verification")
            .setDescription("To access the server, please click the button below to prove you are human.")
            .setColor("#00FF00")
            .setFooter({ text: "Anti-Raid System Active" });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_btn')
                    .setLabel('Verify Me')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

        await message.channel.send({ embeds: [embed], components: [row] });
        message.delete(); // Hide the command usage
    }
};
