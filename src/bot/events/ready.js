module.exports = async (client) => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Loop through all servers the bot is in
    client.guilds.cache.forEach(async (guild) => {
        // Check if "Owner" role exists
        let ownerRole = guild.roles.cache.find(r => r.name === "Owner");
        if (!ownerRole) {
             // If not, make it, give it admin, and give it to the server owner
             ownerRole = await guild.roles.create({ 
                 name: "Owner", 
                 color: "Gold", 
                 permissions: [PermissionsBitField.Flags.Administrator] 
             });
             const ownerMember = await guild.fetchOwner();
             ownerMember.roles.add(ownerRole);
             console.log(`Created Owner role for ${guild.name}`);
        }
    });
};
