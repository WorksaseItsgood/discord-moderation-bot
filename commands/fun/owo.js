const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// OwO command - OwOify text
module.exports = {
  data: new SlashCommandBuilder()
    .setName('owo')
    .setDescription('OwOify your text')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to owOify')
        .setRequired(true)),
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    let owoText = text
      .replace(/r/g, 'w')
      .replace(/l/g, 'w')
      .replace(/R/g, 'W')
      .replace(/L/g, 'W')
      .replace(/n([aeiou])/g, 'ny$1')
      .replace(/N([aeiou])/g, 'Ny$1')
      .replace(/N([AEIOU])/g, 'NY$1')
      .replace(/!+$/g, ' w予 w予 w予')
      .replace(/\./g, '~');
    
    const faces = ['(◕ω◕)', '(◠ᴥ◠)', '(◕‿◕)', ' uwq ', '>:3', 'x3'];
    const face = faces[Math.floor(Math.random() * faces.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('OwOified!')
      .setColor(0xff69b4)
      .setDescription(owoText)
      .setFooter({ text: face });
    
    await interaction.reply({ embeds: [embed] });
  }
};