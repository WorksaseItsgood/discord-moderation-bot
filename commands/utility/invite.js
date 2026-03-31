const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get bot invite link'),
  async execute(interaction) {
    const embed = {
      title: '🤖 Bot Invite',
      description: '[Invite the bot](https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands)',
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};