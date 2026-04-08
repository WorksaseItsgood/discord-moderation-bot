const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'shorturl',
  description: '🔗 Raccourcir une URL',
  data: new SlashCommandBuilder()
    .setName('shorturl')
    .setDescription('Raccourcir une URL'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🔗 SHORTURL')
      .setColor(5793266)
      .setDescription('Commande: Raccourcir une URL')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'shorturl', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('shorturl_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('shorturl_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('shorturl_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};