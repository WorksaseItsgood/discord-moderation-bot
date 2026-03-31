/**
 * Resume Command - Resume current song
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the current song'),
  
  async execute(interaction, client) {
    if (!client.distube) {
      return interaction.reply({ content: 'Music system not loaded!', ephemeral: true });
    }
    
    const queue = client.distube.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
    }
    
    queue.resume();
    await interaction.reply('▶️ Resumed!');
  }
};