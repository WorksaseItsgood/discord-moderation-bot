/**
 * Embed Builder Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Create a custom embed')
    .addStringOption(option => option.setName('title').setDescription('Embed title').setRequired(false))
    .addStringOption(option => option.setName('description').setDescription('Embed description').setRequired(false)),
  
  async execute(interaction, client) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    
    const embed = new EmbedBuilder()
      .setTitle(title || 'Embed')
      .setDescription(description || 'This is a custom embed!')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};