# Discord Moderation Bot

Advanced Discord moderation bot with anti-raid system, comprehensive auto-moderation, and full logging capabilities.

## Features

### 🛡️ Anti-Raid System
- **Raid Detection**: Detect sudden influx of users joining
- **Join Rate Limiter**: Configurable max joins per second
- **Account Age Check**: Flag/ban accounts younger than X days
- **Avatar Check**: No avatar = higher risk score
- **Username Analysis**: Detect spam patterns in usernames
- **Invite Link Detection**: Block invite links in usernames
- **Lockdown Mode**: One command to lock all channels (`/lockdown`)
- **Auto-punishment**: Configurable actions based on risk score
- **Whitelist**: VIP users/channels exempt from anti-raid

### 🔨 Moderation Commands
- `/ban` - Ban with reason, duration (optional), DM user
- `/unban` - Unban by user ID or username
- `/kick` - Kick with reason, DM user
- `/mute` - Mute user (timeout or role-based)
- `/unmute` - Unmute user
- `/warn` - Warn user with reason, track warnings
- `/warnings` - View user's warnings
- `/clearwarns` - Clear user's warnings
- `/lock` - Lock channel (disable send permissions)
- `/unlock` - Unlock channel
- `/slowmode` - Set slowmode interval
- `/purge` - Delete multiple messages (1-100)
- `/role` - Add/remove role from user
- `/voicemute` - Mute user in voice
- `/deafen` - Deafen user in voice
- `/disconnect` - Disconnect user from voice

### 🤖 Auto-Moderation
- **Anti-Spam**: Detect message spam, rate limit per user
- **Anti-Invite**: Block Discord invite links
- **Anti-Scam**: Detect common scam patterns
- **Anti-Swear**: Configurable word filter (with bypass roles)
- **Anti-Mention-Spam**: Flag users who mention too many people
- **Anti-Caps**: Excessive caps detection
- **Anti-Emoji-Spam**: Too many emojis
- **Anti-Image-Spam**: Detect image-only spam
- **Anti-Link**: Block certain types of links

### 📝 Logging
- **Moderation Logs**: All mod actions logged
- **Message Logs**: Edited/deleted messages logged
- **Member Logs**: Join/leave/kick/ban logged
- **Voice Logs**: Join/leave/mute/deafen in voice
- **Channel Logs**: Created/deleted/modified channels

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
OWNERS=your_user_id
DEBUG=false
```

### 3. Register Slash Commands
```bash
npm run deploy
```

### 4. Start the Bot
```bash
npm start
```

## Configuration

All settings can be configured in `config.js`. The default configuration provides sensible defaults.

### Anti-Raid Configuration Example
```json
{
  "raid": {
    "enabled": true,
    "maxJoinsPerSecond": 5,
    "minAccountAge": 7,
    "requireAvatar": true,
    "riskThresholds": {
      "low": 30,
      "medium": 60,
      "high": 80,
      "critical": 100
    },
    "actions": {
      "low": "warn",
      "medium": "mute",
      "high": "kick",
      "critical": "ban"
    }
  }
}
```

### Auto-Moderation Configuration Example
```json
{
  "autoMod": {
    "enabled": true,
    "spam": {
      "enabled": true,
      "maxMessages": 5,
      "maxInterval": 3000,
      "action": "delete"
    },
    "antiInvite": {
      "enabled": true,
      "action": "delete"
    },
    "antiScam": {
      "enabled": true,
      "action": "ban"
    }
  }
}
```

## Permissions Required

The bot requires the following permissions:
- Ban Members
- Kick Members
- Manage Channels
- Manage Roles
- Mute Members
- Deafen Members
- Move Members
- Manage Messages
- View Channels
- Send Messages

## File Structure

```
├── index.js              # Main entry point
├── config.js             # Configuration loader
├── deploy-commands.js    # Slash command registration
├── package.json          # NPM dependencies
├── README.md             # This file
├── commands/
│   ├── moderation/       # All moderation commands
│   ├── config/          # Config commands
│   └── info/           # Info commands
├── events/
│   ├── messageCreate.js  # Auto-moderation events
│   ├── guildMemberAdd.js # Member join logging
│   ├── voiceStateUpdate.js # Voice logging
│   └── guildMemberRemove.js # Member leave logging
├── systems/
│   ├── antiRaid.js      # Anti-raid system
│   ├── autoMod.js       # Auto-moderation system
│   └── logger.js       # Logging system
└── utils/
    ├── embedBuilder.js # Embed utilities
    └── permissionChecker.js # Permission utilities
```

## License

MIT