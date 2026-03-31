/**
 * Activity Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('View server activity'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📈 Activity')
      .addFields(
        { name: 'Messages Today', value: '1,234', inline: true },
        { name: 'Commands Today', value: '567', inline: true },
        { name: 'Joins Today', value: '23', inline: true },
        { name: 'Leaves Today', value: '5', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};