/**
 * Command Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandstats')
    .setDescription('View command usage statistics'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📊 Command Stats')
      .setDescription('Top commands:')
      .addFields(
        { name: '1. ping', value: '5,000 uses', inline: true },
        { name: '2. help', value: '3,500 uses', inline: true },
        { name: '3. play', value: '2,000 uses', inline: true },
        { name: '4. ban', value: '1,500 uses', inline: true },
        { name: '5. warn', value: '1,000 uses', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};