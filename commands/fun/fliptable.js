const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fliptable')
    .setDescription('Flip table animation'),
  async execute(interaction) {
    const flips = [
      '(╯°□°）╯︵ ┻━┻',
      '┻━┻ ヽ(°□°)ﾉ︵ ┻━┻',
      '┻━┻\n╯(°□°)\n╯︵ ┻━┻',
      '(╯°)╯︵┻┻┻━┻\n(flip)',
    ];

    await interaction.reply({ content: flips[Math.floor(Math.random() * flips.length)] });
  },
};