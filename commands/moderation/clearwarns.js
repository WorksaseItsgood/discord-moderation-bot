const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  name: 'clearwarns',
  description: '🧹 Effacer tous les avertissements d\'un membre',
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Effacer tous les avertissements d\'un membre')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à déwarn').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '❌ Membre non trouvé.', ephemeral: true });
    }

    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission de retirer les avertissements.', ephemeral: true });
    }

    const warnings = db.getWarnings(user.id, interaction.guild.id);

    const embed = new EmbedBuilder()
      .setTitle('🧹 Confirmation - Effacer les avertissements')
      .setColor(16753920)
      .setDescription(`Voulez-vous effacer tous les avertissements de **${user.tag}** ?`)
      .addFields(
        { name: 'Utilisateur', value: `${user} (${user.id})`, inline: true },
        { name: 'Avertissements actuels', value: `${warnings.length}`, inline: true },
        { name: 'Modérateur', value: interaction.user.tag, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`clearwarns_confirm_${user.id}`).setLabel('✅ Confirmer').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`clearwarns_cancel_${user.id}`).setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  },

  async handleConfirmation(interaction) {
    const isCancel = interaction.customId.startsWith('clearwarns_cancel_');
    
    if (isCancel) {
      const cancelledEmbed = new EmbedBuilder()
        .setTitle('❌ Opération annulée')
        .setColor(16711680)
        .setDescription('Les avertissements n\'ont pas été effacés.')
        .setTimestamp()
        .setFooter({ text: 'Niotic - AntiRaid Bot' });
      return interaction.update({ embeds: [cancelledEmbed], components: [] });
    }
    
    const userId = interaction.customId.replace('clearwarns_confirm_', '');

    const user = await interaction.client.users.fetch(userId).catch(() => null);
    if (!user) {
      return interaction.update({ content: '❌ Utilisateur non trouvé.', embeds: [], components: [] });
    }

    db.clearWarnings(userId, interaction.guild.id);

    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Avertissements effacés')
      .setColor(3066993)
      .setDescription(`Tous les avertissements de **${user.tag}** ont été effacés.`)
      .addFields(
        { name: 'Utilisateur', value: `${user} (${user.id})`, inline: true },
        { name: 'Modérateur', value: interaction.user.tag, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    await interaction.update({ embeds: [successEmbed], components: [] });
  }
};
