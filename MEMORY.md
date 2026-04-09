# Niotic Discord Bot - Memory

## Overview
Niotic v3 - Advanced Discord moderation bot with anti-raid, anti-spam, and auto-moderation features.
**Location:** `/root/discord-moderation-bot`
**Bot:** Niotic#5518 running on PM2 as `discord-bot`

## Architecture
- **Entry:** `index.js` - ES Module entry point
- **Bot core:** `src/bot.js` - Client setup and command/event loading
- **Commands:** `src/commands/{moderation,config,utility,info,protection,automation,stats}/`
- **Events:** `src/events/` - interactionCreate, guildMemberAdd, guildMemberRemove, guildCreate, messageCreate
- **Handlers:** `src/handlers/` - raidHandler, antiSpamHandler, derankHandler, autoModHandler
- **Utils:** `src/utils/embeds.js` - Beautiful consistent embed builder (colors, thumbnails, footers)
- **Database:** `src/database/db.js` - SQLite via better-sqlite3
- **Factory:** `src/commands/factory/` - templates.js + generate.js for auto-generating commands

## Visual Design System
Embed colors:
- Success: `0x00ff99` (green)
- Error: `0xff4757` (red)
- Warning: `0xffa502` (orange)
- Info: `0x5865F2` (blue)
- Moderation: `0xff6b81` (pink)
- Raid: `0xff0000` (red)
- Shield: `0x9b59b6` (purple)
- Mute: `0xffd93d` (yellow)

Every embed includes:
- Thumbnail (user avatar or bot avatar)
- Footer with "Niotic Moderation" + timestamp
- Inline fields for compact info
- Emoji in title for clarity

## Key Patterns
- Button handlers: `client.buttonHandlers.set(customId, callback)`
- Guild configs: `client.guildConfigs.set(guildId, config)`
- Raid state: `client.raidMode.get(guildId)`
- Commands use `export default { data, name, permissions, execute }`
- All moderation actions logged via `addLog()`
- French primary language, English fallbacks

## Database Exports (from db.js)
`getGuildConfig(guildId)`, `updateGuildConfig(guildId, updates)`, `getWhitelist(guildId)`, `addToWhitelist(guildId, type, id)`, `removeFromWhitelist(guildId, type, id)`, `addWarning(guildId, userId, data)`, `getWarnings(guildId, userId)`, `clearWarnings(guildId, userId)`, `addLog(guildId, data)`, `addViolation(guildId, userId, points)`, `getStats(guildId)`, `addBackup(guildId, data)`, `getBackup(id)`, `addRaidEvent(guildId, data)`

## Running
```bash
cd /root/discord-moderation-bot
npm install
npm start        # Production
npm run dev      # Watch mode
```

## GitHub
`github.com/WorksaseItsgood/discord-moderation-bot`

## PM2
```bash
pm2 status discord-bot   # Check status
pm2 restart discord-bot  # Restart
pm2 logs discord-bot     # View logs
```

## User Preferences (Work)
- French language
- Short responses preferred
- Doesn't ask for confirmation on routine actions
- Works at night - optimize code without asking
