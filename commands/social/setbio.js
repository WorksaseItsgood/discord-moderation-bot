/**
 * Set Bio Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbio')
    .setDescription('Set your bio')
    .addStringOption(option => option.setName('text').setDescription('Bio text').setRequired(true)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    await interaction.reply({ content: `📝 Your bio: ${text}` });
  }
};