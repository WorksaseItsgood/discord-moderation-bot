require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const folders = ['moderation', 'config', 'info', 'utility', 'fun', 'game', 'economy', 'music', 'tickets', 'verification', 'giveaway', 'suggestion', 'welcome', 'starboard', 'sound', 'image', 'social'];

for (const folder of folders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(folderPath)) continue;
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    try {
      const cmd = require(path.join(folderPath, file));
      if (cmd.data && cmd.data.name) {
        const json = cmd.data.toJSON();
        if (json.description && json.description.length > 100) json.description = json.description.substring(0, 97) + '...';
        commands.push(json);
      }
    } catch(e) {}
  }
}

console.log('Total commands:', commands.length);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deploy() {
  // Clear all first
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
    console.log('Cleared existing commands');
  } catch(e) { console.log('Clear error:', e.message); }
  
  // Deploy in batches of 100 with 1 sec delay
  for (let i = 0; i < commands.length; i += 100) {
    const batch = commands.slice(i, i + 100);
    try {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: batch });
      console.log(`Deployed ${Math.min(i+100, commands.length)}/${commands.length}`);
    } catch(e) {
      console.log('Batch error:', e.message);
    }
    if (i + 100 < commands.length) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('DEPLOY COMPLETE!');
}

deploy();
