const { EmbedBuilder } = require('discord.js');

/**
 * ULTRA SUGGESTION SYSTEM
 * Upvote/downvote, status tracking, approve/reject
 */

class UltraSuggestionSystem {
  constructor(client) {
    this.client = client;
    this.suggestions = new Map();
    this.suggestionCount = 0;
    
    this.config = {
      channel: null,
      anonymous: false,
      upvoteThreshold: 5,
      autoApprove: false,
      staffRole: null,
    };
  }
  
  async init(guild) {
    this.guild = guild;
    console.log(`💡 UltraSuggestion System ready for ${guild.name}`);
  }
  
  async createSuggestion(user, suggestion, channel) {
    this.suggestionCount++;
    const id = this.suggestionCount;
    
    const suggestionData = {
      id,
      user: user.id,
      suggestion,
      upvotes: new Set(),
      downvotes: new Set(),
      status: 'pending',
      staffNote: null,
      implemented: false,
      createdAt: Date.now(),
    };
    
    this.suggestions.set(id, suggestionData);
    
    // Send to channel
    const embed = new EmbedBuilder()
      .setTitle(`💡 Suggestion #${id}`)
      .setDescription(suggestion)
      .addFields(
        { name: 'By', value: user.tag, inline: true },
        { name: 'Status', value: '📝 Pending', inline: true },
        { name: 'Votes', value: '⬆️ 0 | ⬇️ 0', inline: true },
      )
      .setColor(0xFFA500)
      .setTimestamp();
    
    if (channel) {
      const msg = await channel.send({ embeds: [embed] });
      suggestionData.message = msg;
      
      await msg.react('⬆️');
      await msg.react('⬇️');
    }
    
    return suggestionData;
  }
  
  async handleVote(msgId, user, vote) {
    const suggestion = this.suggestions.get(msgId);
    if (!suggestion) return false;
    
    if (vote === 'up') {
      if (suggestion.downvotes.has(user.id)) {
        suggestion.downvotes.delete(user.id);
      }
      suggestion.upvotes.add(user.id);
    } else {
      if (suggestion.upvotes.has(user.id)) {
        suggestion.upvotes.delete(user.id);
      }
      suggestion.downvotes.add(user.id);
    }
    
    // Update message
    if (suggestion.message) {
      const upCount = suggestion.upvotes.size;
      const downCount = suggestion.downvotes.size;
      const total = upCount - downCount;
      
      const embed = EmbedBuilder.from(suggestion.message.embeds[0]);
      embed.spliceFields(2, 1, { name: 'Votes', value: `⬆️ ${upCount} | ⬇️ ${downCount}`, inline: true });
      
      // Auto consider if enough upvotes
      if (total >= this.config.upvoteThreshold && suggestion.status === 'pending') {
        embed.spliceFields(1, 1, { name: 'Status', value: '👀 Under Review', inline: true });
      }
      
      await suggestion.message.edit({ embeds: [embed] });
    }
    
    return true;
  }
  
  async approveSuggestion(msgId, staff, note) {
    const suggestion = this.suggestions.get(msgId);
    if (!suggestion) return false;
    
    suggestion.status = 'approved';
    suggestion.staffNote = note;
    
    if (suggestion.message) {
      const embed = EmbedBuilder.from(suggestion.message.embeds[0]);
      embed.spliceFields(1, 1, { name: 'Status', value: '✅ Approved', inline: true });
      embed.setColor(0x00FF00);
      
      if (note) {
        embed.addFields({ name: 'Note', value: note });
      }
      
      await suggestion.message.edit({ embeds: [embed] });
    }
    
    return true;
  }
  
  async rejectSuggestion(msgId, staff, note) {
    const suggestion = this.suggestions.get(msgId);
    if (!suggestion) return false;
    
    suggestion.status = 'rejected';
    suggestion.staffNote = note;
    
    if (suggestion.message) {
      const embed = EmbedBuilder.from(suggestion.message.embeds[0]);
      embed.spliceFields(1, 1, { name: 'Status', value: '❌ Rejected', inline: true });
      embed.setColor(0xFF0000);
      
      if (note) {
        embed.addFields({ name: 'Note', value: note });
      }
      
      await suggestion.message.edit({ embeds: [embed] });
    }
    
    return true;
  }
  
  async markImplemented(msgId) {
    const suggestion = this.suggestions.get(msgId);
    if (!suggestion) return false;
    
    suggestion.implemented = true;
    suggestion.status = 'implemented';
    
    if (suggestion.message) {
      const embed = EmbedBuilder.from(suggestion.message.embeds[0]);
      embed.spliceFields(1, 1, { name: 'Status', value: '🔨 Implemented!', inline: true });
      embed.setColor(0x00FF00);
      
      await suggestion.message.edit({ embeds: [embed] });
    }
    
    return true;
  }
}

module.exports = UltraSuggestionSystem;