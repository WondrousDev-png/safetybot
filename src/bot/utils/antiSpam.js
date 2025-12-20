const { EmbedBuilder } = require('discord.js');

// MEMORY STORAGE
// structure: userId => [ { content: "text", time: 123456789 } ]
const messageCache = new Map();

// CONFIG
const LIMITS = {
    REPEAT_LIMIT: 4,     // Max identical messages
    FAST_LIMIT: 5,       // Max messages in short window
    TIME_WINDOW: 5000,   // 5 seconds
    MUTE_THRESHOLD: 2    // How many spam detections before mute
};

const violationTracker = new Map(); // Tracks how many times they spammed

async function checkSpam(client, message) {
    if (message.author.bot) return false;
    
    const id = message.author.id;
    const now = Date.now();

    // 1. Initialize Cache
    if (!messageCache.has(id)) messageCache.set(id, []);
    const history = messageCache.get(id);

    // 2. Add current message
    history.push({ content: message.content, time: now });

    // 3. Clean old messages from cache (older than 5s)
    const recent = history.filter(m => now - m.time < LIMITS.TIME_WINDOW);
    messageCache.set(id, recent);

    // --- DETECTIONS ---
    let isSpam = false;
    let reason = "";

    // A. Fast Messaging (Burst)
    if (recent.length >= LIMITS.FAST_LIMIT) {
        isSpam = true;
        reason = "Sending messages too fast";
    }

    // B. Copy-Paste (Repeated Text)
    // Count how many times the current message content appears in history
    const repeats = recent.filter(m => m.content === message.content).length;
    if (repeats >= LIMITS.REPEAT_LIMIT) {
        isSpam = true;
        reason = "Repeated text spam";
    }

    // --- PUNISHMENT ---
    if (isSpam) {
        // Delete the spam
        await message.delete().catch(() => {});

        // Track Violations
        const violations = (violationTracker.get(id) || 0) + 1;
        violationTracker.set(id, violations);

        if (violations >= LIMITS.MUTE_THRESHOLD) {
            // MUTE THEM (Timeout for 1 hour)
            const member = message.member;
            if (member && member.moderatable) {
                await member.timeout(60 * 60 * 1000, "Auto-Mod: Persistent Spamming");
                message.channel.send(`🤐 **${message.author.tag}** has been muted for spamming.`);
                violationTracker.delete(id); // Reset tracker
            }
        } else {
            // WARN THEM
            message.channel.send(`⚠️ **${message.author}**, stop spamming! (${reason})`)
                .then(msg => setTimeout(() => msg.delete().catch(()=> {}), 3000));
        }
        
        return true; // Stop processing commands
    }

    return false;
}

module.exports = { checkSpam };
