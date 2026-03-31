/**
 * Embed Templates - Pre-built beautiful embed templates
 * Use these for consistent, premium-looking embeds throughout the bot
 */

const { EmbedBuilder } = require('discord.js');

// Bot configuration
const BOT_NAME = 'CrowBot';
const BOT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';

// Color palette - beautiful dark theme colors
const COLORS = {
  // Primary colors
  primary: 0x2F3136,      // Dark gray (main background)
  secondary: 0x5865F2,    // Blurple (Discord blue)
  success: 0x57F287,       // Green
  error: 0xED4245,          // Red
  warning: 0xFEE75C,        // Yellow
  
  // Extended palette
  dark: 0x1E1F22,          // Darker gray
  light: 0xEBEFE5,         // Light gray
  muted: 0x99AAB5,         // Muted gray
  
  // Category colors
  moderation: 0xE74C3C,   // Red
  economy: 0xF39C12,        // Gold
  music: 0x9B59B6,          // Purple
  tickets: 0x3498DB,        // Blue
  fun: 0x1ABC9C,          // Teal
  utility: 0x95A5A6,        // Gray
  
  // Gradient approximations
  gold: 0xFFD700,
  diamond: 0xB9F2FF,
  nitro: 0xA855F7,
  boost: 0xFF73FA
};

/**
 * Get today's date formatted
 */
function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get current timestamp
 */
function getTimestamp() {
  return new Date();
}

/**
 * Create a base embed with all the beautiful styling
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @param {number} color - Embed color
 * @param {string} iconURL - Thumbnail URL
 */
function baseEmbed(title, description, color = COLORS.primary, iconURL = null) {
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: BOT_NAME,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(iconURL)
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
}

/**
 * Create a success embed
 * @param {string} title - Success title
 * @param {string} description - Success message
 * @param {object} options - Additional options
 */
function success(title, description, options = {}) {
  const { fields = [], iconURL = null, thumbnail = null } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setAuthor({
      name: `✅ ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create an error embed
 * @param {string} title - Error title
 * @param {string} description - Error message
 * @param {object} options - Additional options
 */
function error(title, description, options = {}) {
  const { fields = [], thumbnail = null } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.error)
    .setAuthor({
      name: `❌ ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create an info embed
 * @param {string} title - Info title
 * @param {string} description - Info message
 * @param {object} options - Additional options
 */
function info(title, description, options = {}) {
  const { fields = [], color = COLORS.secondary, thumbnail = null, image = null } = options;
  
  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: `ℹ️ ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setImage(image)
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create a warning embed
 * @param {string} title - Warning title
 * @param {string} description - Warning message
 * @param {object} options - Additional options
 */
function warning(title, description, options = {}) {
  const { fields = [], thumbnail = null } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.warning)
    .setAuthor({
      name: `⚠️ ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create a moderation action embed
 * @param {string} action - Action type (Ban, Kick, Mute, Warn, etc.)
 * @param {object} user - User object
 * @param {object} moderator - Moderator user object
 * @param {string} reason - Reason for action
 * @param {object} options - Additional options
 */
function modAction(action, user, moderator, reason, options = {}) {
  const { duration = null, thumbnail = null, dmSent = false } = options;
  
  const actionEmoji = {
    ban: '🔨',
    kick: '👢',
    mute: '🔇',
    unmute: '🔊',
    warn: '⚠️',
    unwarn: '✅',
    lock: '🔒',
    unlock: '🔓'
  };
  
  const emoji = actionEmoji[action.toLowerCase()] || '⚡';
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.moderation)
    .setAuthor({
      name: `${emoji} ${action} • ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTitle(`${emoji} ${action} Executed`)
    .setDescription(`**${action}** action has been executed successfully.`)
    .setThumbnail(thumbnail || user.displayAvatarURL())
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp()
    .addFields(
      { name: '👤 User', value: `${user}\n\`${user.id}\``, inline: true },
      { name: '🛡️ Moderator', value: `${moderator}\n\`${moderator.id}\``, inline: true },
      { name: '📝 Reason', value: reason, inline: false }
    );
  
  if (duration) {
    embed.addFields({ name: '⏱️ Duration', value: duration, inline: true });
  }
  
  if (dmSent !== undefined) {
    embed.addFields({ name: '📨 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true });
  }
  
  return embed;
}

/**
 * Create a welcome embed for new members
 * @param {object} member - Guild member
 * @param {object} options - Additional options
 */
function welcome(member, options = {}) {
  const { memberCount = 0, thumbnail = null } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setAuthor({
      name: `🎉 Welcome!`,
      iconURL: BOT_AVATAR
    })
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(`Hey **${member.user.username}**! We're glad you're here.`)
    .setThumbnail(thumbnail || member.displayAvatarURL())
    .setImage(member.guild.iconURL())
    .setFooter({
      text: `Member #${memberCount} • ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp()
    .addFields(
      { name: '👤 Welcome', value: `Please read the rules and have fun!`, inline: false },
      { name: '📋 Rules', value: 'Check out the rules channel to avoid issues!', inline: true },
      { name: '💬 Chat', value: 'Introduce yourself in the chat!', inline: true }
    );
  
  return embed;
}

/**
 * Create a leave embed for when members leave
 * @param {object} member - Guild member
 * @param {object} options - Additional options
 */
function leave(member, options = {}) {
  const { memberCount = 0, thumbnail = null } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.warning)
    .setAuthor({
      name: `👋 Goodbye!`,
      iconURL: BOT_AVATAR
    })
    .setTitle(`Goodbye from ${member.guild.name}`)
    .setDescription(`**${member.user.username}** has left the server.`)
    .setThumbnail(thumbnail || member.displayAvatarURL())
    .setFooter({
      text: `Members: ${memberCount} • ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  return embed;
}

/**
 * Create a rank/level embed
 * @param {object} user - User object
 * @param {number} level - User's level
 * @param {number} xp - User's XP
 * @param {number} rank - User's rank
 * @param {object} options - Additional options
 */
function rank(user, level, xp, rank, options = {}) {
  const { maxXP = level * 100, thumbnail = null, nextLevelXP = (level + 1) * 100 } = options;
  
  // Calculate progress bar
  const progress = Math.min(Math.round((xp / nextLevelXP) * 10), 10);
  const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.secondary)
    .setAuthor({
      name: `🏆 ${user.username}'s Rank`,
      iconURL: BOT_AVATAR
    })
    .setTitle(`🎖️ Level ${level} • ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}`)
    .setDescription(`**${user.username}** is rising through the ranks!`)
    .setThumbnail(thumbnail || user.displayAvatarURL())
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp()
    .addFields(
      { name: '⭐ XP', value: `\`${xp}/${nextLevelXP}\``, inline: true },
      { name: '📊 Level', value: `**${level}**`, inline: true },
      { name: '🏅 Rank', value: `**#${rank}**`, inline: true },
      { name: '📈 Progress', value: `\`${progressBar}\``, inline: false }
    );
  
  return embed;
}

/**
 * Create an economy embed
 * @param {string} title - Title
 * @param {object} options - Options
 */
function economy(title, options = {}) {
  const { 
    fields = [], 
    thumbnail = null, 
    user = null,
    balance = 0,
    bank = 0,
    wallet = 0
  } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.economy)
    .setAuthor({
      name: user ? `💰 ${user.username}'s Wallet` : `💰 Economy`,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setThumbnail(thumbnail || (user ? user.displayAvatarURL() : null))
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (user) {
    embed.addFields(
      { name: '💵 Wallet', value: `\`$${wallet.toLocaleString()}\``, inline: true },
      { name: '🏦 Bank', value: `\`$${bank.toLocaleString()}\``, inline: true },
      { name: '💰 Total', value: `\`$${balance.toLocaleString()}\``, inline: true }
    );
  }
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create a music embed
 * @param {string} title - Title
 * @param {object} options - Options
 */
function music(title, options = {}) {
  const { 
    fields = [], 
    thumbnail = null,
    song = null,
    queueLength = 0,
    duration = null,
    paused = false
  } = options;
  
  const status = paused ? '⏸️ Paused' : '▶️ Playing';
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.music)
    .setAuthor({
      name: `🎵 Music`,
      iconURL: BOT_AVATAR
    })
    .setTitle(song ? `🎵 ${song}` : title)
    .setDescription(song ? `${status}${duration ? ` • ${duration}` : ''}` : 'No track playing')
    .setThumbnail(thumbnail)
    .setFooter({
      text: `${queueLength > 0 ? `Queue: ${queueLength} songs` : ''} • ${BOT_NAME}`.trim(),
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create a ticket embed
 * @param {string} title - Title
 * @param {string} description - Description
 * @param {object} options - Additional options
 */
function ticket(title, description, options = {}) {
  const { fields = [], thumbnail = null, user = null, ticketId = null } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.tickets)
    .setAuthor({
      name: `🎫 Tickets`,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(thumbnail || (user ? user.displayAvatarURL() : null))
    .setFooter({
      text: ticketId ? `Ticket #${ticketId} • ${BOT_NAME}` : BOT_NAME,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create a pagination embed
 * @param {object} options - Options
 */
function pagination(options = {}) {
  const { 
    items = [], 
    currentPage = 1, 
    totalPages = 1, 
    title = 'Results',
    itemName = 'Item'
  } = options;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setAuthor({
      name: BOT_NAME,
      iconURL: BOT_AVATAR
    })
    .setTitle(`${title} (${currentPage}/${totalPages})`)
    .setFooter({
      text: `${BOT_NAME} • Page ${currentPage}/${totalPages}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (items && items.length > 0) {
    embed.addFields(items.map(item => ({
      name: item.name || itemName,
      value: item.value || '\u200B',
      inline: item.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create a loading embed
 * @param {string} message - Loading message
 */
function loading(message = 'Loading...') {
  return new EmbedBuilder()
    .setColor(COLORS.warning)
    .setAuthor({
      name: `⏳ ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTitle('Loading...')
    .setDescription(message)
    .setFooter({
      text: BOT_NAME,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
}

/**
 * Create a leaderboard embed
 * @param {string} title - Title
 * @param {array} entries - Leaderboard entries
 * @param {object} options - Additional options
 */
function leaderboard(title, entries, options = {}) {
  const { thumbnail = null, userRank = null, type = 'XP' } = options;
  
  const medalEmojis = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.economy)
    .setAuthor({
      name: `🏆 Leaderboard`,
      iconURL: BOT_AVATAR
    })
    .setTitle(`${title}`)
    .setThumbnail(thumbnail)
    .setFooter({
      text: `${BOT_NAME} • ${getDateString()}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  if (entries && entries.length > 0) {
    const fields = entries.slice(0, 10).map((entry, index) => ({
      name: `${medalEmojis[index + 1] || '🔹'} #${index + 1} ${entry.name || entry.user?.username || 'Unknown'}`,
      value: `${type}: \`${entry.value.toLocaleString()}\``,
      inline: false
    }));
    
    embed.addFields(fields);
  }
  
  if (userRank) {
    embed.addFields({
      name: '📊 Your Rank',
      value: `#${userRank}`,
      inline: true
    });
  }
  
  return embed;
}

/**
 * Create a poll embed
 * @param {string} question - Poll question
 * @param {array} options - Poll options
 * @param {object} options - Additional options
 */
function poll(question, options, pollOptions = {}) {
  const { thumbnail = null, votes = [], totalVotes = 0, multiple = false } = pollOptions;
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.secondary)
    .setAuthor({
      name: `📊 Poll`,
      iconURL: BOT_AVATAR
    })
    .setTitle(question)
    .setDescription(options.map((opt, i) => {
      const voteCount = votes[i] || 0;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      const bar = '█'.repeat(Math.ceil(percentage / 10)) + '░'.repeat(10 - Math.ceil(percentage / 10));
      return `\`${i + 1}\` ${opt}\n\`${bar}\` ${percentage}% (${voteCount} votes)`;
    }).join('\n\n'))
    .setThumbnail(thumbnail)
    .setFooter({
      text: `${totalVotes} total votes • ${multiple ? 'Multiple choice' : 'Single choice'} • ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  return embed;
}

/**
 * Create a giveaway embed
 * @param {string} title - Giveaway title
 * @param {object} options - Additional options
 */
function giveaway(title, options = {}) {
  const { 
    fields = [], 
    thumbnail = null,
    prize = null,
    winners = 1,
    endsAt = null,
    participants = 0,
    status = 'active'
  } = options;
  
  const statusColors = {
    active: COLORS.success,
    ended: COLORS.muted,
    cancelled: COLORS.error
  };
  
  const statusEmojis = {
    active: '🎁',
    ended: '🏁',
    cancelled: '❌'
  };
  
  const embed = new EmbedBuilder()
    .setColor(statusColors[status] || COLORS.primary)
    .setAuthor({
      name: `${statusEmojis[status] || '🎁'} Giveaway`,
      iconURL: BOT_AVATAR
    })
    .setTitle(title)
    .setDescription(prize ? `**Prize:** ${prize}` : 'A mystery prize!')
    .setThumbnail(thumbnail)
    .setFooter({
      text: `${participants} entries • ${winners} winner(s) • ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp()
    .addFields(
      { name: '🎁 Prize', value: prize || 'Mystery prize', inline: true },
      { name: '👑 Winners', value: String(winners), inline: true },
      { name: '📝 Entries', value: String(participants), inline: true }
    );
  
  if (endsAt) {
    embed.addFields({ name: '⏰ Ends', value: endsAt, inline: false });
  }
  
  if (fields && fields.length > 0) {
    embed.addFields(fields.map(f => ({
      name: f.name || '\u200B',
      value: f.value || '\u200B',
      inline: f.inline || false
    })));
  }
  
  return embed;
}

/**
 * Create a suggestion embed
 * @param {string} suggestion - Suggestion text
 * @param {object} options - Additional options
 */
function suggestion(suggestionText, options = {}) {
  const { 
    fields = [], 
    thumbnail = null,
    author = null,
    status = 'pending',
    upvotes = 0,
    downvotes = 0
  } = options;
  
  const statusColors = {
    pending: COLORS.warning,
    accepted: COLORS.success,
    rejected: COLORS.error
  };
  
  const statusEmojis = {
    pending: '⏳',
    accepted: '✅',
    rejected: '❌'
  };
  
  const embed = new EmbedBuilder()
    .setColor(statusColors[status] || COLORS.warning)
    .setAuthor({
      name: author ? `💡 Suggestion by ${author.username}` : `💡 Suggestion`,
      iconURL: BOT_AVATAR
    })
    .setTitle(`${statusEmojis[status] || '💡'} Suggestion`)
    .setDescription(suggestionText)
    .setThumbnail(thumbnail || (author ? author.displayAvatarURL() : null))
    .setFooter({
      text: `👍 ${upvotes} • 👎 ${downvotes} • ${BOT_NAME}`,
      iconURL: BOT_AVATAR
    })
    .setTimestamp();
  
  return embed;
}

module.exports = {
  COLORS,
  success,
  error,
  info,
  warning,
  modAction,
  welcome,
  leave,
  rank,
  economy,
  music,
  ticket,
  pagination,
  loading,
  leaderboard,
  poll,
  giveaway,
  suggestion,
  baseEmbed
};