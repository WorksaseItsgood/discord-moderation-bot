/**
 * /unmute - Retirer le mute d'un utilisateur
 * Beautiful embeds with proper logging
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { addLog } from '../../database/db.js';
import { logModeration } from '../../utils/logManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setNameLocalizations({ fr: 'unmute', 'en-US': 'unmute' })
    .setDescription('Retirer le mute d\'un utilisateur')
    .setDescriptionLocalizations({ fr: 'Retirer le mute d\'un utilisateur', 'en-US': 'Remove mute from a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à démuter')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à démuter', 'en-US': 'The user to unmute' })
        .setRequired(true)),

  name: 'unmute',
  permissions: { user: [PermissionFlagsBits.MuteMembers], bot: [PermissionFlagsBits.MuteMembers] },

  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser('user');

      if (!target) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xff4757)
            .setDescription('❌ Veuillez spécifier un utilisateur à démuter.')
            .setFooter({ text: 'Niotic Moderation' })
            .setTimestamp()],
          ephemeral: true,
        });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('🔊 Confirmation de unmute')
        .setColor(0xffd93d)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
          { name: '🛡️ Modérateur', value: interaction.user.tag, inline: true }
        )
        .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
        .setTimestamp();

      const confirmBtn = new ButtonBuilder()
        .setCustomId(`unmute_confirm_${target.id}`)
        .setLabel('✅ Confirmer')
        .setStyle(ButtonStyle.Success);

      const cancelBtn = new ButtonBuilder()
        .setCustomId('unmute_cancel')
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
        if (btn.customId === `unmute_confirm_${target.id}`) {
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

            if (!member.isCommunicationDisabled()) {
              return btn.editReply({
                embeds: [new EmbedBuilder()
                  .setColor(0xff4757)
                  .setDescription('❌ Cet utilisateur n\'est pas muté.')
                  .setFooter({ text: 'Niotic Moderation' })
                  .setTimestamp()],
                components: [],
              });
            }

            await member.timeout(null, `Unmuté par ${interaction.user.tag}`);

            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0x00ff99)
                .setTitle('🔊 Utilisateur démuté')
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`Le mute de **${target.tag}** a été retiré.`)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });

            // Log to database
            try {
              await addLog(interaction.guild.id, {
                action: 'unmute',
                userId: target.id,
                moderatorId: interaction.user.id,
              });
            } catch {}

            // Log to mod-logs channel
            try {
              await logModeration(interaction.guild, 'unmute', {
                target: target,
                moderator: interaction.user,
                reason: 'Mute removed',
              });
            } catch (e) {
              client.logger.error('[Unmute] Log error:', e);
            }

          } catch (err) {
            await btn.editReply({
              embeds: [new EmbedBuilder()
                .setColor(0xff4757)
                .setTitle('❌ Échec du unmute')
                .setDescription(err.message)
                .setFooter({ text: 'Niotic Moderation' })
                .setTimestamp()],
              components: [],
            });
          }
        } else if (btn.customId === 'unmute_cancel') {
          await btn.editReply({
            embeds: [new EmbedBuilder()
              .setColor(0x808080)
              .setDescription('❌ Unmute annulé.')
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
      console.error('[Unmute] Error:', error);
      try {
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
      } catch {}
    }
  },
};
