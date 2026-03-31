/**
 * Urban Dictionary Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('urban')
    .setDescription('Search Urban Dictionary')
    .addStringOption(option => option.setName('term').setDescription('Term to search').setRequired(true)),
  
  async execute(interaction, client) {
    const term = interaction.options.getString('term');
    
    const embed = new EmbedBuilder()
      .setTitle(`📖 Urban Dictionary: ${term}`)
      .setDescription('Definition: A slang term used by the cool kids\n\nExample: "That drip is crazy!"')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};