const { SlashCommandBuilder } = require('discord.js');

const questions = [
  { q: "Would you rather have infinite money or infinite time?", a: "💰 Infinite money" },
  { q: "Would you rather be invisible or be able to read minds?", a: "👻 Invisible" },
  { q: "Would you rather always be 10 minutes late or 20 minutes early?", a: "⏰ 20 minutes early" },
  { q: "Would you rather fight 1 horse-sized duck or 100 duck-sized horses?", a: "🦆 1 horse-sized duck" },
  { q: "Would youRather be able to fly or be invisible?", a: "🛫 Fly" },
  { q: "Would you rather never use social media again or never watch TV again?", a: "📱 Never use social media" },
  { q: "Would you Rather have super strength or super speed?", a: "💪 Super strength" },
  { q: "Would you rather live without music or live without movies?", a: "🎵 Live without music" },
  { q: "Would you rather have a rewind button or a pause button for your life?", a: "⏪ Rewind button" },
  { q: "Would you rather explore space or the ocean?", a: "🚀 Explore space" },
  { q: "Would you rather be famous or be the best friend of someone famous?", a: "⭐ Best friend" },
  { q: "Would you rather have no taste or no smell?", a: "👃 No smell" },
  { q: "Would you rather always win or always be surprised?", a: "🎁 Always surprised" },
  { q: "Would you rather have more luck or more skill?", a: "🍀 More luck" },
  { q: "Would you rather be able to teleport or be able to read thoughts?", a: "🌀 Teleport" },
  { q: "Would you rather have a private jet or a submarine?", a: "✈️ Private jet" },
  { q: "Would you rather have no enemies or many friends?", a: "🤝 Many friends" },
  { q: "Would you rather live in the past or in the future?", a: "⏮️ Live in the past" },
  { q: "Would you rather be a genius or a legend?", a: "🧠 Genius" },
  { q: "Would you rather have unlimited free food or free travel?", a: "🍕 Unlimited free food" },
  { q: "Would you rather know how you will die or when you will die?", a: "📅 Know when" },
  { q: "Would you rather have no phone or no car?", a: "📱 No phone" },
  { q: "Would you rather be the funniest or the smartest person?", a: "🤓 Smartest" },
  { q: "Would you rather have a pause button for your life or a rewind button?", a: "⏸️ Pause button" },
  { q: "Would you rather be able to talk to animals or speak all languages?", a: "🐾 Talk to animals" },
  { q: "Would you rather have a dragon or a unicorn as a pet?", a: "🐉 Dragon" },
  { q: "Would you rather live in a treehouse or a castle?", a: "🏰 Castle" },
  { q: "Would you rather have no internet for a month or no TV for a year?", a: "📡 No internet" },
  { q: "Would you rather be famous for something bad or unknown for something good?", a: "⭐ Famous for good" },
  { q: "Would you rather have super vision or super hearing?", a: "👁️ Super vision" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Would you rather...'),
  async execute(interaction) {
    const q = questions[Math.floor(Math.random() * questions.length)];

    const embed = {
      title: '🤔 Would You Rather...',
      description: q.q,
      color: 0xFF6B6B,
      fields: [
        { name: '💭 Hint', value: 'Everyone answers differently!', inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};