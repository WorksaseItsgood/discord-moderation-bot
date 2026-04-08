const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'channelinfo',
  description: '📁 channelinfo',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📁 CHANNELINFO')
      .setColor(5793266)
      .setDescription('Commande: channelinfo')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'channelinfo', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('channelinfo_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('channelinfo_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('channelinfo_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};