/**
 * Emoji Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojistats')
    .setDescription('View emoji statistics'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Emoji Stats')
      .addFields(
        { name: 'Static Emojis', value: '15', inline: true },
        { name: 'Animated Emojis', value: '5', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};