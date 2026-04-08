const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'giveaway',
  description: '🎉 Créer un giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Créer un giveaway'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎉 GIVEAWAY')
      .setColor(16711935)
      .setDescription('Commande: Créer un giveaway')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'giveaway', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('giveaway_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('giveaway_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('giveaway_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};