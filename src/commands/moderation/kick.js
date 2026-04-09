/**
 * /kick - Exclure un utilisateur du serveur
 * Beautiful embeds with proper logging
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { addLog } from '../../database/db.js';
import { logModeration } from '../../utils/logManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setNameLocalizations({ fr: 'kick', 'en-US': 'kick' })
    .setDescription('Exclure un utilisateur du serveur')
    .setDescriptionLocalizations({ fr: 'Exclure un utilisateur du serveur', 'en-US': 'Kick a user from the server' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à exclure')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à exclure', 'en-US': 'The user to kick' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setNameLocalizations({ fr: 'raison', 'en-US': 'reason' })
        .setDescription('Raison de l\'exclusion')
        .setDescriptionLocalizations({ fr: 'Raison de l\'exclusion', 'en-US': 'Reason for the kick' })
        .setRequired(false)),

  name: 'kick',
  permissions: { user: [PermissionFlagsBits.KickMembers], bot: [PermissionFlagsBits.KickMembers] },

  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

      if (!target) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Veuillez spécifier un utilisateur à exclure.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true,
        });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('🦶 Confirmation d\'exclusion')
        .setColor(0xff6b81)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
          { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
          { name: '📝 Raison', value: reason, inline: false }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      const confirmBtn = new ButtonBuilder()
        .setCustomId(`kick_confirm_${target.id}`)
        .setLabel('✅ Confirmer')
        .setStyle(ButtonStyle.Danger);

      const cancelBtn = new ButtonBuilder()
        .setCustomId('kick_cancel')
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
        if (btn.customId === `kick_confirm_${target.id}`) {
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

            await member.kick(`${reason} | Exclu par ${interaction.user.tag}`);

            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0x00ff99)
                .setTitle('✅ Utilisateur exclu')
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`**${target.tag}** a été exclu.\nRaison: ${reason}`)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });

            // Log to database
            try {
              await addLog(interaction.guild.id, {
                action: 'kick',
                userId: target.id,
                moderatorId: interaction.user.id,
                reason,
              });
            } catch {}

            // Log to mod-logs channel
            try {
              await logModeration(interaction.guild, 'kick', {
                target: target,
                moderator: interaction.user,
                reason: reason,
              });
            } catch (e) {
              client.logger.error('[Kick] Log error:', e);
            }
          } catch (err) {
            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0xff4757)
                .setTitle('❌ Échec de l\'exclusion')
                .setDescription(err.message)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });
          }
        } else if (btn.customId === 'kick_cancel') {
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x808080)
              .setDescription('❌ Exclusion annulée.')
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
      console.error('[Kick] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};
