/**
 * /purge - Supprimer en masse des messages
 * Beautiful embeds with proper logging
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { addLog } from '../../database/db.js';
import { logMessage } from '../../utils/logManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setNameLocalizations({ fr: 'purge', 'en-US': 'purge' })
    .setDescription('Supprimer en masse des messages')
    .setDescriptionLocalizations({ fr: 'Supprimer en masse des messages', 'en-US': 'Bulk delete messages' })
    .addIntegerOption(option =>
      option.setName('amount')
        .setNameLocalizations({ fr: 'nombre', 'en-US': 'amount' })
        .setDescription('Nombre de messages à supprimer')
        .setDescriptionLocalizations({ fr: 'Nombre de messages à supprimer', 'en-US': 'Number of messages to delete' })
        .setMinValue(1)
        .setMaxValue(1000)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .description('Filter by user (optional)')
        .setDescriptionLocalizations({ fr: 'Filtrer par utilisateur (optionnel)', 'en-US': 'Filter by user (optional)' })
        .setRequired(false)),

  name: 'purge',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },

  async execute(interaction, client) {
    try {
      const amount = interaction.options.getInteger('amount');
      const targetUser = interaction.options.getUser('user');

      if (!amount || amount < 1 || amount > 1000) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Veuillez spécifier un nombre entre 1 et 1000.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true,
        });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('⚠️ Confirmation de purge')
        .setColor(0xff6b81)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🧹 Nombre', value: `${amount} message(s)`, inline: true },
          { name: '👤 Utilisateur', value: targetUser ? `${targetUser.tag}` : 'Tous', inline: true },
          { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true }
        )
        .setDescription('⚠️ Cette action supprimera définitivement les messages.')
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      const confirmBtn = new ButtonBuilder()
        .setCustomId(`purge_confirm_${amount}_${targetUser?.id || 'all'}`)
        .setLabel('✅ Confirmer la purge')
        .setStyle(ButtonStyle.Danger);

      const cancelBtn = new ButtonBuilder()
        .setCustomId('purge_cancel')
        .setLabel('❌ Annuler')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

      await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

      client.buttonHandlers.set(`purge_confirm_${amount}_${targetUser?.id || 'all'}`, async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
          return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
        }

        try {
          const channel = interaction.channel;
          let deleted = 0;
          let remaining = amount;

          while (remaining > 0) {
            const batchSize = Math.min(remaining, 100);
            const messages = await channel.messages.fetch({ limit: batchSize });

            if (messages.size === 0) break;

            let toDelete = targetUser
              ? messages.filter(m => m.author.id === targetUser.id)
              : messages;

            toDelete = toDelete.first(batchSize);

            for (const msg of toDelete) {
              try {
                await msg.delete();
                deleted++;
                remaining--;
              } catch {}
            }

            if (messages.size < batchSize) break;
          }

          await btnInteraction.update({
            embeds: [new EmbedBuilder()
              .setColor(0x00ff99)
              .setTitle('🗑️ Purge terminée')
              .setThumbnail(interaction.user.displayAvatarURL())
              .setDescription(`${deleted} message(s) supprimé(s)${targetUser ? ` de **${targetUser.tag}**` : ''}.`)
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp()],
            components: [],
          });

          // Log to database
          try {
            await addLog(interaction.guild.id, {
              action: 'purge',
              userId: targetUser?.id || null,
              moderatorId: interaction.user.id,
              channelId: channel.id,
              amount: deleted,
            });
          } catch {}

          // Log to message-logs channel
          try {
            await logMessage(interaction.guild, 'purge', {
              user: targetUser || { tag: 'Multiple users', id: 'N/A' },
              moderator: interaction.user,
              channel: channel.name,
              count: deleted,
            });
          } catch (e) {
            client.logger.error('[Purge] Log error:', e);
          }

          setTimeout(() => {
            btnInteraction.deleteReply().catch(() => {});
          }, 2000);

        } catch (err) {
          await btnInteraction.update({
            embeds: [new EmbedBuilder()
              .setColor(0xff4757)
              .setTitle('❌ Échec de la purge')
              .setDescription(err.message)
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp()],
            components: [],
          });
        }

        client.buttonHandlers.delete(`purge_confirm_${amount}_${targetUser?.id || 'all'}`);
        client.buttonHandlers.delete('purge_cancel');
      });

      client.buttonHandlers.set('purge_cancel', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) return;
        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x808080)
            .setDescription('❌ Purge annulée.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          components: [],
        });
        client.buttonHandlers.delete(`purge_confirm_${amount}_${targetUser?.id || 'all'}`);
        client.buttonHandlers.delete('purge_cancel');
      });
    } catch (error) {
      console.error('[Purge] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};
