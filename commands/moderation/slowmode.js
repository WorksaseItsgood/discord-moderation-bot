const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'slowmode',
  description: '🐌 Définir le slowmode',
  data: new SlashCommandBuilder().setName('slowmode').setDescription('Définir le slowmode du salon'),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: '❌ Permission requise: Gérer les salons.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🐌 Slowmode')
      .setColor(16755200)
      .setDescription(`Définir le slowmode pour ${interaction.channel}`)
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('slowmode_off').setLabel('Off').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('slowmode_5s').setLabel('5s').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('slowmode_10s').setLabel('10s').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('slowmode_30s').setLabel('30s').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('slowmode_1m').setLabel('1m').setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
