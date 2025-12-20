const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Case = require('../../../models/Case');
const { ensureRole } = require('../../utils/roleFactory'); // Ensure you have this utils file

module.exports = {
    name: "jail",
    description: "Strip a user of all roles and isolate them",
    async execute(client, message, args) {
        // 1. Permissions & Input Check
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) 
            return message.reply("❌ Access Denied.");

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "No reason provided";

        if (!target) return message.reply("Usage: !jail @user <reason>");
        
        // Prevent jailing admins
        if (target.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return message.reply("❌ You cannot jail an Administrator.");

        message.channel.send(`🔒 **Processing Jail for ${target.user.tag}...**`);

        // 2. Get/Create 'Jailed' Role
        // This helper function ensures the role exists
        let jailRole = message.guild.roles.cache.find(r => r.name === "Jailed");
        if (!jailRole) {
            try {
                jailRole = await message.guild.roles.create({
                    name: "Jailed",
                    color: "#000000",
                    reason: "Jail System Setup"
                });
                
                // Configure channels to deny view access to Jailed role
                message.guild.channels.cache.forEach(async (channel) => {
                    await channel.permissionOverwrites.create(jailRole, {
                        ViewChannel: false,
                        SendMessages: false
                    }).catch(() => {});
                });
            } catch (e) {
                return message.reply("❌ Error setting up Jail role permissions.");
            }
        }

        // 3. Save Old Roles (excluding @everyone and managed roles)
        const oldRoles = target.roles.cache
            .filter(r => r.id !== message.guild.id && !r.managed)
            .map(r => r.id);

        // 4. Save to Database
        const caseId = Date.now().toString().slice(-6);
        const newCase = new Case({
            guildId: message.guild.id,
            caseId: caseId,
            targetId: target.id,
            moderatorId: message.author.id,
            type: "JAIL",
            reason: reason,
            previousRoles: oldRoles,
            active: true
        });
        await newCase.save();

        // 5. Execute: Strip Roles & Add Jail Role
        try {
            await target.roles.remove(oldRoles).catch(e => console.log("Could not remove some roles"));
            await target.roles.add(jailRole);

            const embed = new EmbedBuilder()
                .setTitle("🔒 User Jailed")
                .setColor("#000000")
                .setDescription(`**Target:** ${target.user.tag}\n**Reason:** ${reason}\n**Case ID:** #${caseId}`);

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply("❌ Bot permission error (Move my role higher!).");
        }
    }
};
