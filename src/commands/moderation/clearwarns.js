/**
 * /clearwarns - Effacer tous les avertissements d'un utilisateur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setNameLocalizations({ fr: 'clearwarns', 'en-US': 'clearwarns' })
    .setDescription('Effacer tous les avertissements d\'un utilisateur')
    .setDescriptionLocalizations({ fr: 'Effacer tous les avertissements d\'un utilisateur', 'en-US': 'Clear all warnings for a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur dont les avertissements seront effacés')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur dont les avertissements seront effacés', 'en-US': 'The user whose warnings will be cleared' })
        .setRequired(true)),
  name: 'clearwarns',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🗑️ Confirmation de suppression des avertissements')
      .setColor(0xff6600)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`clearwarns_confirm_${target.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('clearwarns_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`clearwarns_confirm_${target.id}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const { clearWarnings, getWarnings } = await import('../../../database/db.js');
        const warnings = await getWarnings(interaction.guild.id, target.id);
        const warnCount = warnings.length;

        await clearWarnings(interaction.guild.id, target.id);

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🗑️ Avertissements effacés')
            .setDescription(`Les ${warnCount} avertissement(s) de **${target.tag}** ont été effacés.`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'clearwarns',
          userId: target.id,
          moderatorId: interaction.user.id,
          warnCount,
          timestamp: Date.now(),
        });

        const { resetViolations } = await import('../../../database/db.js');
        await resetViolations(interaction.guild.id, target.id);

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`clearwarns_confirm_${target.id}`);
      client.buttonHandlers.delete('clearwarns_cancel');
    });

    client.buttonHandlers.set('clearwarns_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Opération annulée.')],
        components: [],
      });
      client.buttonHandlers.delete(`clearwarns_confirm_${target.id}`);
      client.buttonHandlers.delete('clearwarns_cancel');
    });
  },
};
