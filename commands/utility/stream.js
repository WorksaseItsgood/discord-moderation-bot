const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stream')
    .setDescription('Stream status panel'),
  async execute(interaction) {
    const embed = {
      title: '📺 Stream Status',
      fields: [
        { name: 'Twitch', value: '[Check live streams](https://twitch.tv/directory)', inline: true },
        { name: 'YouTube', value: '[Check trending](https://youtube.com)', inline: true },
        { name: 'Go Live', value: '[Start streaming](https://discord.com)', inline: true },
      ],
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};