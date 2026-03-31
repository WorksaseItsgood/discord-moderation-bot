const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const responses = [
  "Yes - definitely!",
  "No - definitely not!",
  "Maybe - ask again later",
  "Signs point to yes!",
  "Signs point to no!",
  "Don't count on it!",
  "My sources say no!",
  "Outlook good!",
  "Outlook not so good...",
  "Very doubtful",
  "Without a doubt!",
  "Yes!",
  "No!",
  "You may rely on it",
  "Better not tell you now",
  "Reply hazy, try again",
  "Concentrate and ask again",
  "Don't dream about it",
  "It is certain!",
  "It is decidedly so",
  "Most likely",
  "My reply is no",
  "My sources say yes",
  "No news is good news",
  "One yes, one no",
  "Precisely",
  "So it shall be",
  "The answer is def no",
  "The answer is def yes",
  "Without question",
  "Yes - in due time",
  "Yes but no",
  "Yes and no",
  "A million percent yes",
  "Never in a million years",
  "Go for it!",
  "Stay away!",
  "100% chance!",
  "0% chance",
  "Ask your mom",
  "Ask your dad",
  "Consult the magic 8 ball...",
  "Outlook hazy, ask again",
  "Try again tomorrow",
  "Maybe... maybe not",
  "Only on Tuesdays",
  "If you believe so",
  "The universe says yes!",
  "The universe says no!",
  "42",
  "Depends on the moon phase",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8 ball a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = {
      title: '🎱 Magic 8 Ball',
      description: `**Question:** ${question}\n\n**Answer:** ${response}`,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};