const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'createrole',
  description: '🎨 createrole',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎨 CREATEROLE')
      .setColor(65280)
      .setDescription('Commande: createrole')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'createrole', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('createrole_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('createrole_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('createrole_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};