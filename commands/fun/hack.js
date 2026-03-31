const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hack')
    .setDescription('Fake hack someone (for fun!)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Who to hack')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const hacker = interaction.user;

    const steps = [
      '🔌 Connecting to server...',
      '🔍 Scanning IP address...',
      '💉 Injecting SQL payload...',
      '🔓 Bypassing firewall...',
      '📂 Accessing files...',
      '🗝️ Decrypting password...',
      '💀 Root access obtained!',
      '📤 Uploading data...',
      '🧹 Covering tracks...',
      '✅ Hack complete!'
    ];

    const messages = [];
    for (const step of steps) {
      messages.push(step);
    }

    await interaction.reply(`🧑‍💻 **${hacker.tag}** is hacking **${target.tag}**...`);

    for (let i = 0; i < steps.length; i++) {
      setTimeout(async () => {
        await interaction.followUp(step[i]);
      }, i * 500);
    }

    setTimeout(async () => {
      const phrases = [
        `💀 Successfully hacked ${target.tag}! Data stolen: 1337 MB`,
        `🔓 Hacked ${target.tag}'s account! Password cracked: "password123"`,
        `📂 Copied all files from ${target.tag}'s PC!`,
        `🪓 Bricked ${target.tag}'s computer!`
      ];
      const result = phrases[Math.floor(Math.random() * phrases.length)];
      await interaction.followUp(result);
    }, steps.length * 500);
  },
};