/**
 * /softban - Ban et immediately unban pour supprimer les messages
 * Beautiful embeds with proper logging
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { addLog } from '../../database/db.js';
import { logModeration } from '../../utils/logManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setNameLocalizations({ fr: 'softban', 'en-US': 'softban' })
    .setDescription('Ban et immediately unban pour supprimer les messages')
    .setDescriptionLocalizations({ fr: 'Ban et immediately unban pour supprimer les messages', 'en-US': 'Ban and immediately unban to delete messages' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à softban')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à softban', 'en-US': 'The user to softban' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setNameLocalizations({ fr: 'raison', 'en-US': 'reason' })
        .setDescription('Raison du softban')
        .setDescriptionLocalizations({ fr: 'Raison du softban', 'en-US': 'Reason for softban' })
        .setRequired(false)),

  name: 'softban',
  permissions: { user: [PermissionFlagsBits.BanMembers], bot: [PermissionFlagsBits.BanMembers] },

  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

      if (!target) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Veuillez spécifier un utilisateur à softban.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true,
        });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('💥 Confirmation de softban')
        .setColor(0xff6b81)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
          { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
          { name: '📝 Raison', value: reason, inline: false }
        )
        .setDescription('⚠️ Cette action banni l\'utilisateur et supprime ses messages des 7 derniers jours, puis le debanni automatiquement.')
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      const confirmBtn = new ButtonBuilder()
        .setCustomId(`softban_confirm_${target.id}`)
        .setLabel('✅ Confirmer')
        .setStyle(ButtonStyle.Danger);

      const cancelBtn = new ButtonBuilder()
        .setCustomId('softban_cancel')
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
        if (btn.customId === `softban_confirm_${target.id}`) {
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

            await member.ban({ reason: `${reason} | Softban par ${interaction.user.tag}`, deleteMessageDays: 7 });

            // Auto unban after 1 second
            setTimeout(async () => {
              try {
                await interaction.guild.members.unban(target.id, `Softban - debanni par ${interaction.user.tag}`);
              } catch {}
            }, 1000);

            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0x00ff99)
                .setTitle('💥 Softban effectué')
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`**${target.tag}** a été softbanni.\nSes messages des 7 derniers jours ont été supprimés.\nL'utilisateur a été débanni automatiquement.\nRaison: ${reason}`)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });

            // Log to database
            try {
              await addLog(interaction.guild.id, {
                action: 'softban',
                userId: target.id,
                moderatorId: interaction.user.id,
                reason,
              });
            } catch {}

            // Log to mod-logs channel
            try {
              await logModeration(interaction.guild, 'softban', {
                target: target,
                moderator: interaction.user,
                reason: reason,
              });
            } catch (e) {
              client.logger.error('[Softban] Log error:', e);
            }

          } catch (err) {
            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0xff4757)
                .setTitle('❌ Échec du softban')
                .setDescription(err.message)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });
          }
        } else if (btn.customId === 'softban_cancel') {
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x808080)
              .setDescription('❌ Softban annulé.')
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
      console.error('[Softban] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};
