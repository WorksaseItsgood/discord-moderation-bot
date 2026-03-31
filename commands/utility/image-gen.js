/**
 * Image Command - Generate AI image
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Generate an AI image')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Image prompt')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const prompt = interaction.options.getString('prompt');
    
    // Demo - using a free placeholder API or custom implementation
    const embed = new EmbedBuilder()
      .setTitle('🖼️ AI Image Generation')
      .setDescription(`Prompt: ${prompt}`)
      .addFields(
        { name: 'Note', value: 'AI image generation requires a paid API key. Configure in bot settings.' },
        { name: 'Supported APIs', value: 'DALL-E, Stable Diffusion, Midjourney (with API key)' }
      )
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};