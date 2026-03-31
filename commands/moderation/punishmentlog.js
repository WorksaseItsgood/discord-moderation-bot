/**
 * Punishment Log Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('punishmentlog')
    .setDescription('View punishment history')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    const embed = new EmbedBuilder()
      .setTitle('📋 Punishment Log')
      .setDescription(user ? `Punishments for ${user.username}:\n• Warn - 2 days ago\n• Mute - 5 days ago` : 'Recent punishments:\n• User1 - Warn\n• User2 - Ban')
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};