const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tableflip')
    .setDescription('Flip a table (animation)'),
  async execute(interaction) {
    const flips = [
      '(╯°□°）╯︵ ┻━┻',
      '(╯°□°)\n╯︵ ┻━┻',
      '┻━┻ ノ(°□°ノ)\n(flip)!',
      '(╯︵⁰_library⁰)︵ ┻━┻',
      '┻━┻\n╯(°□°)\n╯︵ ┻━┻',
    ];

    await interaction.reply({ content: flips[Math.floor(Math.random() * flips.length)] });
  },
};