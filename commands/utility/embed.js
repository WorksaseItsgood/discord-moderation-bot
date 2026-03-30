/**
 * Embed Command - Build custom embed
 */

const { SlashCommandBuilder, EmbedBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create a custom embed')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Embed title')
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Embed description')
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Embed color (hex)')
    )
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text')
    )
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL')
    ),
  
  async execute(interaction, client) {
    const title = interaction.options.getString('title') || 'Embed';
    const description = interaction.options.getString('description') || 'Description';
    const color = interaction.options.getString('color') || '0099ff';
    const footer = interaction.options.getString('footer');
    const image = interaction.options.getString('image');
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: 'You need ManageMessages permission!', ephemeral: true });
    }
    
    // Parse color
    const colorNum = parseInt(color.replace('#', ''), 16) || 0x0099ff;
    
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(colorNum);
    
    if (footer) {
      embed.setFooter({ text: footer });
    }
    
    if (image) {
      embed.setImage(image);
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};