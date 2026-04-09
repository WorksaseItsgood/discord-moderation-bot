/**
 * /ban - Bannir un utilisateur du serveur
 * Beautiful embeds with proper logging
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { addLog } from '../../database/db.js';
import { logModeration } from '../../utils/logManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setNameLocalizations({ fr: 'ban', 'en-US': 'ban' })
    .setDescription('Ban a user from the server')
    .setDescriptionLocalizations({ fr: 'Bannir un utilisateur du serveur', 'en-US': 'Ban a user from the server' })
    .addUserOption(o => o.setName('user').setNameLocalizations({ fr: 'utilisateur' }).setDescription('User to ban').setDescriptionLocalizations({ fr: 'Utilisateur à bannir' }).setRequired(true))
    .addStringOption(o => o.setName('reason').setNameLocalizations({ fr: 'raison' }).setDescription('Ban reason').setDescriptionLocalizations({ fr: 'Raison du ban' }).setRequired(false))
    .addIntegerOption(o => o.setName('delete-days').setNameLocalizations({ fr: 'supprimer-jours' }).setDescription('Days').setDescriptionLocalizations({ fr: 'Jours de messages' }).setRequired(false).setMinValue(0).setMaxValue(7)),

  name: 'ban',
  permissions: { user: [PermissionFlagsBits.BanMembers], bot: [PermissionFlagsBits.BanMembers] },

  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
      const deleteDays = interaction.options.getInteger('delete-days') || 0;

      if (!target) {
        return interaction.reply({ 
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setTitle('❌ Erreur')
            .setDescription('Veuillez spécifier un utilisateur.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true 
        });
      }

      // Beautiful confirmation embed
      const confirmEmbed = new EmbedBuilder()
        .setTitle('🔨 Confirmation de Ban')
        .setColor(0xff6b81)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
          { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
          { name: '📝 Raison', value: reason, inline: false },
          { name: '🗑️ Supprimer messages', value: `${deleteDays} jour(s)`, inline: true }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      const confirmBtn = new ButtonBuilder()
        .setCustomId(`ban_confirm_${target.id}`)
        .setLabel('✅ Confirmer le Ban')
        .setStyle(ButtonStyle.Danger);

      const cancelBtn = new ButtonBuilder()
        .setCustomId('ban_cancel')
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
        if (btn.customId === `ban_confirm_${target.id}`) {
          try {
            const member = await interaction.guild.members.fetch(target.id).catch(() => null);
            if (member) {
              await member.ban({ reason: `${reason} | Ban par ${interaction.user.tag}`, deleteMessageSeconds: deleteDays * 86400 });
            } else {
              await interaction.guild.members.ban(target.id, { reason: `${reason} | Ban par ${interaction.user.tag}` });
            }

            // Success embed
            const successEmbed = new EmbedBuilder()
              .setTitle('✅ Utilisateur banni')
              .setColor(0x00ff99)
              .setThumbnail(target.displayAvatarURL())
              .addFields(
                { name: '👤 Utilisateur', value: `${target.tag}`, inline: true },
                { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true },
                { name: '📝 Raison', value: reason, inline: false }
              )
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp();
            await btn.editReply({ embeds: [successEmbed], components: [] });

            // Log to database
            try {
              await addLog(interaction.guild.id, { action: 'ban', userId: target.id, moderatorId: interaction.user.id, reason });
            } catch {}

            // Log to mod-logs channel
            try {
              await logModeration(interaction.guild, 'ban', {
                target: target,
                moderator: interaction.user,
                reason: reason,
                extra: `Messages supprimés: ${deleteDays} jour(s)`,
              });
            } catch (e) {
              client.logger.error('[Ban] Log error:', e);
            }
          } catch (err) {
            const errorEmbed = new EmbedBuilder()
              .setColor(0xff4757)
              .setTitle('❌ Échec du ban')
              .setDescription(err.message)
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp();
            await btn.editReply({ embeds: [errorEmbed], components: [] });
          }
        } else if (btn.customId === 'ban_cancel') {
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x808080)
              .setTitle('❌ Annulé')
              .setDescription('Ban annulé par l\'utilisateur.')
              .setFooter({ text: 'Niotic Moderation' })
              .setTimestamp()],
            components: []
          });
        }
      });

      collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error('[Ban] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};
