/**
 * Suggest Command - Submit a suggestion
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('Your suggestion')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const content = interaction.options.getString('suggestion');
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    
    // Check if suggestion channel is configured
    const channelId = client.dbManager.getSetting('suggestion_channel', guildId);
    
    if (!channelId) {
      return interaction.reply({ 
        content: 'Suggestion channel not configured! Ask an admin to set it up.',
        ephemeral: true 
      });
    }
    
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel) {
      return interaction.reply({ content: 'Suggestion channel not found!', ephemeral: true });
    }
    
    // Create suggestion embed
    const embed = new EmbedBuilder()
      .setTitle('💡 New Suggestion')
      .setColor(0x0099ff)
      .setDescription(content)
      .addFields(
        { name: '👤 Submitted by', value: interaction.user.toString() }
      )
      .setFooter({ text: 'Vote with 👍 or 👎' })
      .setTimestamp();
    
    // Send to channel
    const message = await channel.send({ embeds: [embed] });
    
    // Add reactions
    await message.react('👍');
    await message.react('👎');
    
    // Save to database
    client.dbManager.createSuggestion(message.id, userId, guildId, content);
    
    await interaction.reply({ 
      content: `Suggestion submitted to ${channel.toString()}!`,
      ephemeral: true 
    });
  }
};