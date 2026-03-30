const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

// Embed generator command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create a custom embed')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Embed title')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Embed description')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Hex color (e.g., #00ff00)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction, client) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color');
    const footer = interaction.options.getString('footer');
    const image = interaction.options.getString('image');
    
    if (!title && !description) {
      return interaction.reply({
        content: '❌ Please provide at least a title or description!',
        ephemeral: true
      });
    }
    
    // Parse color
    let embedColor = 0x00ff00;
    if (color) {
      const hex = color.replace('#', '');
      embedColor = parseInt(hex, 16);
    }
    
    const embed = new EmbedBuilder()
      .setTitle(title || null)
      .setDescription(description || null)
      .setColor(embedColor);
    
    if (footer) {
      embed.setFooter({ text: footer });
    }
    
    if (image) {
      embed.setImage(image);
    }
    
    embed.setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};