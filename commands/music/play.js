/**
 * Play Command - Play music with buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { music, info, COLORS } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song')
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Song name or URL')
        .setRequired(false)),
  
  async execute(interaction, client) {
    const song = interaction.options.getString('song');
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    if (!song) {
      // Show music controls if no song provided
      const embed = info('🎵 Music', 'Add a song to play!', { thumbnail: botAvatar });
      return interaction.reply({ embeds: [embed] });
    }
    
    // Create loading embed
    const loadingEmbed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setAuthor({
        name: '🎵 Searching...',
        iconURL: botAvatar
      })
      .setTitle('Searching for: ' + song)
      .setDescription('⏳ Please wait...')
      .setFooter({
        text: 'CrowBot',
        iconURL: botAvatar
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [loadingEmbed] });
    
    // In a full implementation, this would integrate with a music system
    // For now, show search results with buttons
    
    const results = [
      { title: song + ' - Artist 1', duration: '3:45' },
      { title: song + ' - Artist 2', duration: '4:12' },
      { title: song + ' - Artist 3', duration: '2:58' }
    ];
    
    // Create results embed
    const embed = new EmbedBuilder()
      .setColor(COLORS.music)
      .setAuthor({
        name: '🎵 Search Results',
        iconURL: botAvatar
      })
      .setTitle('Select a song:')
      .setDescription(results.map((r, i) => 
        `\`${i + 1}\` **${r.title}** - ${r.duration}`
      ).join('\n'))
      .setThumbnail(botAvatar)
      .setFooter({
        text: 'CrowBot',
        iconURL: botAvatar
      })
      .setTimestamp();
    
    // Create selection buttons
    const buttonRow = new ActionRowBuilder();
    for (let i = 0; i < Math.min(results.length, 5); i++) {
      buttonRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`play-select-${i}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    // Music control buttons
    const controlRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('music-shuffle')
          .setLabel('🔀')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music-prev')
          .setLabel('⏮️')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music-pause')
          .setLabel('⏸️')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music-skip')
          .setLabel('⏭️')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music-queue')
          .setLabel('📋')
          .setStyle(ButtonStyle.Primary)
      );
    
    await interaction.editReply({ embeds: [embed], components: [buttonRow, controlRow] });
  }
};