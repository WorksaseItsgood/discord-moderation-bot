/**
 * Hackysack Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hackysack')
    .setDescription('Keep the hacky sack in the air!'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('⚽ Hackysack Challenge')
      .setDescription('Keep the hacky sack in the air as long as possible!\n\nClick to kick!')
      .setColor(0x00ff00)
      .setFooter({ text: `Played by: ${interaction.user.username}` });
    
    await interaction.reply({ embeds: [embed] });
  }
};