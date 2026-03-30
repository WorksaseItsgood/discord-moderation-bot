/**
 * Emojis Command - List server emojis
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojis')
    .setDescription('List server emojis'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    const emojis = guild.emojis.cache;
    
    if (emojis.size === 0) {
      return interaction.reply({ content: 'This server has no emojis!', ephemeral: true });
    }
    
    // Separate regular and animated
    const regular = emojis.filter(e => !e.animated);
    const animated = emojis.filter(e => e.animated);
    
    const embed = new EmbedBuilder()
      .setTitle('😀 Server Emojis')
      .setColor(0x0099ff)
      .addFields(
        { name: `📸 Regular (${regular.size})`, value: regular.size > 0 ? regular.map(e => e.toString()).join(' ') : 'None' }
      );
    
    if (animated.size > 0) {
      embed.addFields({ name: `🎬 Animated (${animated.size})`, value: animated.map(e => e.toString()).join(' ') });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};