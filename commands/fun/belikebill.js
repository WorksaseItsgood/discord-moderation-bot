const { SlashCommandBuilder } = require('discord.js');

const billTemplates = [
  "My name is Bill and I hate {thing}",
  "I'm Bill and I don't get {thing}",
  "Bill doesn't like {thing}",
  "I'm Bill. {thing} is not for me",
  "Bill says no to {thing}",
  "I am Bill and I think {thing} is stupid"
];

const things = [
  'pineapple on pizza', 'crypto', 'NFTs', 'Avengers', 'anime', 'coffee',
  'morning people', 'TikTok', 'cold weather', 'spiders', 'cilantro',
  'pineapple', 'rap music', 'country music', 'gum', 'vegetables',
  'people who are early', 'Saturdays', 'hats', 'socks with sandals',
  'newspapers', 'landlines', 'CDs', 'flip phones', 'cash',
  'air conditioning', ' heaters', 'modern art', 'NFTs', 'bots'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('belikebill')
    .setDescription('Generate a Bill meme')
    .addStringOption(option =>
      option.setName('thing')
        .setDescription('What Bill doesn\'t like')
        .setRequired(true)),
  async execute(interaction) {
    const thing = interaction.options.getString('thing');
    const template = billTemplates[Math.floor(Math.random() * billTemplates.length)];
    
    const embed = {
      title: '🐴 Be Like Bill',
      description: template.replace('{thing}', thing),
      color: 0xFFD700,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};