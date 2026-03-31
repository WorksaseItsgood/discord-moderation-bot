const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * ULTRA GIVEAWAY SYSTEM
 * Multi-prize, bonus entries, role requirements
 */

class UltraGiveawaySystem {
  constructor(client) {
    this.client = client;
    this.giveaways = new Map();
  }
  
  async createGiveaway(manager, options) {
    const giveaway = {
      id: Date.now().toString(),
      prize: options.prize,
      description: options.description,
      winners: options.winners || 1,
      endsAt: options.endsAt,
      channel: options.channel,
      message: null,
      entries: new Set(),
      bonusEntries: new Map(),
      roleRequirement: options.roleRequirement,
      requiredRoles: options.requiredRoles || [],
      excludedRoles: options.excludedRoles || [],
      ended: false,
      winners: [],
    };
    
    this.giveaways.set(giveaway.id, giveaway);
    
    // Create embed
    const embed = this.createEmbed(giveaway);
    const row = new ActionRowBuilder()
      .addComponent(
        new ButtonBuilder()
          .setCustomId(`giveaway-${giveaway.id}`)
          .setLabel('🤞 Enter!')
          .setStyle(ButtonStyle.Success)
      );
    
    const msg = await options.channel.send({ embeds: [embed], components: [row] });
    giveaway.message = msg;
    
    // Schedule end
    const time = giveaway.endsAt - Date.now();
    if (time > 0) {
      setTimeout(() => this.endGiveaway(giveaway.id), time);
    }
    
    return giveaway;
  }
  
  createEmbed(giveaway) {
    const endsIn = giveaway.endsAt - Date.now();
    const timeLeft = endsIn > 0 ? this.formatTime(endsIn) : 'Ended';
    
    return new EmbedBuilder()
      .setTitle(`🎁 ${giveaway.prize}`)
      .setDescription(
        `**Description:** ${giveaway.description}\n` +
        `**Winners:** ${giveaway.winners}\n` +
        `**Ends:** ${timeLeft}\n` +
        `**Entries:** ${giveaway.entries.size}`
      )
      .setColor(0x5865F2)
      .setTimestamp(new Date(giveaway.endsAt));
  }
  
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
  
  async enterGiveaway(giveawayId, user) {
    const giveaway = this.giveaways.get(giveawayId);
    if (!giveaway || giveaway.ended) return false;
    
    // Check role requirements
    const member = await giveaway.channel.guild.members.fetch(user.id);
    
    if (giveaway.requiredRoles.length > 0) {
      const hasAll = giveaway.requiredRoles.every(r => member.roles.cache.has(r));
      if (!hasAll) return false;
    }
    
    // Check excluded roles
    if (giveaway.excludedRoles.some(r => member.roles.cache.has(r))) {
      return false;
    }
    
    giveaway.entries.add(user.id);
    return true;
  }
  
  async addBonusEntry(giveawayId, user, bonus) {
    const giveaway = this.giveaways.get(giveawayId);
    if (!giveaway || giveaway.ended) return false;
    
    const current = giveaway.bonusEntries.get(user.id) || 0;
    giveaway.bonusEntries.set(user.id, current + bonus);
    
    return true;
  }
  
  async endGiveaway(giveawayId) {
    const giveaway = this.giveaways.get(giveawayId);
    if (!giveaway || giveaway.ended) return;
    
    giveaway.ended = true;
    
    // Get all entries with bonus
    const weightedEntries = [];
    for (const userId of giveaway.entries) {
      const bonus = giveaway.bonusEntries.get(userId) || 0;
      const weight = 1 + bonus;
      for (let i = 0; i < weight; i++) {
        weightedEntries.push(userId);
      }
    }
    
    // Pick winners
    const winners = [];
    for (let i = 0; i < giveaway.winners; i++) {
      if (weightedEntries.length === 0) break;
      const index = Math.floor(Math.random() * weightedEntries.length);
      winners.push(weightedEntries[index]);
      // Remove all instances
      const winner = weightedEntries[index];
      const idx = weightedEntries.indexOf(winner);
      while (idx > -1) {
        weightedEntries.splice(idx, 1);
        idx = weightedEntries.indexOf(winner);
      }
    }
    
    giveaway.winners = winners;
    
    // Update embed
    const embed = this.createEmbed(giveaway);
    embed.setTitle(`🎁 ${giveaway.prize} - ENDED`);
    embed.addFields(
      { name: 'Winners', value: winners.map(w => `<@${w}>`).join(', ') || 'No winners' }
    );
    embed.setColor(0xFFD700);
    
    // Edit message
    if (giveaway.message) {
      await giveaway.message.edit({ embeds: [embed], components: [] });
      await giveaway.message.reply({ 
        content: `🎉 Congratulations ${winners.map(w => `<@${w}>`).join(', ')}! You won **${giveaway.prize}**!`
      });
    }
    
    return winners;
  }
  
  async rerollGiveaway(giveawayId) {
    const giveaway = this.giveaways.get(giveawayId);
    if (!giveaway || !giveaway.ended) return null;
    
    // Weighted entries (past winners removed)
    const eligible = Array.from(giveaway.entries).filter(e => !giveaway.winners.includes(e));
    if (eligible.length === 0) return null;
    
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    giveaway.winners.push(winner);
    
    // Notify
    if (giveaway.message) {
      await giveaway.message.reply({ content: `🎉 New winner: <@${winner}>!` });
    }
    
    return winner;
  }
}

module.exports = UltraGiveawaySystem;