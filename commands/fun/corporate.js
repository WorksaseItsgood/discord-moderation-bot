const { SlashCommandBuilder } = require('discord.js');

const phrases = [
  "Let's circle back on that",
  "We need to pivot",
  "Moving the needle",
  "Low-hanging fruit",
  "Synergize our efforts",
  "Best-in-class solution",
  "Value-added proposition",
  "Think outside the box",
  "Drill down deeper",
  "At the end of the day",
  "Touch base offline",
  "Take it to the next level",
  "Win-win situation",
  "Deep dive session",
  "On my radar",
  "Circle back",
  "Move the needle",
  "Leverage our assets",
  "Streamline operations",
  "Actionable insights",
  "Scalable solution",
  "Proactive approach",
  "Holistic view",
  "Key takeaway",
  "Game changer",
  "Boil the ocean",
  "Eat your own dog food",
  "Disrupt the market",
  "Lean into it"
];

const corporate = [
  "Let's schedule a sync",
  "I need bandwidth",
  "Can you own this?",
  "Let's offline this",
  "Per my last email",
  "CC the group",
  "Take this async",
  "Let's zoom later",
  "I'll calendar block",
  "Can you escalate?"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('corporate')
    .setDescription('Generate corporate speak'),
  async execute(interaction) {
    const allPhrases = [...phrases, ...corporate];
    const phrase = allPhrases[Math.floor(Math.random() * allPhrases.length)];

    const embed = {
      title: '💼 Corporate Speak',
      description: phrase,
      color: 0x1E3A5F,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};