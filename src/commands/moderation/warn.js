/**
 * /warn - Ajouter un avertissement à un utilisateur
 * Beautiful embeds with proper logging
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { addWarning, getWarnings, addLog, addViolation } from '../../database/db.js';
import { logModeration } from '../../utils/logManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setNameLocalizations({ fr: 'warn', 'en-US': 'warn' })
    .setDescription('Ajouter un avertissement à un utilisateur')
    .setDescriptionLocalizations({ fr: 'Ajouter un avertissement à un utilisateur', 'en-US': 'Add a warning to a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à avertir')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à avertir', 'en-US': 'The user to warn' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setNameLocalizations({ fr: 'raison', 'en-US': 'reason' })
        .setDescription('Raison de l\'avertissement')
        .setDescriptionLocalizations({ fr: 'Raison de l\'avertissement', 'en-US': 'Reason for the warning' })
        .setRequired(true)),

  name: 'warn',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },

  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      if (!target) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Veuillez spécifier un utilisateur à avertir.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true,
        });
      }

      if (!reason) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Veuillez spécifier une raison.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true,
        });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('⚠️ Confirmation d\'avertissement')
        .setColor(0xffa502)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
          { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
          { name: '📝 Raison', value: reason, inline: false }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      const confirmBtn = new ButtonBuilder()
        .setCustomId(`warn_confirm_${target.id}`)
        .setLabel('✅ Confirmer')
        .setStyle(ButtonStyle.Danger);

      const cancelBtn = new ButtonBuilder()
        .setCustomId('warn_cancel')
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
        if (btn.customId === `warn_confirm_${target.id}`) {
          try {
            const warning = {
              reason,
              moderatorId: interaction.user.id,
              moderatorTag: interaction.user.tag,
            };

            await addWarning(interaction.guild.id, target.id, warning);
            const warnings = await getWarnings(interaction.guild.id, target.id);
            const warnCount = warnings.length;

            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0x00ff99)
                .setTitle('⚠️ Avertissement ajouté')
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`**${target.tag}** a reçu un avertissement.\nRaison: ${reason}\nTotal des avertissements: ${warnCount}`)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });

            // Log to database
            try {
              await addLog(interaction.guild.id, {
                action: 'warn',
                userId: target.id,
                moderatorId: interaction.user.id,
                reason,
                warnCount,
              });
            } catch {}

            // Log to mod-logs channel
            try {
              await logModeration(interaction.guild, 'warn', {
                target: target,
                moderator: interaction.user,
                reason: reason,
                points: 1,
                extra: `Total warnings: ${warnCount}`,
              });
            } catch (e) {
              client.logger.error('[Warn] Log error:', e);
            }

            // Add violation point
            try {
              await addViolation(interaction.guild.id, target.id, 1);
            } catch {}

          } catch (err) {
            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0xff4757)
                .setTitle('❌ Échec de l\'avertissement')
                .setDescription(err.message)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });
          }
        } else if (btn.customId === 'warn_cancel') {
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x808080)
              .setDescription('❌ Avertissement annulé.')
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
      console.error('[Warn] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};
