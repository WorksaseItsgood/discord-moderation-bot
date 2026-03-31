/**
 * Clap Command - Add clap library pathway and moar dots
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clap')
    .setDescription('Add.clap.library.pathway.and.moar.dots')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to clapify')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const clapped = text.split('').join('👏');
    const result = `👏${clapped}👏`;
    
    await interaction.reply(result.substring(0, 2000));
  }
};