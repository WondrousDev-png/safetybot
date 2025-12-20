require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

const client = new Client({
    intents: [Object.keys(GatewayIntentBits)], // Enable ALL intents for safety monitoring
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.aliases = new Collection();

// 1. Connect Database
mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Database Connected'));

// 2. Load Commands Dynamically
const loadCommands = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const stat = fs.lstatSync(`${dir}/${file}`);
        if (stat.isDirectory()) {
            loadCommands(`${dir}/${file}`);
        } else if (file.endsWith('.js')) {
            const cmd = require(`${dir}/${file}`);
            if(cmd.name) {
                client.commands.set(cmd.name, cmd);
                if(cmd.aliases) cmd.aliases.forEach(a => client.aliases.set(a, cmd.name));
                console.log(`Loaded Command: ${cmd.name}`);
            }
        }
    }
};
loadCommands('./src/bot/commands');

// 3. Load Events (Safety Logic)
const eventFiles = fs.readdirSync('./src/bot/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./src/bot/events/${file}`);
    const eventName = file.split('.')[0];
    client.on(eventName, event.bind(null, client));
}

client.login(process.env.BOT_TOKEN);
