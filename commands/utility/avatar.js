/**
 * Avatar Command - Get user avatar
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get user avatar')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get avatar (optional)')
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setColor(0x0099ff)
      .setImage(user.displayAvatarURL({ size: 512 }))
      .setDescription(`[Download](${user.displayAvatarURL({ size: 4096 })})`);
    
    await interaction.reply({ embeds: [embed] });
  }
};