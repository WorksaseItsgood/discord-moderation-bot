#!/bin/bash
# Batch deploy for Discord commands - 200 at a time

cd /root/discord-moderation-bot

source .env

node -e "
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const config = require('./config');

const commands = [];
const commandFolders = ['moderation', 'config', 'info', 'utility', 'fun', 'game', 'economy', 'music', 'tickets', 'verification', 'giveaway', 'suggestion', 'welcome', 'starboard', 'sound', 'image', 'social'];

for (const folder of commandFolders) {
  const commandPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(commandPath)) continue;
  const files = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
  for (const file of files) {
    try {
      const fullPath = path.join(commandPath, file);
      const command = require(fullPath);
      if (!command.data || !command.data.name) continue;
      const json = command.data.toJSON();
      if (json.description && json.description.length > 100) json.description = json.description.substring(0, 97) + '...';
      commands.push(json);
    } catch (e) {}
  }
}

console.log('Total commands:', commands.length);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const BATCH = 200;
for (let i = 0; i < commands.length; i += BATCH) {
  const batch = commands.slice(i, i + BATCH);
  const batchNum = Math.floor(i / BATCH) + 1;
  const totalBatches = Math.ceil(commands.length / BATCH);
  console.log(\`Deploying batch \${batchNum}/\${totalBatches} (\${batch.length} commands)...\`);
  
  (async () => {
    try {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: batch }
      );
      console.log(\`Batch \${batchNum} OK (\${i + batch.length}/\${commands.length})\`);
    } catch (e) {
      console.error(\`Batch \${batchNum} ERROR: \${e.message}\`);
    }
  })();
  
  if (i + BATCH < commands.length) {
    // Wait 5 seconds between batches to avoid rate limits
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  }
}
" 2>&1 | tee /tmp/deploy-batch.log