const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Case = require('../../../models/Case');

module.exports = {
    name: "unjail",
    description: "Release a user and restore their roles",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;

        const target = message.mentions.members.first();
        if (!target) return message.reply("Usage: !unjail @user");

        // 1. Find the active Jail record
        const jailRecord = await Case.findOne({
            guildId: message.guild.id,
            targetId: target.id,
            type: "JAIL",
            active: true
        });

        if (!jailRecord) return message.reply("❌ This user is not jailed (according to my database).");

        message.channel.send(`🔓 **Releasing ${target.user.tag}...**`);

        // 2. Remove Jail Role
        const jailRole = message.guild.roles.cache.find(r => r.name === "Jailed");
        if (jailRole) await target.roles.remove(jailRole);

        // 3. Restore Old Roles
        if (jailRecord.previousRoles && jailRecord.previousRoles.length > 0) {
            await target.roles.add(jailRecord.previousRoles).catch(e => 
                message.channel.send("⚠️ Could not restore some roles (I might be ranked too low).")
            );
        }

        // 4. Close Case
        jailRecord.active = false;
        await jailRecord.save();

        message.channel.send("✅ **User Unjailed and roles restored.**");
    }
};
