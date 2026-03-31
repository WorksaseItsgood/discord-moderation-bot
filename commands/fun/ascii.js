/**
 * ASCII Art Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('Generate ASCII art')
    .addStringOption(option => option.setName('text').setDescription('Text to convert').setRequired(true)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    await interaction.reply({ content: `\`\`\`\n${text.toUpperCase()}\n\`\`\`` });
  }
};