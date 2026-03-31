const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Supreme command - Supreme logo maker (text only)
module.exports = {
  data: new SlashCommandBuilder()
    .setName('supreme')
    .setDescription('Create a Supreme-style logo text')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to make supreme')
        .setRequired(true)),
  async execute(interaction, client) {
    const text = interaction.options.getString('text').toUpperCase();
    
    const embed = new EmbedBuilder()
      .setTitle('SUPREME')
      .setColor(0xff0000)
      .setDescription('```' + text + ' SUPREME```')
      .setFooter({ text: 'Supreme™ style' });
    
    await interaction.reply({ embeds: [embed] });
  }
};