/**
 * Profile Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.username}'s Profile`)
      .addFields(
        { name: 'Reputation', value: '50', inline: true },
        { name: 'Balance', value: '1,000 coins', inline: true },
        { name: 'Joined', value: 'Today', inline: true }
      )
      .setThumbnail(user.displayAvatarURL())
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};