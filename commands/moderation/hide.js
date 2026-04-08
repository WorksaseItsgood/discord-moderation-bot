const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'hide',
  description: '🙈 hide',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🙈 HIDE')
      .setColor(5793266)
      .setDescription('Commande: hide')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'hide', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('hide_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('hide_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('hide_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};