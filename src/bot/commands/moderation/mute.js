const Case = require('../../../models/Case');
const { ensureRole } = require('../../utils/roleFactory');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "mute",
    description: "Mutes a member. Auto-creates Muted role if missing.",
    async execute(client, message, args) {
        // 1. Permission Check
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
            return message.reply("❌ You do not have permission to mute.");

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "No reason provided";

        if (!target) return message.reply("Usage: !mute @user [reason]");

        // 2. ROLE FACTORY: Get or Create the "Muted" role
        const muteRole = await ensureRole(message.guild, "Muted", "MUTED");

        // 3. Hierarchy Check
        if (target.roles.highest.position >= message.member.roles.highest.position)
            return message.reply("❌ You cannot mute someone with a higher/equal role.");

        // 4. Apply Mute
        await target.roles.add(muteRole);

        // 5. Database Logging
        const caseCount = await Case.countDocuments({ guildId: message.guild.id });
        const newCase = new Case({
            guildId: message.guild.id,
            caseId: caseCount + 1,
            type: "MUTE",
            targetId: target.id,
            targetTag: target.user.tag,
            moderatorId: message.author.id,
            moderatorTag: message.author.tag,
            reason: reason
        });
        await newCase.save();

        // 6. Response
        const embed = new EmbedBuilder()
            .setColor("#F1C40F")
            .setTitle(`Case #${newCase.caseId} | Mute`)
            .setDescription(`**Target:** ${target.user.tag}\n**Reason:** ${reason}\n**Role:** Created/Applied "Muted"`);
        
        message.channel.send({ embeds: [embed] });
    }
};
