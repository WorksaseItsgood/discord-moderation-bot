/**
 * /removechannel - Supprimer un salon
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export default {
  name: 'removechannel',
  description: 'Supprimer un salon',
  permissions: {
    user: [PermissionFlagsBits.ManageChannels],
    bot: [PermissionFlagsBits.ManageChannels],
  },

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';

    if (!channel) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xff0000)
          .setDescription('❌ Veuillez spécifier un salon à supprimer.')],
        ephemeral: true,
      });
    }

    // Confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('🗑️ Confirmation de suppression de salon')
      .setColor(0xff6600)
      .addFields(
        { name: 'Salon', value: `${channel.name} (${channel.id})`, inline: true },
        { name: 'Type', value: channel.type.toString(), inline: true },
        { name: 'Raison', value: reason, inline: true }
      )
      .setTimestamp();

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`removechannel_confirm_${channel.id}`)
      .setLabel('✅ Confirmer')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('removechannel_cancel')
      .setLabel('❌ Annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
      ephemeral: true,
    });

    client.buttonHandlers.set(`removechannel_confirm_${channel.id}`, async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      try {
        const channelName = channel.name;
        await channel.delete(`${reason} | Supprimé par ${interaction.user.tag}`);

        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('✅ Salon supprimé')
            .setDescription(`Le salon **${channelName}** a été supprimé.\nRaison: ${reason}`)
            .setTimestamp()],
          components: [],
        });

        const { addLog } = await import('../../../database/db.js');
        await addLog(interaction.guild.id, {
          action: 'removechannel',
          channelName,
          channelId: channel.id,
          moderatorId: interaction.user.id,
          reason,
          timestamp: Date.now(),
        });
      } catch (err) {
        await btnInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('❌ Erreur')
            .setDescription(err.message)
            .setTimestamp()],
          components: [],
        });
      }

      client.buttonHandlers.delete(`removechannel_confirm_${channel.id}`);
      client.buttonHandlers.delete('removechannel_cancel');
    });

    client.buttonHandlers.set('removechannel_cancel', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: '❌ Vous ne pouvez pas utiliser ce bouton.', ephemeral: true });
      }

      await btnInteraction.update({
        embeds: [new EmbedBuilder()
          .setColor(0x808080)
          .setDescription('❌ Suppression de salon annulée.')],
        components: [],
      });

      client.buttonHandlers.delete(`removechannel_confirm_${channel.id}`);
      client.buttonHandlers.delete('removechannel_cancel');
    });
  },
};
