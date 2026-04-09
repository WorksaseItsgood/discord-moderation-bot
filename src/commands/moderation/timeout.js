/**
 * /timeout - Mettre un utilisateur en timeout (identique à mute)
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setNameLocalizations({ fr: 'timeout', 'en-US': 'timeout' })
    .setDescription('Mettre un utilisateur en timeout')
    .setDescriptionLocalizations({ fr: 'Mettre un utilisateur en timeout', 'en-US': 'Put a user in timeout' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à mettre en timeout')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à mettre en timeout', 'en-US': 'The user to timeout' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setNameLocalizations({ fr: 'durée', 'en-US': 'duration' })
        .setDescription('Durée du timeout (1h, 24h, 7j)')
        .setDescriptionLocalizations({ fr: 'Durée du timeout (1h, 24h, 7j)', 'en-US': 'Timeout duration (1h, 24h, 7d)' })
        .addChoices(
          { name: '1 heure', value: '1h', name_localizations: { fr: '1 heure', 'en-US': '1 hour' } },
          { name: '24 heures', value: '24h', name_localizations: { fr: '24 heures', 'en-US': '24 hours' } },
          { name: '7 jours', value: '7d', name_localizations: { fr: '7 jours', 'en-US': '7 days' } }
        )
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setNameLocalizations({ fr: 'raison', 'en-US': 'reason' })
        .setDescription('Raison du timeout')
        .setDescriptionLocalizations({ fr: 'Raison du timeout', 'en-US': 'Reason for timeout' })
        .setRequired(false)),
  name: 'timeout',
  permissions: { user: [PermissionFlagsBits.MuteMembers], bot: [PermissionFlagsBits.MuteMembers] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur.')],
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
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Durée invalide.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('⏱️ Confirmation de timeout')
      .setColor(0xff9900)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Durée', value: durationStr, inline: true },
        { name: 'Raison', value: reason }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`timeout_confirm_${target.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('timeout_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`timeout_confirm_${target.id}`, async (btnInteraction) => {
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

        const timeoutUntil = Date.now() + duration;
        await member.timeout(duration, `${reason} | Timeout par ${interaction.user.tag}`);

        const { setMute } = await import('../../../database/db.js');
        await setMute(interaction.guild.id, target.id, {
          mutedAt: Date.now(),
          muteUntil: timeoutUntil,
          duration: durationStr,
          reason,
          moderatorId: interaction.user.id,
        });

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('⏱️ Timeout appliqué')
            .setDescription(`**${target.tag}** est en timeout pour ${durationStr}.\nRaison: ${reason}\nFin: <t:${Math.floor(timeoutUntil / 1000)}:R>`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'timeout',
          userId: target.id,
          moderatorId: interaction.user.id,
          reason,
          duration: durationStr,
          timeoutUntil,
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
            console.error(`[Timeout] Erreur lors de la suppression automatique: ${err.message}`);
          }
        }, duration);

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec du timeout').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`timeout_confirm_${target.id}`);
      client.buttonHandlers.delete('timeout_cancel');
    });

    client.buttonHandlers.set('timeout_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Timeout annulé.')],
        components: [],
      });
      client.buttonHandlers.delete(`timeout_confirm_${target.id}`);
      client.buttonHandlers.delete('timeout_cancel');
    });
  },
};
