const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'channelunblock',
  description: '✅ Débloque un salon',
  data: new SlashCommandBuilder()
    .setName('channelunblock')
    .setDescription('Débloque un salon'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('✅ CHANNELUNBLOCK')
      .setColor(65280)
      .setDescription('Commande: Débloque un salon')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'channelunblock', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('channelunblock_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('channelunblock_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('channelunblock_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};