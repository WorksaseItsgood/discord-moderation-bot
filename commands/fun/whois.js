/**
 * Whois Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Get user information')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.username}`)
      .setDescription(`ID: ${user.id}\nCreated: ${user.createdAt.toDateString()}`)
      .setThumbnail(user.displayAvatarURL())
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};