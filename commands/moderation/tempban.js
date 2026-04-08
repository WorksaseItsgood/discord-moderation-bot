const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'tempban',
  description: '⏰ Ban temporaire un membre',
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Bannir un membre temporairement')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à bannir').setRequired(true)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission de bannir.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`⏰ TEMPBAN - ${user.tag}`)
      .setColor(16711680)
      .setDescription(`Choisissez la durée du ban pour **${user.tag}**`)
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`tempban_1h_${user.id}`).setLabel('⏰ 1 heure').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`tempban_24h_${user.id}`).setLabel('⏰ 24 heures').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`tempban_7d_${user.id}`).setLabel('⏰ 7 jours').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('tempban_cancel').setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
