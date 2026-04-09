/**
 * /mute - Muet un utilisateur temporairement
 * Beautiful embeds with proper logging
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { addLog } from '../../database/db.js';
import { logModeration } from '../../utils/logManager.js';

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
    try {
      const target = interaction.options.getUser('user');
      const durationStr = interaction.options.getString('duration');
      const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

      if (!target) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Veuillez spécifier un utilisateur à muter.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
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
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Durée invalide.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true,
        });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('🔇 Confirmation de mute')
        .setColor(0xffd93d)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
          { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
          { name: '⏱️ Durée', value: durationStr, inline: true },
          { name: '📝 Raison', value: reason, inline: false }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
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
      const userId = interaction.user.id;

      await interaction.deferReply({ ephemeral: true });
      const reply = await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === userId,
        time: 5 * 60 * 1000,
      });

      collector.on('collect', async (btn) => {
        await btn.deferUpdate();
        if (btn.customId === `mute_confirm_${target.id}`) {
          try {
            const member = await interaction.guild.members.fetch(target.id).catch(() => null);
            if (!member) {
              return btn.editReply({
                embeds: [new EmbedBuilder()
                  .setColor(0xff4757)
                  .setDescription('❌ Membre introuvable.')
                  .setFooter({ text: 'Niotic Moderation' })
                  .setTimestamp()],
                components: [],
              });
            }

            const muteUntil = Date.now() + duration;
            await member.timeout(duration, `${reason} | Muté par ${interaction.user.tag}`);

            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0x00ff99)
                .setTitle('🔇 Utilisateur muté')
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`**${target.tag}** a été muté pour ${durationStr}.\nRaison: ${reason}\nFin du mute: <t:${Math.floor(muteUntil / 1000)}:R>`)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });

            // Log to database
            try {
              await addLog(interaction.guild.id, {
                action: 'mute',
                userId: target.id,
                moderatorId: interaction.user.id,
                reason,
                duration: durationStr,
                muteUntil,
              });
            } catch {}

            // Log to mod-logs channel
            try {
              await logModeration(interaction.guild, 'mute', {
                target: target,
                moderator: interaction.user,
                reason: reason,
                duration: durationStr,
              });
            } catch (e) {
              client.logger.error('[Mute] Log error:', e);
            }

            // Auto-unmute after duration
            setTimeout(async () => {
              try {
                const currentMember = await interaction.guild.members.fetch(target.id).catch(() => null);
                if (currentMember && currentMember.isCommunicationDisabled()) {
                  await currentMember.timeout(null);
                }
              } catch (err) {
                client.logger.error(`[Mute] Auto-unmute error: ${err.message}`);
              }
            }, duration);

          } catch (err) {
            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0xff4757)
                .setTitle('❌ Échec du mute')
                .setDescription(err.message)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });
          }
        } else if (btn.customId === 'mute_cancel') {
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x808080)
              .setDescription('❌ Mute annulé.')
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp()],
            components: [],
          });
        }
      });

      collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error('[Mute] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};
