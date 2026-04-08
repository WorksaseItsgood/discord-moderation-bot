const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'lock',
  description: '🔒 Verrouiller un salon',
  data: new SlashCommandBuilder().setName('lock').setDescription('Verrouiller le salon actuel'),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: '❌ Permission requise: Gérer les salons.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔒 Confirmation - Lock')
      .setColor(16711680)
      .setDescription(`Voulez-vous verrouiller ${interaction.channel} ?`)
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('lock_channel').setLabel('🔒 Verrouiller').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('lock_all').setLabel('🔐 Tout verrouiller').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('lock_cancel').setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
