/**
 * Skip Command - Skip current song
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),
  
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);
    
    if (!queue) {
      return interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
    }
    
    try {
      const song = queue.songs[0];
      queue.skip();
      
      await interaction.reply({ content: `⏭️ Skipped: ${song.name}` });
    } catch (e) {
      await interaction.reply({ content: 'Error skipping song!', ephemeral: true });
    }
  }
};