const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'youtube',
  description: '▶️ Info vidéo YouTube',
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Info vidéo YouTube'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('▶️ YOUTUBE')
      .setColor(16711680)
      .setDescription('Commande: Info vidéo YouTube')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'youtube', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('youtube_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('youtube_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('youtube_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};