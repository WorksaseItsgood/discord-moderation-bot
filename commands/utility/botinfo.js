const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'botinfo',
  description: '🤖 botinfo',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 BOTINFO')
      .setColor(5793266)
      .setDescription('Commande: botinfo')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'botinfo', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('botinfo_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('botinfo_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('botinfo_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};