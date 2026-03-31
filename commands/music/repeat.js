/**
 * Repeat Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Set repeat mode')
    .addStringOption(option => option.setName('mode').setDescription('Repeat mode')
      .addChoices(
        { name: 'Off', value: 'off' },
        { name: 'Song', value: 'song' },
        { name: 'Queue', value: 'queue' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    const mode = interaction.options.getString('mode') || 'off';
    
    await interaction.reply({ content: `🔁 Repeat mode set to: **${mode}**` });
  }
};