/**
 * Beautiful Command - Rate beauty (simulation)
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beautiful')
    .setDescription('Rate beauty')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to rate')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    const score = Math.floor(Math.random() * 11); // 0-10
    
    const faces = ['😞', '😕', '😐', '🙂', '😊', '😄', '😁', '😃', '😆', '🥳', '😍'];
    const face = faces[score];
    
    const embed = new EmbedBuilder()
      .setTitle('💖 Beauty Rating')
      .setDescription(`${user} is **${score}/10** ${face}`)
      .setColor(score >= 7 ? 0xff69b4 : score >= 4 ? 0xffd700 : 0xff0000);
    
    if (user.avatar) {
      embed.setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`);
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};