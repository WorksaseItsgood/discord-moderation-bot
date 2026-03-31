/**
 * Hastebin Command - Create a hastebin paste
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hastebin')
    .setDescription('Create a hastebin paste')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to paste')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    try {
      const res = await fetch('https://hastebin.com/documents', {
        method: 'POST',
        body: text,
        headers: { 'Content-Type': 'text/plain' }
      });
      const data = await res.json();
      
      const embed = new EmbedBuilder()
        .setTitle('📋 Hastebin Paste')
        .setDescription(`Created: https://hastebin.com/${data.key}`)
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to create paste!', ephemeral: true });
    }
  }
};