const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Get info about a color')
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Hex color code or color name')
        .setRequired(true)),
  async execute(interaction) {
    let input = interaction.options.getString('color').replace('#', '');
    
    // Validate hex
    if (!/^[0-9A-Fa-f]{6}$/.test(input)) {
      return interaction.reply({ content: '❌ Invalid color! Use a hex code like #FF5733', ephemeral: true });
    }

    const hex = input.toUpperCase();
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate complementary
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    const compHex = '#' + compR.toString(16).padStart(2, '0') + compG.toString(16).padStart(2, '0') + compB.toString(16).padStart(2, '0');

    // RGB to HSL
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      }
    }

    const embed = {
      title: '🎨 Color Info',
      description: `**Hex:** #${hex}\n**RGB:** ${r}, ${g}, ${b}\n**HSL:** ${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%\n**Complementary:** ${compHex}`,
      color: parseInt(hex, 16),
      thumbnail: { url: `https://singlecolorimage.com/${hex}/100x100` },
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};