/**
 * /kick - Exclure un utilisateur du serveur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

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
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur à exclure.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('🦶 Confirmation d\'exclusion')
      .setColor(0xff6600)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Raison', value: reason, inline: true }
      )
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

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`kick_confirm_${target.id}`, async (btnInteraction) => {
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

        await member.kick(`${reason} | Exclu par ${interaction.user.tag}`);

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('✅ Utilisateur exclu')
            .setDescription(`**${target.tag}** a été exclu.\nRaison: ${reason}`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'kick',
          userId: target.id,
          moderatorId: interaction.user.id,
          reason,
          timestamp: Date.now(),
        });
      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec de l\'exclusion').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`kick_confirm_${target.id}`);
      client.buttonHandlers.delete('kick_cancel');
    });

    client.buttonHandlers.set('kick_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Exclusion annulée.')],
        components: [],
      });
      client.buttonHandlers.delete(`kick_confirm_${target.id}`);
      client.buttonHandlers.delete('kick_cancel');
    });
  },
};
