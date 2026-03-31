const { SlashCommandBuilder } = require('discord.js');

const templates = [
  { text: 'Change my mind', bottom: '' },
  { text: 'I think', bottom: 'isnt bad' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changemymind')
    .setDescription('Change my mind meme')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text for the meme')
        .setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    
    const embed = {
      title: '🧠 Change My Mind',
      description: `${text}\n\n_Change my mind_`,
      image: { url: 'https://api.memegen.com/images/changemymind.png' },
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};