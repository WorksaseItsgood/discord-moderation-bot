require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Configuration
const config = require('./config');
const { clientId, token } = config;

// Check for required environment variables
if (!clientId) {
  console.error('[Error] CLIENT_ID not set in environment variables!');
  process.exit(1);
}

if (!token) {
  console.error('[Error] DISCORD_TOKEN not set in environment variables!');
  process.exit(1);
}

// Collect all commands
const commands = [];
const commandFolders = ['moderation', 'config', 'info'];

for (const folder of commandFolders) {
  const commandPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(commandPath)) continue;
  
  const files = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const command = require(path.join(commandPath, file));
    commands.push(command.data.toJSON());
    console.log(`[Command] Queued: ${command.data.name}`);
  }
}

// Deploy commands
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`[Deploy] Started refreshing ${commands.length} application commands.`);
    
    // Deploy globally or per guild
    if (config.registerCommandsGlobally) {
      console.log('[Deploy] Registering commands globally...');
      
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      
      console.log(`[Deploy] Successfully reloaded ${data.length} global application commands.`);
    } else {
      // Get all guilds and register per guild
      const { Client, GatewayIntentBits } = require('discord.js');
      const client = new Client({
        intents: [GatewayIntentBits.Guilds]
      });
      
      await client.login(token);
      await client.ready;
      
      console.log(`[Deploy] Registering commands per guild (${client.guilds.cache.size} guilds)...`);
      
      for (const guild of client.guilds.cache.values()) {
        try {
          await rest.put(
            Routes.applicationGuildCommands(clientId, guild.id),
            { body: commands }
          );
          console.log(`[Deploy] Registered commands in guild: ${guild.name}`);
        } catch (error) {
          console.error(`[Deploy] Failed to register commands in ${guild.name}:`, error.message);
        }
      }
      
      await client.destroy();
    }
    
    console.log('[Deploy] Done!');
    process.exit(0);
  } catch (error) {
    console.error('[Deploy] Error:', error);
    process.exit(1);
  }
})();