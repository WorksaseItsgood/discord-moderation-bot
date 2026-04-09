# Niotic - Discord Moderation Bot

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![Discord.js](https://img.shields.io/badge/discord.js-14.15.0-purple)

🛡️ Advanced Discord moderation bot with anti-raid, anti-spam, and auto-moderation features.

## Features

### 🛡️ Protection
- **Anti-Raid System** - Auto-detect and lockdown on raid attacks
- **Anti-Spam** - Flood protection, mention spam, link spam detection
- **Derank Protection** - Track suspicious activity and auto-derank offenders
- **Auto-Mod** - Word filter, link filter, token detection

### ⚡ Moderation (55+ commands)
- `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/warns`, `/clearwarns`
- `/tempban`, `/softban`, `/timeout`, `/clear`, `/purge`
- `/lock`, `/unlock`, `/slowmode`, `/giverole`, `/takerole`, `/hackban`

### 🛠️ Configuration
- `/dashboard` - Interactive button-based configuration
- `/shield`, `/raidmode`, `/lockdown`, `/unquakeserver`
- `/config`, `/setlogs`, `/setprefix`, `/setmutedrole`
- `/setraidconfig`, `/setantispam`, `/setderank`
- `/whitelist`, `/addwhitelist`, `/removewhitelist`

### 🤖 Automation
- `/autorole` - Auto-assign role to new members
- `/welcome`, `/goodbye` - Custom messages
- `/backup`, `/restore` - Server backup system

### 📊 Info
- `/userinfo`, `/serverinfo`, `/roleinfo`, `/channelinfo`
- `/permissions`, `/ping`, `/uptime`, `/stats`

### 🎨 Visual Design
- Beautiful, consistent embeds with thumbnails and footers
- Button-based confirmations for dangerous actions
- Interactive dashboard with section navigation
- French + English localization

## Installation

```bash
# Clone
git clone https://github.com/WorksaseItsgood/discord-moderation-bot.git
cd discord-moderation-bot

# Install dependencies
npm install

# Configure
cp .env.example .env
# Edit .env with your bot token

# Start
npm start
```

## Environment Variables

```env
DISCORD_TOKEN=your_bot_token_here
```

## Commands

| Category | Commands |
|----------|----------|
| **Moderation** | ban, kick, mute, unmute, warn, warns, clearwarns, tempban, softban, timeout, clear, purge, lock, unlock, slowmode, giverole, takerole, hackban |
| **Protection** | shield, raidmode, lockdown, unquakeserver, scanraid, trust |
| **Config** | dashboard, config, setlogs, setprefix, setmutedrole, setraidconfig, setantispam, setderank, whitelist, addwhitelist, removewhitelist |
| **Automation** | autorole, welcome, goodbye, backup, restore, settings |
| **Utility** | poll, vote, embed, say, avlookup |
| **Info** | userinfo, serverinfo, roleinfo, channelinfo, permissions, ping, uptime, stats, leaderboard |

## Command Factory

Generate additional commands from templates:

```bash
node src/commands/factory/generate.js
```

Edit `src/commands/factory/templates.js` to add new command templates.

## PM2 Management

```bash
pm2 start npm --name "discord-bot" -- start
pm2 status discord-bot
pm2 restart discord-bot
pm2 logs discord-bot
pm2 stop discord-bot
```

## Architecture

```
src/
├── bot.js              # Main entry point
├── database/db.js      # SQLite database layer
├── events/             # Discord events
│   ├── interactionCreate.js
│   ├── guildMemberAdd.js
│   └── guildMemberRemove.js
├── handlers/           # Feature handlers
│   ├── raidHandler.js
│   ├── antiSpamHandler.js
│   └── derankHandler.js
├── commands/           # Slash commands
│   ├── moderation/
│   ├── config/
│   ├── protection/
│   ├── automation/
│   ├── utility/
│   ├── info/
│   └── factory/
└── utils/embeds.js     # Embed builder
```

## License

MIT
