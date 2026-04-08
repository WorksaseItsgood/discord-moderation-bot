const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'lockdown',
  description: '🔒 Verrouille tous les salons',
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Verrouille tous les salons'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🔒 LOCKDOWN')
      .setColor(16711680)
      .setDescription('Commande: Verrouille tous les salons')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'lockdown', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('lockdown_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('lockdown_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('lockdown_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};