/**
 * Channel Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelstats')
    .setDescription('View channel statistics'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Channel Stats')
      .addFields(
        { name: 'Text Channels', value: '24', inline: true },
        { name: 'Voice Channels', value: '12', inline: true },
        { name: 'Categories', value: '6', inline: true },
        { name: 'News Channels', value: '2', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};