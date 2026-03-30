/**
 * Stop Command - Stop music
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music'),
  
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);
    
    if (!queue) {
      return interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
    }
    
    queue.stop();
    
    await interaction.reply({ content: '⏹️ Stopped the music!' });
  }
};