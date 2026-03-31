/**
 * Shuffle Command - Shuffle queue
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the queue'),
  
  async execute(interaction, client) {
    if (!client.distube) {
      return interaction.reply({ content: 'Music system not loaded!', ephemeral: true });
    }
    
    const queue = client.distube.getQueue(interaction.guild);
    if (!queue || queue.songs.length < 2) {
      return interaction.reply({ content: 'Queue is empty or has only 1 song!', ephemeral: true });
    }
    
    queue.shuffle();
    
    const embed = new EmbedBuilder()
      .setTitle('🔀 Queue Shuffled!')
      .setDescription(`Queue now has ${queue.songs.length} songs in random order`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};