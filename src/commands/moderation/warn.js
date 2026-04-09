/**
 * /warn - Ajouter un avertissement à un utilisateur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

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
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    if (!target) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier un utilisateur à avertir.')],
        ephemeral: true,
      });
    }

    if (!reason) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('❌ Veuillez spécifier une raison.')],
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Confirmation d\'avertissement')
      .setColor(0xffaa00)
      .addFields(
        { name: 'Utilisateur', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Raison', value: reason }
      )
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

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });

    client.buttonHandlers.set(`warn_confirm_${target.id}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const warning = {
          id: `warn_${Date.now()}`,
          reason,
          moderatorId: interaction.user.id,
          moderatorTag: interaction.user.tag,
          timestamp: Date.now(),
        };

        const { addWarning } = await import('../../../database/db.js');
        await addWarning(interaction.guild.id, target.id, warning);

        const { getWarnings } = await import('../../../database/db.js');
        const warnings = await getWarnings(interaction.guild.id, target.id);
        const warnCount = warnings.length;

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('⚠️ Avertissement ajouté')
            .setDescription(`**${target.tag}** a reçu un avertissement.\nRaison: ${reason}\nTotal des avertissements: ${warnCount}`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'warn',
          userId: target.id,
          moderatorId: interaction.user.id,
          reason,
          warnCount,
          timestamp: Date.now(),
        });

        const { addViolation } = await import('../../../database/db.js');
        await addViolation(interaction.guild.id, target.id, 1);

      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('❌ Échec de l\'avertissement').setDescription(err.message).setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`warn_confirm_${target.id}`);
      client.buttonHandlers.delete('warn_cancel');
    });

    client.buttonHandlers.set('warn_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) return;
      await btnInteraction.update({
        embeds: [new EmbedBuilder().setColor(0x808080).setDescription('❌ Avertissement annulé.')],
        components: [],
      });
      client.buttonHandlers.delete(`warn_confirm_${target.id}`);
      client.buttonHandlers.delete('warn_cancel');
    });
  },
};
