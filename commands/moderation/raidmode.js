const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'raidmode',
  description: '🛡️ Active le mode raid',
  data: new SlashCommandBuilder()
    .setName('raidmode')
    .setDescription('Active le mode raid'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ RAIDMODE')
      .setColor(16711680)
      .setDescription('Commande: Active le mode raid')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'raidmode', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('raidmode_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('raidmode_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('raidmode_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};