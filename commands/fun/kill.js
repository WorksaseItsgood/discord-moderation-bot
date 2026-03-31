const { SlashCommandBuilder } = require('discord.js');

const kills = [
  { emoji: '🗡️', text: 'stabbed' },
  { emoji: '🔫', text: 'shot' },
  { emoji: '💣', text: 'blew up' },
  { emoji: '🪓', text: 'chopped' },
  { emoji: '🔥', text: 'burned' },
  { emoji: '🧊', text: 'froze' },
  { emoji: '⚡', text: 'electrocuted' },
  { emoji: '🦈', text: 'fed to sharks' },
  { emoji: '🐻', text: 'fed to bears' },
  { emoji: '🌋', text: 'volcanod' },
  { emoji: '🥶', text: 'turned into an icicle' },
  { emoji: '🕳️', text: 'fell in a hole' },
  { emoji: '😵', text: 'knocked out' },
  { emoji: '💀', text: 'yeeted into the void' },
  { emoji: '🪐', text: 'sent to space' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kill')
    .setDescription('Animated kill (for fun!)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Who to kill')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const killer = interaction.user;
    const kill = kills[Math.floor(Math.random() * kills.length)];

    const frames = [
      `${killer} pulls out a ${kill.emoji}...`,
      `${killer} aims at ${target}!`,
      `${killer} ${kill.text} ${target}!`,
      `💀 ${target} has been eliminated!`,
    ];

    for (let i = 0; i < frames.length; i++) {
      await interaction.reply(frames[i]);
      if (i < frames.length - 1) {
        await new Promise(r => setTimeout(r, 800));
      }
    }
  },
};