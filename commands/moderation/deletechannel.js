const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'deletechannel',
  description: '➖ Supprime un salon',
  data: new SlashCommandBuilder()
    .setName('deletechannel')
    .setDescription('Supprime un salon'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('➖ DELETECHANNEL')
      .setColor(16711680)
      .setDescription('Commande: Supprime un salon')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'deletechannel', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('deletechannel_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('deletechannel_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('deletechannel_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};