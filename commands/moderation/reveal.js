/**
 * Reveal Channel Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reveal')
    .setDescription('Reveal a hidden channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel').setRequired(false)),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
      .setTitle('👁️ Channel Revealed')
      .setDescription('**Channel:** ' + channel.name)
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};