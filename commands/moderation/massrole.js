const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'massrole',
  description: '📛 Ajoute un rôle à tous',
  data: new SlashCommandBuilder()
    .setName('massrole')
    .setDescription('Ajoute un rôle à tous'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📛 MASSROLE')
      .setColor(5793266)
      .setDescription('Commande: Ajoute un rôle à tous')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'massrole', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('massrole_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('massrole_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('massrole_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};