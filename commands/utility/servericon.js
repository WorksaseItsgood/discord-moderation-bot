const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Get server icon'),
  async execute(interaction) {
    const guild = interaction.guild;
    const icon = guild.iconURL();
    
    if (!icon) {
      return interaction.reply({ content: 'This server has no icon!', ephemeral: true });
    }
    
    const embed = {
      title: `🏠 ${guild.name} Icon`,
      image: { url: icon },
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};