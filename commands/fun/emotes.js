/**
 * Emotes Command - List server emotes
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emotes')
    .setDescription('List server emotes'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    const emotes = guild.emojis.cache;
    
    const embed = new EmbedBuilder()
      .setTitle('😊 Server Emotes')
      .setDescription(emotes.size > 0 ? emotes.map(e => e.toString()).join(' ') : 'No emotes set up!')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};