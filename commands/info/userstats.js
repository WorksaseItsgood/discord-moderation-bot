/**
 * User Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userstats')
    .setDescription('View user statistics')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${user.username}'s Stats`)
      .addFields(
        { name: 'Messages', value: '1,234', inline: true },
        { name: 'Commands', value: '567', inline: true },
        { name: 'Time Online', value: '50 hours', inline: true },
        { name: 'XP', value: '5,000', inline: true },
        { name: 'Level', value: '15', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};