// src/bot/events/interactionCreate.js
const { InteractionType } = require('discord.js');

module.exports = async (client, interaction) => {
    // Handle Button Clicks
    if (interaction.isButton()) {
        if (interaction.customId === 'verify_btn') {
            const member = interaction.member;
            const guild = interaction.guild;

            // Check if they are already verified
            const verifiedRole = guild.roles.cache.find(r => r.name === "Member"); 
            const unverifiedRole = guild.roles.cache.find(r => r.name === "Unverified");

            if (!verifiedRole) {
                return interaction.reply({ content: "❌ Error: 'Member' role not found. Ask an admin.", ephemeral: true });
            }

            // Swap Roles
            await member.roles.add(verifiedRole);
            if (unverifiedRole) await member.roles.remove(unverifiedRole);

            return interaction.reply({ content: "✅ **Verified!** You now have access.", ephemeral: true });
        }
    }
};
