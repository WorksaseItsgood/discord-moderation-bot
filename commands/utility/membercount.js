/**
 * Member Count Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('View member count'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle('👥 Member Count')
      .setDescription(`Total: ${guild.memberCount}\nHumans: ${guild.memberCount - 1}\nBots: 1`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};