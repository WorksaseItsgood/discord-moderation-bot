/**
 * News Command - Post news/announcements with embed
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Post a news announcement')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('News title')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('content')
        .setDescription('News content')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('embed color (hex)')
        .setRequired(false)
    ),
  permissions: ['ManageMessages'],
  
  async execute(interaction, client) {
    const title = interaction.options.getString('title');
    const content = interaction.options.getString('content');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const color = interaction.options.getString('color') || '00ff00';
    
    const embed = new EmbedBuilder()
      .setTitle(`📢 ${title}`)
      .setDescription(content)
      .setColor(parseInt(color.replace('#', ''), 16) || 0x00ff00)
      .setTimestamp();
    
    await channel.send({ embeds: [embed] });
    
    await interaction.reply({ content: `News posted in ${channel}!`, ephemeral: true });
  }
};