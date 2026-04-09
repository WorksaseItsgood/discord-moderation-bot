# Niotic - Discord Moderation Bot

🛡️ Advanced Discord moderation bot with anti-raid, anti-spam, and auto-moderation features.

## Features

- **50+ Moderation Commands** - ban, kick, mute, warn, tempban, softban, lock, slowmode, purge, and more
- **Anti-Raid System** - Auto-detect and lockdown on raid attacks
- **Anti-Spam** - Flood protection, mention spam, link spam detection
- **Derank Protection** - Track suspicious activity and auto-derank offenders
- **Whitelist System** - Exempt trusted users from all protections
- **Auto-Moderation** - Word filter, link filter, token detection
- **Dashboard Buttons** - Interactive UI for configuration
- **Welcome/Goodbye Messages** - Auto-role and custom messages
- **Backup System** - Export/import server configuration
- **French + English** - Full localization

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your bot token
npm start
```

## Environment Variables

```
DISCORD_TOKEN=your_bot_token_here
```

## Commands

### Moderation
- `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/warns`, `/clearwarns`
- `/tempban`, `/softban`, `/timeout`, `/clear`, `/purge`
- `/lock`, `/unlock`, `/slowmode`, `/giverole`, `/takerole`, `/hackban`

### Protection
- `/shield` - Protection status
- `/raidmode` - Anti-raid control
- `/lockdown` - Emergency lockdown
- `/unquakeserver` - Remove lockdowns

### Configuration
- `/config`, `/setlogs`, `/setprefix`, `/setmutedrole`
- `/setraidconfig`, `/setantispam`, `/setderank`
- `/addwhitelist`, `/removewhitelist`, `/whitelist`

### Utility
- `/poll`, `/vote`, `/embed`, `/say`, `/avlookup`

### Info
- `/userinfo`, `/serverinfo`, `/roleinfo`, `/channelinfo`
- `/permissions`, `/ping`, `/uptime`, `/stats`, `/leaderboard`

### Automation
- `/autorole`, `/welcome`, `/goodbye`, `/backup`

## Command Factory

Generate additional commands from templates:

```bash
node src/commands/factory/generate.js
```

Edit `src/commands/factory/templates.js` to add new command templates.

## License

MIT
