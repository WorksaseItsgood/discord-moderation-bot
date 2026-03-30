# Discord Moderation Bot 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)

Multifunctional Discord bot with advanced anti-raid, economy, music, tickets, and more.

[Français](#français) | [English](#english)

---

## 🇬🇧 English

### Features

#### 🛡️ Moderation
- **Anti-Raid System**: Real-time protection against raids with configurable thresholds
- **Auto-Mod**: Anti-spam, anti-invite, anti-scam, anti-swear, mention spam, caps lock
- **Mute/Unmute**: Temporary and permanent mutes
- **Ban/Unban**: Temporary and permanent bans with reason
- **Kick**: Kick users with reason
- **Warn/Warnings**: Warning system with history
- **Lock/Unlock**: Channel locking
- **Slowmode**: Channel slowmode control
- **Role Management**: Add/remove roles

#### 💰 Economy System
- `/balance` - Check your balance
- `/daily` - Claim daily rewards (24h cooldown)
- `/weekly` - Claim weekly rewards (7d cooldown)
- `/beg` - Beg for coins (2m cooldown)
- `/gamble` - Gamble your coins
- `/rob` - Rob another user (30% success)
- `/pay` - Pay another user
- `/rank` - Check your XP and rank
- `/leaderboard` - Server leaderboard

#### 🎵 Music System (DisTube)
- `/play` - Play music
- `/stop` - Stop music
- `/skip` - Skip song
- `/queue` - View queue
- `/volume` - Set volume

#### 🎫 Ticket System
- `/ticket-create` - Create a ticket
- `/ticket-close` - Close ticket
- `/ticket-add` - Add user to ticket
- `/ticket-remove` - Remove user from ticket
- `/ticket-panel` - Create ticket panel

#### ✅ Verification System
- `/verify` - Verify with CAPTCHA

#### 🎉 Giveaway System
- `/giveaway-create` - Create giveaway
- `/giveaway-end` - End giveaway
- `/giveaway-reroll` - Reroll winner

#### 💡 Suggestion System
- `/suggest` - Submit suggestion
- `/accept-suggest` - Accept suggestion
- `/reject-suggest` - Reject suggestion

#### 👋 Welcome/Leave System
- Custom welcome messages
- Auto-role on join
- Member counter

#### ⭐ Starboard
- Auto-star messages

#### 🔧 Utility Commands
- `/server-info` - Server information
- `/user-info` - User information
- `/avatar` - User avatar
- `/banner` - User banner
- `/role-info` - Role information
- `/channel-info` - Channel information
- `/emojis` - Server emojis
- `/invite-info` - Invite information
- `/poll` - Create poll

#### 🎮 Game Commands
- `/8ball` - Magic 8ball
- `/rps` - Rock Paper Scissors

#### ℹ️ Info Commands
- `/ping` - Bot ping
- `/bot-stats` - Bot statistics

### Database

Uses SQLite (`better-sqlite3`) for:
- Economy (balance, XP, level)
- Warnings history
- Ticket data
- Giveaway data
- Suggestions
- Starboard
- Cooldowns
- Per-guild settings

### Installation

```bash
# Clone the repository
git clone https://github.com/WorksaseItsgood/discord-moderation-bot.git

# Install dependencies
cd discord-moderation-bot
npm install

# Configure the bot
cp .env.example .env
# Edit .env with your bot token

# Start the bot
npm start
```

### Configuration (.env)

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
OWNERS=your_user_id
DEBUG=false
GLOBAL_COMMANDS=true
STATUS= moderation help
PREFIX=!
```

### Slash Commands

Register commands globally:
```bash
npm run deploy
```

### Anti-Raid Configuration

The anti-raid system can be configured per-guild using config files in `configs/`:

```json
{
  "raid": {
    "enabled": true,
    "maxJoinsPerSecond": 5,
    "minAccountAge": 7,
    "requireAvatar": true,
    "actions": {
      "low": "warn",
      "medium": "mute", 
      "high": "kick",
      "critical": "ban"
    }
  }
}
```

### Support

For issues and feature requests, please open an issue on GitHub.

---

## 🇫🇷 Français

### Fonctionnalités

#### 🛡️ Modération
- **Système Anti-Raid**: Protection en temps réel contre les raids
- **Auto-Mod**: Anti-spam, anti-invite, anti-arnaque, anti-insulte
- **Mute/Unmute**: Rappels temporaires et permanents
- **Ban/Unban**: Bannissements temporaires et permanents
- **Kick**: Expulser des utilisateurs
- **Warn/Warnings**: Système d'avertissements
- **Lock/Unlock**: Verrouillage de salon
- **Slowmode**: Contrôle du slowmode
- **Gestion des rôles**: Ajouter/retirer des rôles

#### 💰 Système Économique
- `/balance` - Vérifier votre solde
- `/daily` - Récompense quotidienne (24h)
- `/weekly` - Récompense hebdomadaire (7j)
- `/beg` - Mendier des pièces (2min)
- `/gamble` - Jouer vos pièces
- `/rob` - Voler un autre utilisateur
- `/pay` - Payer un autre utilisateur
- `/rank` - Voir votre rang XP
- `/leaderboard` - Classement du serveur

#### 🎵 Système Musical (DisTube)
- `/play` - Jouer de la musique
- `/stop` - Arrêter la musique
- `/skip` - Passer la chanson
- `/queue` - Voir la file d'attente
- `/volume` - Régler le volume

#### 🎫 Système de Tickets
- `/ticket-create` - Créer un ticket
- `/ticket-close` - Fermer un ticket
- `/ticket-add` - Ajouter un utilisateur
- `/ticket-remove` - Retirer un utilisateur
- `/ticket-panel` - Créer un panneau de tickets

#### ✅ Système de Vérification
- `/verify` - Vérifier avec CAPTCHA

#### 🎉 Système de Giveaway
- `/giveaway-create` - Créer un giveaway
- `/giveaway-end` - Terminer un giveaway
- `/giveaway-reroll` - Retirer le gagnant

#### 💡 Système de Suggestions
- `/suggest` - Soumettre une suggestion
- `/accept-suggest` - Accepter une suggestion
- `/reject-suggest` - Rejeter une suggestion

#### 👋 Système de Bienvenue
- Messages de bienvenue personnalisés
- Rôle automatique à l'arrivée
- Compteur de membres

#### ⭐ Starboard
- Messages vedettes automatiques

#### 🔧 Commandes Utilitaires
- `/server-info` - Info serveur
- `/user-info` - Info utilisateur
- `/avatar` - Avatar utilisateur
- `/banner` - Bannière utilisateur
- `/role-info` - Info rôle
- `/channel-info` - Info salon
- `/emojis` - Emojis du serveur
- `/invite-info` - Info invitation
- `/poll` - Créer un sondage

#### 🎮 Commandes de Jeu
- `/8ball` - Boule magique 8
- `/rps` - Pierre Papier Ciseaux

#### ℹ️ Commandes d'Info
- `/ping` - Ping du bot
- `/bot-stats` - Statistiques du bot

### Base de données

SQLite (`better-sqlite3`) pour:
- Économie (solde, XP, niveau)
- Historique des avertissements
- Données des tickets
- Données des giveaways
- Suggestions
- Starboard
- Cooldowns
- Paramètres par serveur

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/WorksaseItsgood/discord-moderation-bot.git

# Installer les dépendances
cd discord-moderation-bot
npm install

# Configurer le bot
cp .env.example .env
# Modifier .env avec votre token

# Démarrer le bot
npm start
```

### Configuration (.env)

```env
DISCORD_TOKEN=votre_token_bot
CLIENT_ID=votre_client_id
OWNERS=votre_user_id
DEBUG=false
GLOBAL_COMMANDS=true
STATUS= moderation help
PREFIX=!
```

### Commandes slash

Enregistrer les commandes globalement:
```bash
npm run deploy
```

### Configuration Anti-Raid

Le système anti-raid peut être configuré par serveur dans `configs/`:

```json
{
  "raid": {
    "enabled": true,
    "maxJoinsPerSecond": 5,
    "minAccountAge": 7,
    "requireAvatar": true,
    "actions": {
      "low": "warn",
      "medium": "mute",
      "high": "kick",
      "critical": "ban"
    }
  }
}
```

### Support

Pour les problèmes et demandes de fonctionnalité, ouvrez une issue sur GitHub.

---

## License / Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

---

⭐ Star this repository if you find it useful!