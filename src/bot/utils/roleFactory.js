const { PermissionsBitField } = require('discord.js');

/**
 * Ensures a role exists. If not, creates it with specific permissions.
 */
async function ensureRole(guild, roleName, type) {
    // 1. Check if role exists
    let role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    
    if (role) return role;

    console.log(`⚙️ Auto-Creating Role: ${roleName} for ${type}`);

    // 2. Define Presets
    const presets = {
        'MUTED': {
            color: '#818386', // Grey
            permissions: [],  // No perms
            hoist: false,
            reason: 'Safety Bot: Auto-created Muted Role'
        },
        'MODERATOR': {
            color: '#1ABC9C', // Teal
            permissions: [
                PermissionsBitField.Flags.KickMembers,
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.MuteMembers
            ],
            hoist: true,
            reason: 'Safety Bot: Auto-created Mod Role'
        },
        'QUARANTINE': {
            color: '#000000', // Black
            permissions: [],
            reason: 'Safety Bot: Anti-Nuke Quarantine'
        }
    };

    const config = presets[type] || { color: '#99AAB5', permissions: [] };

    // 3. Create the Role
    role = await guild.roles.create({
        name: roleName,
        color: config.color,
        permissions: config.permissions,
        hoist: config.hoist || false,
        reason: config.reason
    });

    // 4. Special Handling for Muted/Quarantine (Overwrite Channels)
    if (type === 'MUTED' || type === 'QUARANTINE') {
        guild.channels.cache.forEach(channel => {
            // Prevent talking
            channel.permissionOverwrites.create(role, {
                SendMessages: false,
                AddReactions: false,
                Speak: false // Voice channels
            }).catch(e => console.log(`Could not update channel ${channel.name}`));
        });
    }

    return role;
}

module.exports = { ensureRole };