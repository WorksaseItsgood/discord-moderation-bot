/**
 * Banner Command - Get user banner
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Get user banner')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get banner (optional)')
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    // Fetch user to get banner
    const fetchedUser = await client.users.fetch(user.id).catch(() => null);
    
    if (!fetchedUser || !fetchedUser.banner) {
      return interaction.reply({ 
        content: `${user.username} doesn't have a banner!`,
        ephemeral: true 
      });
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Banner`)
      .setColor(0x0099ff)
      .setImage(fetchedUser.bannerURL({ size: 512 }))
      .setDescription(`[Download](${fetchedUser.bannerURL({ size: 4096 })})`);
    
    await interaction.reply({ embeds: [embed] });
  }
};