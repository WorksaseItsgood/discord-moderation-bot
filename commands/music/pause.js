/**
 * Pause Command - Pause current song
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song'),
  
  async execute(interaction, client) {
    if (!client.distube) {
      return interaction.reply({ content: 'Music system not loaded!', ephemeral: true });
    }
    
    const queue = client.distube.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
    }
    
    queue.pause();
    await interaction.reply('⏸️ Paused!');
  }
};