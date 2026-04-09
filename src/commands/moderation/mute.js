/**
 * /mute - Muet un utilisateur temporairement
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setNameLocalizations({ fr: 'mute', 'en-US': 'mute' })
    .setDescription('Muet un utilisateur temporairement')
    .setDescriptionLocalizations({ fr: 'Muet un utilisateur temporairement', 'en-US': 'Temporarily mute a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à muter')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à muter', 'en-US': 'The user to mute' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setNameLocalizations({ fr: 'durée', 'en-US': 'duration' })
        .setDescription('Durée du mute (1h, 24h, 7j)')
        .setDescriptionLocalizations({ fr: 'Durée du mute (1h, 24h, 7j)', 'en-US': 'Mute duration (1h, 24h, 7d)' })
        .addChoices(
          { name: '1 heure', value: '1h', name_localizations: { fr: '1 heure', 'en-US': '1 hour' } },
          { name: '24 heures', value: '24h', name_localizations: { fr: '24 heures', 'en-US': '24 hours' } },
          { name: '7 jours', value: '7d', name_localizations: { fr: '7 jours', 'en-US': '7 days' } }
        )
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setNameLocalizations({ fr: 'raison', 'en-US': 'reason' })
        .setDescription('Raison du mute')
        .setDescriptionLocalizations({ fr: 'Raison du mute', 'en-US': 'Reason for mute' })
        .setRequired(false)),
  name: 'mute',
  permissions: { user: [PermissionFlagsBits.MuteMembers], bot: [PermissionFlagsBits.MuteMembers] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur à muter.')],
        ephemeral: true,
      });
    }

    const durationMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };

    const duration = durationMs[durationStr];
    if (!duration) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Durée invalide. Utilisez 1h, 24h ou 7j.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔇 Confirmation de mute')
      .setColor(0xff9900)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Durée', value: durationStr, inline: true },
        { name: 'Raison', value: reason }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`mute_confirm_${target.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('mute_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`mute_confirm_${target.id}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
          return btnInteraction.update({
            embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Membre introuvable.')],
            components: [],
          });
        }

        const muteUntil = Date.now() + duration;
        await member.timeout(duration, `${reason} | Muté par ${interaction.user.tag}`);

        const { setMute } = await import('../../../database/db.js');
        await setMute(interaction.guild.id, target.id, {
          mutedAt: Date.now(),
          muteUntil,
          duration: durationStr,
          reason,
          moderatorId: interaction.user.id,
        });

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🔇 Utilisateur muté')
            .setDescription(`**${target.tag}** a été muté pour ${durationStr}.\nRaison: ${reason}\nFin du mute: <t:${Math.floor(muteUntil / 1000)}:R>`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'mute',
          userId: target.id,
          moderatorId: interaction.user.id,
          reason,
          duration: durationStr,
          muteUntil,
          timestamp: Date.now(),
        });

        setTimeout(async () => {
          try {
            const currentMember = await interaction.guild.members.fetch(target.id).catch(() => null);
            if (currentMember && currentMember.isCommunicationDisabled()) {
              await currentMember.timeout(null);
              const { removeMute } = await import('../../../database/db.js');
              await removeMute(interaction.guild.id, target.id);
            }
          } catch (err) {
            console.error(`[Mute] Erreur lors de la suppression automatique du mute: ${err.message}`);
          }
        }, duration);

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec du mute').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`mute_confirm_${target.id}`);
      client.buttonHandlers.delete('mute_cancel');
    });

    client.buttonHandlers.set('mute_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Mute annulé.')],
        components: [],
      });
      client.buttonHandlers.delete(`mute_confirm_${target.id}`);
      client.buttonHandlers.delete('mute_cancel');
    });
  },
};
