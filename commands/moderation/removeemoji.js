const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'removeemoji',
  description: '🗑️ Supprime un émoji',
  data: new SlashCommandBuilder()
    .setName('removeemoji')
    .setDescription('Supprime un émoji'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ REMOVEEMOJI')
      .setColor(16711680)
      .setDescription('Commande: Supprime un émoji')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'removeemoji', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('removeemoji_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('removeemoji_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('removeemoji_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};