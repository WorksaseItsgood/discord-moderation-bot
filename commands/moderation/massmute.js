const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'massmute',
  description: '🔇 massmute',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🔇 MASSMUTE')
      .setColor(16755200)
      .setDescription('Commande: massmute')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'massmute', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('massmute_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('massmute_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('massmute_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};