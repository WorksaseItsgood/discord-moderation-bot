const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'deleterole',
  description: '🎨 Supprime un rôle',
  data: new SlashCommandBuilder()
    .setName('deleterole')
    .setDescription('Supprime un rôle'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎨 DELETEROLE')
      .setColor(16711680)
      .setDescription('Commande: Supprime un rôle')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'deleterole', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('deleterole_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('deleterole_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('deleterole_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};