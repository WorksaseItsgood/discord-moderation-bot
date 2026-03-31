/**
 * Wasted Command - GTA Wasted effect
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wasted')
    .setDescription('Apply GTA Wasted effect')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to waste')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    const embed = new EmbedBuilder()
      .setTitle('💀 WASTED')
      .setDescription(`${user}`)
      .setColor(0xff0000);
    
    if (user.avatar) {
      embed.setImage('https://cdn.nickf.com/2021/03/18/6ac5e-wasted.png');
      embed.setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`);
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};