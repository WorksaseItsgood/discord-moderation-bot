/**
 * Volume Command - Set volume
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set volume')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Volume level (0-100)')
        .setMinValue(0)
        .setMaxValue(100)
    ),
  
  async execute(interaction, client) {
    const volume = interaction.options.getInteger('level');
    const queue = client.distube.getQueue(interaction.guild);
    
    if (!volume && volume !== 0) {
      const embed = new EmbedBuilder()
        .setTitle('🔊 Volume')
        .setDescription(`Current volume: **${queue?.volume || 100}%**`)
        .setColor(0x0099ff);
      
      return interaction.reply({ embeds: [embed] });
    }
    
    if (!queue) {
      return interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
    }
    
    queue.setVolume(volume);
    
    await interaction.reply({ content: `🔊 Volume set to **${volume}%**` });
  }
};