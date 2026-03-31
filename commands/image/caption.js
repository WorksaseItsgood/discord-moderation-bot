/**
 * Caption Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('caption')
    .setDescription('Add caption to image')
    .addStringOption(option => option.setName('text').setDescription('Caption text').setRequired(true))
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    await interaction.reply({ content: `📝 Caption: "${text}"` });
  }
};