require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const config = require('./config');
const { clientId, token } = config;

if (!clientId || !token) {
  console.error('[Error] Missing CLIENT_ID or TOKEN');
  process.exit(1);
}

// Collect all commands
const commands = [];
const commandNames = new Set();
const commandFolders = [
  'moderation', 'config', 'info', 'utility', 'fun', 'game',
  'economy', 'music', 'tickets', 'verification',
  'giveaway', 'suggestion', 'welcome', 'starboard'
];

console.log('[Deploy] Collecting commands...\n');

for (const folder of commandFolders) {
  const commandPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(commandPath)) continue;
  
  const files = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
  for (const file of files) {
    try {
      const fullPath = path.join(commandPath, file);
      const command = require(fullPath);
      
      if (!command.data || !command.data.name) continue;
      if (commandNames.has(command.data.name)) continue;
      
      const json = command.data.toJSON();
      
      // Truncate long descriptions
      if (json.description && json.description.length > 100) {
        json.description = json.description.substring(0, 97) + '...';
      }
      
      commands.push(json);
      commandNames.add(command.data.name);
      console.log(`[Command] ${command.data.name}`);
    } catch (e) {
      console.log(`[Error] ${file}: ${e.message}`);
    }
  }
}

console.log(`\n[Deploy] Total: ${commands.length} commands`);

// Deploy one by one
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('\n[Deploy] Getting existing commands...');
    const existing = await rest.get(Routes.applicationCommands(clientId));
    console.log('[Deploy] Existing:', existing.length);
    
    // Delete ALL existing first
    console.log('[Deploy] Deleting existing...');
    for (const cmd of existing) {
      try {
        await rest.delete(Routes.applicationCommand(clientId, cmd.id));
      } catch(e) {}
    }
    console.log('[Deploy] All deleted');
    
    // Deploy first batch only (50)
    console.log('[Deploy] Deploying first 50...');
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands.slice(0, 50) }
    );
    console.log('[Deploy] Success:', data.length);
    console.log('[Deploy] DONE!');
  } catch (e) {
    console.error('[Deploy] Error:', e.message);
    process.exit(1);
  }
})();