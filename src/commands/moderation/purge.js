/**
 * /purge - Supprimer en masse des messages
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
        .setDescription('Filtrer par utilisateur (optionnel)')
        .setDescriptionLocalizations({ fr: 'Filtrer par utilisateur (optionnel)', 'en-US': 'Filter by user (optional)' })
        .setRequired(false)),

  name: 'purge',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },

  async execute(interaction, client) {
    try {
      const amount = interaction.options.getInteger('amount');
      const targetUser = interaction.options.getUser('user');
      const userId = interaction.user.id;

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
        .setColor(0xffa502)
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
        .setCustomId('purge_confirm')
        .setLabel('✅ Confirmer la purge')
        .setStyle(ButtonStyle.Danger);

      const cancelBtn = new ButtonBuilder()
        .setCustomId('purge_cancel')
        .setLabel('❌ Annuler')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

      await interaction.deferReply({ ephemeral: true });
      const reply = await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === userId,
        time: 2 * 60 * 1000,
      });

      collector.on('collect', async (btn) => {
        const cid = btn.customId;

        if (cid === 'purge_cancel') {
          await btn.deferUpdate();
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x808080)
              .setTitle('❌ Annulé')
              .setDescription('Purge annulée par l\'utilisateur.')
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp()],
            components: [],
          });
          collector.stop();
          return;
        }

        if (cid === 'purge_confirm') {
          await btn.deferUpdate();
          await btn.editReply({
            content: '🧹 Suppression en cours...',
            embeds: [],
            components: [],
          });

          const channel = interaction.channel;
          let deleted = 0;

          try {
            const fetched = await channel.messages.fetch({ limit: amount });
            let messages = targetUser
              ? fetched.filter(m => m.author.id === targetUser.id)
              : fetched;

            messages = Array.from(messages.values()).slice(0, amount);

            for (const msg of messages) {
              try {
                await msg.delete();
                deleted++;
              } catch {}
            }
          } catch (err) {
            await btn.editReply({
              content: null,
              embeds: [new EmbedBuilder()
                .setColor(0xff4757)
                .setTitle('❌ Échec de la purge')
                .setDescription(err.message)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });
            collector.stop();
            return;
          }

          await btn.editReply({
            content: null,
            embeds: [new EmbedBuilder()
              .setColor(0x00ff99)
              .setTitle('🗑️ Purge terminée')
              .setThumbnail(interaction.user.displayAvatarURL())
              .setDescription(`${deleted} message(s) supprimé(s)${targetUser ? ` de **${targetUser.tag}**` : ''}.`)
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp()],
            components: [],
          });

          try {
            await addLog(interaction.guild.id, {
              action: 'purge',
              userId: targetUser?.id || null,
              moderatorId: interaction.user.id,
              channelId: channel.id,
              amount: deleted,
            });
          } catch {}

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

          collector.stop();
        }
      });

      collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.error('[Purge] Error:', error);
      try {
        await interaction.reply({ content: `❌ Erreur: ${error.message}`, ephemeral: true });
      } catch {}
    }
  },
};
