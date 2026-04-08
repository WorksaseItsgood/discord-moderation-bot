const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'uptime',
  description: '⏱️ Temps de fonctionnement',
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Temps de fonctionnement'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('⏱️ UPTIME')
      .setColor(65280)
      .setDescription('Commande: Temps de fonctionnement')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'uptime', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('uptime_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('uptime_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('uptime_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};