const { SlashCommandBuilder } = require('discord.js');
const dns = require('dns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ip')
    .setDescription('IP info lookup')
    .addStringOption(option =>
      option.setName('ip')
        .setDescription('IP address')
        .setRequired(true)),
  async execute(interaction) {
    const ip = interaction.options.getString('ip');
    
    const embed = {
      title: '🌐 IP Info',
      description: `**IP:** ${ip}\n\n[IP lookup](https://whatismyipaddress.com/${ip})`,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};