import { getSession } from 'next-auth/react';
import axios from 'axios';
import dbConnect from '../../../lib/mongoose';
import GuildConfig from '../../../models/GuildConfig';

export default async function handler(req, res) {
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await dbConnect();

        // 1. Fetch User's Guilds from Discord
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        const userGuilds = response.data;

        // 2. Fetch Bot's Guilds (We need the bot token here to know where the bot is)
        // Note: For a huge bot, you wouldn't fetch ALL guilds. You'd check individually. 
        // But for starting out, fetching bot guilds is fine.
        const botResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
        });

        const botGuildIds = new Set(botResponse.data.map(g => g.id));

        // 3. Filter: Only show servers where User is Admin AND Bot is present
        // Permission bitfield for ADMINISTRATOR is 0x8 (8)
        // Manage Guild is 0x20 (32)
        const manageableGuilds = userGuilds.filter(guild => {
            const perms = parseInt(guild.permissions);
            const isAdmin = (perms & 0x8) === 0x8;
            const canManage = (perms & 0x20) === 0x20;
            return (isAdmin || canManage) && botGuildIds.has(guild.id);
        });

        res.status(200).json(manageableGuilds);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
}
