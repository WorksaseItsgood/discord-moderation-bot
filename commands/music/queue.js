/**
 * Queue Command - Show music queue
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show music queue'),
  
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);
    
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: 'Queue is empty!', ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🎵 Music Queue')
      .setColor(0x0099ff)
      .setDescription(queue.songs.map((song, i) => 
        `${i === 0 ? '▶️' : i + 1}. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
      ).join('\n'))
      .setFooter({ text: `Total: ${queue.songs.length} songs | Duration: ${queue.formattedDuration}` });
    
    await interaction.reply({ embeds: [embed] });
  }
};