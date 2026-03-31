const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Horoscope command - Daily horoscope
module.exports = {
  data: new SlashCommandBuilder()
    .setName('horoscope')
    .setDescription('Get your daily horoscope')
    .addStringOption(option =>
      option.setName('sign')
        .setDescription('Zodiac sign (aries, taurus, etc)')
        .setRequired(true)),
  async execute(interaction, client) {
    const sign = interaction.options.getString('sign').toLowerCase();
    
    const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    if (!validSigns.includes(sign)) {
      return interaction.reply({ content: 'Invalid sign! Use: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, or pisces', ephemeral: true });
    }
    
    const horoscopes = {
      aries: "Today is a great day to take initiative. Your actions will be rewarded.",
      taurus: "Patience will pay off today. Don't rush any decisions.",
      gemini: "Communication is key. Reach out to someone you've been meaning to contact.",
      cancer: "Focus on home and family today. A loved one may need your support.",
      leo: "Your confidence shines today. People are drawn to your energy.",
      virgo: "Details matter. Double-check your work before submitting.",
      libra: "Balance is important. Make sure to take time for yourself.",
      scorpio: "Your intensity serves you well today. Use it to accomplish goals.",
      sagittarius: "Adventure calls! Consider trying something new.",
      capricorn: "Hard work pays off. Stay focused on your long-term goals.",
      aquarius: "Your unique perspective is valued. Share your ideas.",
      pisces: "Trust your intuition. It won't lead you astray."
    };
    
    const signs = {
      aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
      leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
      sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
    };
    
    const embed = new EmbedBuilder()
      .setTitle(signs[sign] + ' Daily Horoscope: ' + sign.charAt(0).toUpperCase() + sign.slice(1))
      .setColor(0x9b59b6)
      .setDescription(horoscopes[sign])
      .setFooter({ text: new Date().toLocaleDateString() })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};