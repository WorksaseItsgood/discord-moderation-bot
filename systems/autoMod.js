const { EmbedBuilder, AuditLogEvent } = require('discord.js');

/**
 * ULTRA ADVANCED AUTO-MODERATION SYSTEM
 * Message filtering, scam detection, link blocking, graduated punishments
 */

class AutoModSystem {
  constructor(client) {
    this.client = client;
    this.messageLogs = new Map(); // Track recent messages per user
    
    // Config
    this.config = {
      // Message filtering
      maxCaps: 70,                    // Max caps percentage
      maxMentions: 5,                 // Max mentions per message
      maxEmojis: 3,                   // Max emojis per message
      maxLinks: 3,                    // Max links per message
      minMessageLength: 5,             // Minimum message length to check
      
      // Filters enabled
      filterCaps: true,
      filterMentions: true,
      filterEmojis: true,
      filterLinks: true,
      filterInvite: true,               // Filter other server invites
      filterScam: true,                // Filter scam messages
      filterPhishing: true,           // Filter phishing
      filterWordList: true,           // Filter custom words
      
      // punishments (escalation)
      firstWarning: 'warn',
      secondWarning: 'mute',
      thirdWarning: 'kick',
      fourthWarning: 'ban',
      
      // Warning expiry
      warningExpiryDays: 7,              // Warnings expire after 7 days
      
      // Scam patterns (simplified - no optional chaining to avoid parsing issues)
      scamPatterns: [
        /discord nitro free/i,
        /free nitro/i,
        /steam gift/i,
        /epic games free/i,
        /fortnite vbucks/i,
        /valorant points/i,
        /amazon gift card/i,
        /apple gift card/i,
        /google play card/i,
        /verify account/i,
        /confirm password/i,
        /crypto wallet/i,
        /wallet connect/i,
        /metamask verify/i,
      ],
      
      // Phishing patterns
      phishingPatterns: [
        /dlscord/gi,
        /discrod/gi,
        /doscord/gi,
        /discord..(cf|cc|xyz|gg|moe)/gi,
        /steam..(cf|cc|xyz|gg|moe)/gi,
        /epicgames..(cf|cc|xyz|gg|moe)/gi,
        /login.?discord/gi,
        /password.?reset/gi,
        /verify.?token/gi,
      ],
      
      // Word list (custom words to filter)
      wordList: [
        // Add custom words here
      ],
      
      // Blocked domains
      blockedDomains: new Set([
        'disboard.org',
        'discords.com',
        'discordnitro.net',
      ]),
      
      // Allowed domains
      allowedDomains: new Set([
        'discord.com',
        'discord.gg',
        'discord.link',
        'support.discord.com',
        'status.discord.com',
      ]),
      
      // Auto-timeout for spam
      autoTimeout: true,
      timeoutDuration: 300000,         // 5 minutes
      
      // Log channel
      logChannel: null,
    };
  }
  
  /**
   * Initialize
   */
  async init(guild) {
    this.guild = guild;
    await this.loadConfig();
    
    console.log(`🤖 AutoMod System initialized for ${guild.name}`);
  }
  
  /**
   * Load config
   */
  async loadConfig() {
    try {
      const db = require('../database');
      const config = await db.getGuildConfig(this.guild.id);
      if (config && config.autoModConfig) {
        this.config = { ...this.config, ...config.autoModConfig };
      }
    } catch (e) {
      // Database not available
    }
  }
  
  /**
   * Save config
   */
  async saveConfig() {
    try {
      const db = require('../database');
      await db.updateGuildConfig(this.guild.id, {
        autoModConfig: this.config,
      });
    } catch (e) {
      // Database not available
    }
  }
  
  /**
   * Analyze message
   */
  analyzeMessage(message) {
    if (!message.content) return null;
    
    const content = message.content;
    const issues = [];
    let shouldDelete = false;
    let shouldWarn = false;
    let shouldTimeout = false;
    
    // 1. Check for ALL CAPS
    if (this.config.filterCaps) {
      const capsPercent = this.calculateCapsPercent(content);
      if (capsPercent > this.config.maxCaps && content.length > 10) {
        issues.push({ type: 'caps', score: Math.min(capsPercent - this.config.maxCaps, 30) });
      }
    }
    
    // 2. Check for mentions
    if (this.config.filterMentions && message.mentions.users.size > this.config.maxMentions) {
      issues.push({ 
        type: 'mentions', 
        score: (message.mentions.users.size - this.config.maxMentions) * 10 
      });
      shouldWarn = true;
    }
    
    // 3. Check for emojis
    if (this.config.filterEmojis) {
      const emojiCount = (content.match(/<a?:\w+:\d+>/g) || []).length;
      if (emojiCount > this.config.maxEmojis) {
        issues.push({ type: 'emojis', score: (emojiCount - this.config.maxEmojis) * 10 });
      }
    }
    
    // 4. Check for invites to other servers
    if (this.config.filterInvite) {
      const inviteMatch = content.match(/discord\.(gg|invite\.io)\/[\w-]+/gi);
      if (inviteMatch) {
        // Allow if from mod
        const isMod = message.member.permissions.has('ManageMessages');
        if (!isMod) {
          issues.push({ type: 'invite', score: 50 });
        }
      }
    }
  
    // 5. Check for scam messages
    if (this.config.filterScam) {
      for (const pattern of this.config.scamPatterns) {
        if (pattern.test(content)) {
          issues.push({ type: 'scam', score: 100 });
          shouldDelete = true;
          break;
        }
      }
    }
    
    // 6. Check for phishing
    if (this.config.filterPhishing) {
      for (const pattern of this.config.phishingPatterns) {
        if (pattern.test(content)) {
          issues.push({ type: 'phishing', score: 100 });
          shouldDelete = true;
          break;
        }
      }
    }
    
    // 7. Check blocked domains
    if (this.config.filterLinks) {
      const urlMatch = content.match(/(https?:\/\/[^\s]+)/gi);
      if (urlMatch) {
        for (const url of urlMatch) {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace(/^www\./, '');
            
            if (this.config.blockedDomains.has(domain)) {
              issues.push({ type: 'blocked_domain', score: 80 });
              shouldDelete = true;
            }
          } catch (e) {
            // Invalid URL
          }
        }
      }
    }
    
    // 8. Check word list
    if (this.config.filterWordList && this.config.wordList.length > 0) {
      const lowerContent = content.toLowerCase();
      for (const word of this.config.wordList) {
        if (lowerContent.includes(word.toLowerCase())) {
          issues.push({ type: 'word', score: 50 });
          shouldDelete = true;
          break;
        }
      }
    }
    
    // Calculate total score
    const totalScore = issues.reduce((sum, issue) => sum + issue.score, 0);
    
    if (issues.length > 0) {
      return {
        issues,
        shouldDelete,
        shouldWarn,
        shouldTimeout,
        score: totalScore,
        action: totalScore >= 80 ? 'ban' :
                totalScore >= 50 ? 'kick' :
                totalScore >= 30 ? 'mute' :
                totalScore >= 10 ? 'warn' : null,
      };
    }
    
    return null;
  }
  
  /**
   * Calculate caps percentage
   */
  calculateCapsPercent(content) {
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;
    
    const caps = letters.replace(/[^A-Z]/g, '');
    return (caps.length / letters.length) * 100;
  }
  
  /**
   * Handle message
   */
  async handleMessage(message) {
    // Ignore bots and webhooks
    if (message.author.bot || message.webhookId) return null;
    
    // Ignore mods
    if (message.member.permissions.has('ManageMessages')) return null;
    
    // Analyze message
    const result = this.analyzeMessage(message);
    
    if (result && (result.shouldDelete || result.action)) {
      // Delete message if needed
      if (result.shouldDelete) {
        try {
          await message.delete();
        } catch (e) {
          // May not have permission
        }
      }
      
      // Log action
      await this.logAction(message, result);
      
      // Execute action
      if (result.action) {
        await this.executeAction(message.member, result.action, result.issues);
      }
      
      return result;
    }
    
    return null;
  }
  
  /**
   * Execute action on member
   */
  async executeAction(member, action, issues) {
    if (!member) return;
    
    const userId = member.id;
    
    // Track offenses
    if (!this.messageLogs.has(userId)) {
      this.messageLogs.set(userId, {
        offenses: [],
        lastAction: null,
      });
    }
    
    const userLog = this.messageLogs.get(userId);
    userLog.offenses.push({
      action,
      issues,
      timestamp: Date.now(),
    });
    
    // Clean old offenses (older than warning expiry days)
    const expiryMs = this.config.warningExpiryDays * 24 * 60 * 60 * 1000;
    userLog.offenses = userLog.offenses.filter(
      o => Date.now() - o.timestamp < expiryMs
    );
    
    // Get offense count for escalation
    const offenseCount = userLog.offenses.length;
    
    // Determine action based on escalation
    const escalatedAction = offenseCount >= 4 ? 'ban' :
                         offenseCount >= 3 ? 'kick' :
                         offenseCount >= 2 ? 'mute' :
                         action;
    
    switch (escalatedAction) {
      case 'ban':
        try {
          await member.ban({ reason: `AutoMod: ${issues.map(i => i.type).join(', ')}` });
        } catch (e) {}
        break;
        
      case 'kick':
        try {
          await member.kick(`AutoMod: ${issues.map(i => i.type).join(', ')}`);
        } catch (e) {}
        break;
        
      case 'mute':
        try {
          // Find or create mute role
          const muteRole = member.guild.roles.cache.find(r => r.name === 'Muted');
          if (muteRole) {
            await member.roles.add(muteRole);
          } else {
            // Timeout instead
            await member.timeout(this.config.timeoutDuration, 
              `AutoMod: ${issues.map(i => i.type).join(', ')}`);
          }
        } catch (e) {}
        break;
        
      case 'warn':
        try {
          await member.send(`⚠️ Please follow server rules!\n\nReason: ${issues.map(i => i.type).join(', ')}`);
        } catch (e) {}
        break;
    }
    
    userLog.lastAction = escalatedAction;
  }
  
  /**
   * Log action
   */
  async logAction(message, result) {
    if (!this.config.logChannel) return;
    
    const channel = this.client.channels.cache.get(this.config.logChannel);
    if (!channel) return;
    
    const embed = new EmbedBuilder()
      .setTitle('🤖 AutoMod Action')
      .addFields(
        { name: 'User', value: message.author.tag, inline: true },
        { name: 'Action', value: result.action || 'deleted', inline: true },
        { name: 'Issues', value: result.issues.map(i => i.type).join(', ') || 'N/A' },
        { name: 'Message', value: message.content.substring(0, 500) },
      )
      .setColor(0xFFA500)
      .setTimestamp();
    
    channel.send({ embeds: [embed] });
  }
  
  /**
   * Add word to filter
   */
  addWord(word) {
    if (!this.config.wordList.includes(word)) {
      this.config.wordList.push(word);
      this.saveConfig();
    }
  }
  
  /**
   * Remove word from filter
   */
  removeWord(word) {
    this.config.wordList = this.config.wordList.filter(w => w !== word);
    this.saveConfig();
  }
  
  /**
   * Add blocked domain
   */
  addBlockedDomain(domain) {
    this.config.blockedDomains.add(domain.toLowerCase());
    this.saveConfig();
  }
  
  /**
   * Add allowed domain
   */
  addAllowedDomain(domain) {
    this.config.allowedDomains.add(domain.toLowerCase());
    this.saveConfig();
  }
  
  /**
   * Set config
   */
  setConfig(key, value) {
    this.config[key] = value;
    this.saveConfig();
  }
}

// Export
module.exports = AutoModSystem;