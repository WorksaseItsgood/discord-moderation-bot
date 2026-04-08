const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: '🔓 Déverrouiller un salon',
  data: new SlashCommandBuilder().setName('unlock').setDescription('Déverrouiller le salon actuel'),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: '❌ Permission requise: Gérer les salons.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔓 Confirmation - Unlock')
      .setColor(65280)
      .setDescription(`Voulez-vous déverrouiller ${interaction.channel} ?`)
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('unlock_channel').setLabel('🔓 Déverrouiller').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('unlock_cancel').setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
