const { SlashCommandBuilder } = require('discord.js');
const whois = require('whois-json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Domain whois lookup')
    .addStringOption(option =>
      option.setName('domain')
        .setDescription('Domain name')
        .setRequired(true)),
  async execute(interaction) {
    const domain = interaction.options.getString('domain');
    
    const embed = {
      title: '🔍 Whois Lookup',
      description: `[Whois for ${domain}](https://whois.domaintools.com/${domain})`,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};