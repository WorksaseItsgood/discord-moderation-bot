/**
 * Translate Command - Translate text
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const languages = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
  ar: 'Arabic', hi: 'Hindi', nl: 'Dutch', sv: 'Swedish', pl: 'Polish'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('to')
        .setDescription('Target language')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const targetLang = interaction.options.getString('to');
    
    // Basic translations (demo - in production use Google Translate API)
    const demo = `Translation to ${languages[targetLang] || targetLang} (API not configured)`;
    
    const embed = new EmbedBuilder()
      .setTitle('🌐 Translation')
      .addFields(
        { name: 'Original', value: text },
        { name: `To ${languages[targetLang] || targetLang}`, value: demo }
      )
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};