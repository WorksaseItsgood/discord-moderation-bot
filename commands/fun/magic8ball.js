/**
 * Magic 8 Ball Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('magic8ball')
    .setDescription('Ask the magic 8 ball')
    .addStringOption(option => option.setName('question').setDescription('Your question').setRequired(true)),
  
  async execute(interaction, client) {
    const answers = [
      'Yes!', 'No!', 'Maybe!', 'Definitely!', 'Ask again later.',
      ' outlook good.', 'Don\'t count on it.', 'Yes - definitely!',
      'My sources say no.', 'Outlook not so good.', 'Very doubtful.'
    ];
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    const question = interaction.options.getString('question');
    
    const embed = new EmbedBuilder()
      .setTitle('🎱 Magic 8 Ball')
      .setDescription(`Question: ${question}\n\nAnswer: **${answer}**`)
      .setColor(0x0000ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};