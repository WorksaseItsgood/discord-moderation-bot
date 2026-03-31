/**
 * Mute Info Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('muteinfo')
    .setDescription('Get information about muted members'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🔇 Muted Members')
      .setDescription('Currently muted:\n• @User1 - 2 hours left\n• @User2 - 5 hours left')
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};