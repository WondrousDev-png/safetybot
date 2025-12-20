const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: "dehoist",
    description: "Rename users causing list issues (names starting with ! or special chars)",
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return;

        const msg = await message.channel.send("🧹 **Scanning for hoisters...**");

        const members = await message.guild.members.fetch();
        let count = 0;
        
        // Regex: Matches names starting with !, @, #, $, %, ^, &, *, (, ), ., or numbers
        const hoistPattern = /^[!@#$%^&*().,0-9]/; 

        for (const [id, member] of members) {
            // Check if they match pattern and we have permission to change them
            if (hoistPattern.test(member.displayName) && member.manageable) {
                try {
                    await member.setNickname(`z-Hoister ${count + 1}`);
                    count++;
                } catch (e) {
                    console.log(`Failed to rename ${member.user.tag}`);
                }
            }
        }

        msg.edit(`✅ **De-hoist Complete:** Renamed ${count} users.`);
    }
};
