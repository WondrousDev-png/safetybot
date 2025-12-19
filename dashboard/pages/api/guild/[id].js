import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongoose';
import GuildConfig from '../../../models/GuildConfig';
import axios from 'axios';

export default async function handler(req, res) {
    const session = await getSession({ req });
    const { id } = req.query; // The Server ID

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    await dbConnect();

    // SECURITY CHECK: Verify user is actually an Admin of this guild
    // We call Discord API again to ensure they aren't faking the request
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        const guild = response.data.find(g => g.id === id);
        const isAdmin = guild && (parseInt(guild.permissions) & 0x8) === 0x8;

        if (!isAdmin) {
            return res.status(403).json({ error: 'Forbidden: You are not an admin of this server.' });
        }

        // --- GET SETTINGS ---
        if (req.method === 'GET') {
            let config = await GuildConfig.findOne({ guildId: id });
            if (!config) {
                config = await new GuildConfig({ guildId: id }).save();
            }
            return res.status(200).json(config);
        }

        // --- SAVE SETTINGS ---
        if (req.method === 'POST') {
            const updates = req.body;
            
            // Security: Prevent users from injecting random fields
            // We only allow specific fields to be updated via dashboard
            const safeUpdates = {
                antiLink: updates.antiLink,
                antiInvites: updates.antiInvites,
                antiCaps: updates.antiCaps,
                logChannelId: updates.logChannelId,
                // Handle badWords array (ensure it's an array of strings)
                badWords: Array.isArray(updates.badWords) ? updates.badWords : []
            };

            const newConfig = await GuildConfig.findOneAndUpdate(
                { guildId: id },
                { $set: safeUpdates },
                { new: true, upsert: true }
            );

            return res.status(200).json(newConfig);
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
