/**
 * Music Queue Command - View queue with buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { music, info, COLORS } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View the music queue'),
  
  async execute(interaction, client) {
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Get queue from music system
    const queue = client.musicQueue?.get(interaction.guild.id) || [];
    
    if (queue.length === 0) {
      const embed = info('🎵 Queue', 'The queue is empty. Add some songs!', {
        thumbnail: botAvatar
      });
      return interaction.reply({ embeds: [embed] });
    }
    
    // Pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(queue.length / itemsPerPage);
    let currentPage = 1;
    
    const createQueueEmbed = (page) => {
      const start = (page - 1) * itemsPerPage;
      const pageQueue = queue.slice(start, start + itemsPerPage);
      
      const embed = new EmbedBuilder()
        .setColor(COLORS.music)
        .setAuthor({
          name: '🎵 Music Queue',
          iconURL: botAvatar
        })
        .setTitle(`🎵 Queue (${queue.length} songs)`)
        .setDescription(pageQueue.map((song, i) => 
          `${start + i + 1}. **${song.title}** - ${song.duration || 'Unknown'}`
        ).join('\n'))
        .setThumbnail(botAvatar)
        .setFooter({
          text: `CrowBot • Page ${page}/${totalPages}`,
          iconURL: botAvatar
        })
        .setTimestamp();
      
      return embed;
    };
    
    const embed = createQueueEmbed(currentPage);
    
    // Queue control buttons
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('queue-shuffle')
          .setLabel('🔀 Shuffle')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('queue-clear')
          .setLabel('🗑️ Clear')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('queue-prev')
          .setLabel('⬅️ Prev')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage <= 1),
        new ButtonBuilder()
          .setLabel(`${currentPage}/${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('queue-next')
          .setLabel('Next ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage >= totalPages)
      );
    
    await interaction.reply({ embeds: [embed], components: [buttonRow] });
    
    // Collector for pagination
    const filter = i => i.customId.startsWith('queue-');
    const collector = interaction.message.createMessageComponentCollector({ filter, time: 60000 });
    
    collector.on('collect', async (i) => {
      if (i.customId === 'queue-prev') {
        currentPage = Math.max(1, currentPage - 1);
      } else if (i.customId === 'queue-next') {
        currentPage = Math.min(totalPages, currentPage + 1);
      }
      
      const newEmbed = createQueueEmbed(currentPage);
      
      const newButtonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('queue-shuffle')
            .setLabel('🔀 Shuffle')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('queue-clear')
            .setLabel('🗑️ Clear')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('queue-prev')
            .setLabel('⬅️ Prev')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage <= 1),
          new ButtonBuilder()
            .setLabel(`${currentPage}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('queue-next')
            .setLabel('Next ➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage >= totalPages)
        );
      
      await i.update({ embeds: [newEmbed], components: [newButtonRow] });
    });
  }
};