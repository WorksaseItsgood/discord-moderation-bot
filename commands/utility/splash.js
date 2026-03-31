const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('splash')
    .setDescription('Get server invite splash'),
  async execute(interaction) {
    const guild = interaction.guild;
    const splash = guild.splashURL();
    
    if (!splash) {
      return interaction.reply({ content: 'This server has no splash!', ephemeral: true });
    }
    
    const embed = {
      title: `🖼️ ${guild.name} Splash`,
      image: { url: splash },
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};