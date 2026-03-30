/**
 * 8Ball Command - Ask the magic 8ball
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    
    const answers = [
      { text: 'It is certain.', color: 0x00ff00 },
      { text: 'Without a doubt.', color: 0x00ff00 },
      { text: 'Yes - definitely.', color: 0x00ff00 },
      { text: 'You may rely on it.', color: 0x00ff00 },
      { text: 'As I see it, yes.', color: 0x00ff00 },
      { text: 'Most likely.', color: 0x00ff00 },
      { text: 'Outlook good.', color: 0x00ff00 },
      { text: 'Yes.', color: 0x00ff00 },
      { text: 'Reply hazy, try again.', color: 0xffaa00 },
      { text: 'Ask again later.', color: 0xffaa00 },
      { text: 'Better not tell you now.', color: 0xffaa00 },
      { text: 'Cannot predict now.', color: 0xffaa00 },
      { text: 'Concentrate and ask again.', color: 0xffaa00 },
      { text: "Don't count on it.", color: 0xff0000 },
      { text: 'My reply is no.', color: 0xff0000 },
      { text: 'My sources say no.', color: 0xff0000 },
      { text: 'Outlook not so good.', color: 0xff0000 },
      { text: 'Very doubtful.', color: 0xff0000 }
    ];
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🎱 Magic 8ball')
      .setColor(answer.color)
      .addFields(
        { name: '❓ Question', value: question },
        { name: '🎱 Answer', value: answer.text }
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};