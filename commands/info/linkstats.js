/**
 * Link Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkstats')
    .setDescription('View link/ invite statistics'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🔗 Link Stats')
      .addFields(
        { name: 'Invites', value: '25', inline: true },
        { name: 'Vanity Links', value: '1', inline: true },
        { name: 'Widget Links', value: '3', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};