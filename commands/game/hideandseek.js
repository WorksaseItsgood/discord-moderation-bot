/**
 * Hide and Seek Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hideandseek')
    .setDescription('Play Hide and Seek with server members'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🔍 Hide and Seek')
      .setDescription('One person hides, others seek!\n\nSeeker: Count to 20 then find the hiders!\n\nReact to join!')
      .setColor(0x0000ff)
      .setFooter({ text: 'React to join game' });
    
    await interaction.reply({ embeds: [embed] });
  }
};