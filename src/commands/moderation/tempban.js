/**
 * /tempban - Ban temporaire un utilisateur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setNameLocalizations({ fr: 'tempban', 'en-US': 'tempban' })
    .setDescription('Ban temporaire un utilisateur')
    .setDescriptionLocalizations({ fr: 'Ban temporaire un utilisateur', 'en-US': 'Temporarily ban a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur à bannir')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur à bannir', 'en-US': 'The user to ban' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setNameLocalizations({ fr: 'durée', 'en-US': 'duration' })
        .setDescription('Durée du ban (30m, 1h, 24h, 7j, 30j)')
        .setDescriptionLocalizations({ fr: 'Durée du ban (30m, 1h, 24h, 7j, 30j)', 'en-US': 'Ban duration (30m, 1h, 24h, 7d, 30d)' })
        .addChoices(
          { name: '30 minutes', value: '30m', name_localizations: { fr: '30 minutes', 'en-US': '30 minutes' } },
          { name: '1 heure', value: '1h', name_localizations: { fr: '1 heure', 'en-US': '1 hour' } },
          { name: '24 heures', value: '24h', name_localizations: { fr: '24 heures', 'en-US': '24 hours' } },
          { name: '7 jours', value: '7d', name_localizations: { fr: '7 jours', 'en-US': '7 days' } },
          { name: '30 jours', value: '30d', name_localizations: { fr: '30 jours', 'en-US': '30 days' } }
        )
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setNameLocalizations({ fr: 'raison', 'en-US': 'reason' })
        .setDescription('Raison du ban')
        .setDescriptionLocalizations({ fr: 'Raison du ban', 'en-US': 'Reason for ban' })
        .setRequired(false)),
  name: 'tempban',
  permissions: { user: [PermissionFlagsBits.BanMembers], bot: [PermissionFlagsBits.BanMembers] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur à bannir.')],
        ephemeral: true,
      });
    }

    const durationMs = {
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const duration = durationMs[durationStr];
    if (!duration) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Durée invalide.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔨 Confirmation de ban temporaire')
      .setColor(0xff0000)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Durée', value: durationStr, inline: true },
        { name: 'Raison', value: reason }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`tempban_confirm_${target.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('tempban_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`tempban_confirm_${target.id}`, async (btnInteraction) => {
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

        const banUntil = Date.now() + duration;
        await member.ban({ reason: `${reason} | Banni par ${interaction.user.tag}`, deleteMessageDays: 1 });

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🔨 Utilisateur banni')
            .setDescription(`**${target.tag}** a été banni pour ${durationStr}.\nRaison: ${reason}\nFin du ban: <t:${Math.floor(banUntil / 1000)}:R>`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'tempban',
          userId: target.id,
          moderatorId: interaction.user.id,
          reason,
          duration: durationStr,
          banUntil,
          timestamp: Date.now(),
        });

        setTimeout(async () => {
          try {
            const bannedUsers = await interaction.guild.bans.fetch();
            const bannedUser = bannedUsers.find(u => u.user.id === target.id);
            if (bannedUser) {
              await interaction.guild.members.unban(target.id, `Tempban expiré - unbanni par le système`);
              
              const { addLog: addLogUnban } = await import('../../../database/db.js');
              await addLogUnban(interaction.guild.id, {
                action: 'tempban_unban',
                userId: target.id,
                moderatorId: client.user.id,
                reason: 'Ban temporaire expiré',
                timestamp: Date.now(),
              });
            }
          } catch (err) {
            console.error(`[Tempban] Erreur lors de l'unban automatique: ${err.message}`);
          }
        }, duration);

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec du ban').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`tempban_confirm_${target.id}`);
      client.buttonHandlers.delete('tempban_cancel');
    });

    client.buttonHandlers.set('tempban_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Ban annulé.')],
        components: [],
      });
      client.buttonHandlers.delete(`tempban_confirm_${target.id}`);
      client.buttonHandlers.delete('tempban_cancel');
    });
  },
};
