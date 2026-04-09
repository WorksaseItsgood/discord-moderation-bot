/**
 * /softban - Ban et immediately unban pour supprimer les messages
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

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
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur à softban.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('💥 Confirmation de softban')
      .setColor(0xff0000)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Raison', value: reason }
      )
      .setDescription('⚠️ Cette action banni l\'utilisateur et supprime ses messages des 7 derniers jours, puis le debanni automatiquement.')
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

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`softban_confirm_${target.id}`, async (btnInteraction) => {
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

        await member.ban({ reason: `${reason} | Softban par ${interaction.user.tag}`, deleteMessageDays: 7 });

        const unbanned = await new Promise(async (resolve) => {
          setTimeout(async () => {
            try {
              await interaction.guild.members.unban(target.id, `Softban - debanni par ${interaction.user.tag}`);
              resolve(true);
            } catch {
              resolve(false);
            }
          }, 1000);
        });

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('💥 Softban effectué')
            .setDescription(`**${target.tag}** a été softbanni.\nSes messages des 7 derniers jours ont été supprimés.\nL'utilisateur a été débanni automatiquement.\nRaison: ${reason}`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'softban',
          userId: target.id,
          moderatorId: interaction.user.id,
          reason,
          timestamp: Date.now(),
        });

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec du softban').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`softban_confirm_${target.id}`);
      client.buttonHandlers.delete('softban_cancel');
    });

    client.buttonHandlers.set('softban_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Softban annulé.')],
        components: [],
      });
      client.buttonHandlers.delete(`softban_confirm_${target.id}`);
      client.buttonHandlers.delete('softban_cancel');
    });
  },
};
