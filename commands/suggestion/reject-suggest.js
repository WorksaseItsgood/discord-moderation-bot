/**
 * Reject Suggest Command - Reject a suggestion
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reject-suggest')
    .setDescription('Reject a suggestion')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('Suggestion message ID')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for rejection')
    ),
  
  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    const reason = interaction.options.getString('reason');
    const guildId = interaction.guildId;
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need ManageGuild permission!', ephemeral: true });
    }
    
    // Get suggestion
    const suggestion = client.dbManager.getSuggestion(messageId, guildId);
    
    if (!suggestion) {
      return interaction.reply({ content: 'Suggestion not found!', ephemeral: true });
    }
    
    // Update status
    client.dbManager.updateSuggestionStatus(messageId, guildId, 'rejected', reason, interaction.user.id);
    
    // Update the original message
    const channel = interaction.guild.channels.cache.find(ch => 
      ch.messages && ch.messages.cache.has(messageId)
    );
    
    if (channel) {
      const message = await channel.messages.fetch(messageId).catch(() => null);
      
      if (message) {
        const embed = new EmbedBuilder(message.embeds[0]?.toJSON() || {})
          .setColor(0xff0000)
          .setFooter({ text: '❌ Rejected' });
        
        if (reason) {
          embed.addFields({ name: '📝 Reason', value: reason });
        }
        
        await message.edit({ embeds: [embed] });
        await message.reactions.removeAll();
        await message.react('❌');
      }
    }
    
    await interaction.reply({ content: 'Suggestion rejected!', ephemeral: true });
  }
};