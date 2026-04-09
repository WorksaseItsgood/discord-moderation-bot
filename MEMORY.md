# Niotic Discord Bot - Memory

## Overview
Niotic is a Discord moderation bot written in JavaScript (discord.js v14, ES modules). It's hosted at `/root/discord-moderation-bot`.

## Architecture
- **Entry**: `src/bot.js` - Main client with all intents
- **Commands**: `src/commands/{moderation,config,utility,info,protection,automation,stats}/`
- **Events**: `src/events/` - interactionCreate, guildMemberAdd, guildMemberRemove, guildCreate, messageCreate
- **Handlers**: `src/handlers/` - raidHandler, antiSpamHandler, derankHandler
- **Database**: `src/database/db.js` - SQLite via better-sqlite3
- **Factory**: `src/commands/factory/` - Auto-generate commands from templates

## Key Patterns
- Button handlers stored in `client.buttonHandlers` Map
- Guild configs cached in `client.guildConfigs` Map
- Raid state in `client.raidMode` Map
- All commands use `client.buttonHandlers.set(customId, callback)` for buttons
- Database uses named exports: getGuildConfig, updateGuildConfig, addWarning, getWarnings, clearWarnings, addLog, getWhitelist, addToWhitelist, removeFromWhitelist, addViolation, getStats, addBackup, addRaidEvent

## Running
```bash
cd /root/discord-moderation-bot
npm install
npm start  # or npm run dev for watch mode
```

Managed by PM2 as `discord-bot`.

## Memory (for agent)
- Bot runs as PM2 service `discord-bot`
- French language primary
- User prefers short responses
- 50 essential commands + factory for 100 more
- Button-based dashboard system
- RaidHandler, AntiSpam, DerankHandler handlers
