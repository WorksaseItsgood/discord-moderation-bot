const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Get user banner')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get banner of')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const banner = user.bannerURL();
    
    if (!banner) {
      return interaction.reply({ content: `${user} has no banner!`, ephemeral: true });
    }
    
    const embed = {
      title: `🏴 ${user.tag} Banner`,
      image: { url: banner },
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};