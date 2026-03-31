/**
 * Bot Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botstats')
    .setDescription('View bot statistics'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Stats')
      .addFields(
        { name: 'Servers', value: '1,234', inline: true },
        { name: 'Users', value: '50,000', inline: true },
        { name: 'Channels', value: '5,000', inline: true },
        { name: 'Commands', value: '500+', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};